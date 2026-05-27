import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import hotelBookingRoutes from './routes/hotelBookingRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import bikeRoutes from './routes/bikeRoutes.js';
import Message from './models/Message.js';
import User from './models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);

const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const io = new Server(server, {
  cors: { origin: clientOrigins, methods: ['GET', 'POST'], credentials: true },
});

app.use(
  cors({
    origin: clientOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'travel-booking-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/hotel-bookings', hotelBookingRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/bike', bikeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    socket.userId = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    socket.userId = null;
    next();
  }
});

io.on('connection', (socket) => {
  const room = 'support';
  socket.join(room);

  socket.on('chat:message', async (payload, ack) => {
    const text = (payload?.text || '').trim().slice(0, 2000);
    if (!text) {
      if (typeof ack === 'function') ack({ ok: false, error: 'Empty message' });
      return;
    }
    let senderName = (payload?.senderName || 'Guest').trim().slice(0, 80);
    if (socket.userId) {
      const user = await User.findById(socket.userId).select('name');
      if (user?.name) senderName = user.name;
    }
    try {
      const doc = await Message.create({
        room,
        senderId: socket.userId || null,
        senderName,
        text,
      });
      const out = {
        id: doc._id.toString(),
        senderName: doc.senderName,
        text: doc.text,
        createdAt: doc.createdAt,
        senderId: doc.senderId?.toString() || null,
      };
      io.to(room).emit('chat:message', out);
      if (typeof ack === 'function') ack({ ok: true, message: out });
    } catch {
      if (typeof ack === 'function') ack({ ok: false, error: 'Failed to save message' });
    }
  });
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

const port = Number(process.env.PORT) || 5000;

async function start() {
  await connectDB();
  server.listen(port, () => {
    console.log(`API + Socket.io on http://localhost:${port}`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
