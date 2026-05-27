# AtlasVoyage — MERN travel booking

Full-stack demo: **MongoDB**, **Express**, **React (Vite)**, **Node.js**, **JWT + bcrypt**, **Socket.io** support chat, **OpenStreetMap + OSRM** routing (optional **Google Maps** embed), **Multer** image uploads for hotels, and an **admin** area.

## Folder structure

```
travel/
├── server/                 # Express API + Socket.io
│   ├── package.json
│   ├── .env.example
│   ├── uploads/            # Multer stores images here (gitignored except .gitkeep)
│   └── src/
│       ├── index.js        # HTTP server, REST mounts, Socket.io
│       ├── config/
│       ├── models/         # User, Booking, Hotel, HotelBooking, Feedback, Contact, Message
│       ├── routes/
│       ├── controllers/
│       ├── middleware/
│       ├── utils/
│       └── seed/seed.js    # Sample users, hotels, bookings, feedback, contact
├── src/                    # React + Tailwind UI
│   ├── api/client.js
│   ├── context/AuthContext.jsx
│   ├── components/
│   └── pages/
├── package.json            # Vite frontend
├── .env.example
└── README.md
```

## Prerequisites

- Node.js 18+
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier) or local MongoDB

## 1. MongoDB Atlas

1. Create a cluster → **Database** → **Connect** → Drivers → copy the connection string.
2. Replace `<password>` and set a database name, e.g. `travel_booking`:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/travel_booking?retryWrites=true&w=majority`

## 2. Backend setup

```bash
cd server
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET (long random string), PORT=5000, CLIENT_URL=http://localhost:5173
npm install
npm run seed    # optional: demo admin, demo user, hotels, sample bookings
npm run dev     # or npm start
```

- **Health:** `GET http://localhost:5000/api/health`
- **Demo accounts (after seed):**
  - Admin: `admin@travelbook.com` / `Password123`
  - User: `demo@travelbook.com` / `Password123`

## 3. Frontend setup

From the repo root:

```bash
cp .env.example .env
# VITE_API_URL=http://localhost:5000  (or leave empty and rely on Vite proxy + same-origin socket — see below)
npm install
npm run dev
```

Open `http://localhost:5173`.

**API base URL**

- If `VITE_API_URL` is **empty**, the app calls `/api/...` on the Vite dev server; `vite.config.js` proxies `/api`, `/uploads`, and `/socket.io` to port **5000**.
- If you set `VITE_API_URL=http://localhost:5000`, the browser talks to the API directly; ensure CORS in `server/.env` includes your dev origin (`CLIENT_URL`).

**Optional Google Maps embed**

- Add `VITE_GOOGLE_MAPS_KEY` in `.env` for the embedded directions iframe on **Map & route** (billing/terms apply per Google).

## API overview

| Area | Endpoints |
|------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Transport | `POST/GET /api/bookings`, `GET /api/bookings/:id`, `PATCH /api/bookings/:id/cancel` |
| Hotels | `GET /api/hotels`, `GET /api/hotels/:id` (query: `q`, `minPrice`, `maxPrice`, `minRating`, `page`, `limit`) |
| Hotel stays | `POST/GET /api/hotel-bookings` |
| Feedback | `POST/GET /api/feedback` |
| Contact | `POST /api/contact` |
| Chat history | `GET /api/messages` |
| Upload | `POST /api/upload` (admin, `multipart/form-data` field `image`) |
| Admin | `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`, `GET/PATCH .../bookings`, `GET/PATCH .../hotel-bookings`, `POST/PATCH/DELETE .../hotels`, `POST .../hotels/:id/images`, `GET .../contacts`, `GET .../feedbacks` |

Socket.io: connect to the same host as the API, path `/socket.io`, event `chat:message` payload `{ text, senderName? }`, broadcast `chat:message`.

## Production notes

- Set strong `JWT_SECRET`, restrict `CLIENT_URL` to your real site(s).
- Serve the Vite `dist/` folder via CDN/static host or reverse proxy; point `VITE_API_URL` at your API domain.
- Use HTTPS; configure Atlas IP allowlist / VPC as needed.
- Consider upgrading **Multer** to 2.x when stable for your stack.

## License

MIT (demo project).
