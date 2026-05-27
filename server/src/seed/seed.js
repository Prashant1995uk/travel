import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';
import HotelBooking from '../models/HotelBooking.js';
import Feedback from '../models/Feedback.js';
import Contact from '../models/Contact.js';
import SiteSetting from '../models/SiteSetting.js';
import Destination from '../models/Destination.js';
import Bike from '../models/Bike.js';
import BikeBooking from '../models/BikeBooking.js';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Set MONGODB_URI in server/.env');
  process.exit(1);
}

const sampleHotels = [
  {
    name: 'Heritage Haveli Jaipur',
    location: 'Pink City, Jaipur',
    city: 'Jaipur',
    country: 'India',
    pricePerNight: 4200,
    rating: 4.6,
    description: 'Courtyard views near Hawa Mahal with rooftop dining.',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    ],
  },
  {
    name: 'Kedarnath Base Camp Lodge',
    location: 'Gaurikund trailhead',
    city: 'Rudraprayag',
    country: 'India',
    pricePerNight: 2800,
    rating: 4.3,
    description: 'Warm rooms for pilgrims with mountain sunrise views.',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    ],
  },
  {
    name: 'Tungnath Alpine Stay',
    location: 'Chopta, Uttarakhand',
    city: 'Chopta',
    country: 'India',
    pricePerNight: 3100,
    rating: 4.5,
    description: 'Cozy stay closest to the highest Shiva temple.',
    images: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800',
    ],
  },
  {
    name: 'Ganges View Kashi',
    location: 'Dashashwamedh Ghat, Varanasi',
    city: 'Varanasi',
    country: 'India',
    pricePerNight: 3500,
    rating: 4.7,
    description: 'River-facing rooms steps from evening aarti.',
    images: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
    ],
  },
];

const sampleDestinations = [
  {
    name: 'Jaipur',
    city: 'Jaipur',
    country: 'India',
    description: 'Pink City palaces, bazaars, and forts.',
    featuredPhotos: ['https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800'],
  },
  {
    name: 'Rishikesh',
    city: 'Rishikesh',
    country: 'India',
    description: 'Ganga ghats, rafting, and Himalayan foothills.',
    featuredPhotos: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
  },
];

async function run() {
  await mongoose.connect(uri);
  console.log('Connected. Seeding...');

  const adminEmail = 'admin@travelbook.com';
  const userEmail = 'demo@travelbook.com';
  const password = await bcrypt.hash('Password123', 12);

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password,
      role: 'admin',
    });
    console.log('Created admin:', adminEmail, '/ Password123');
  } else {
    console.log('Admin exists:', adminEmail);
  }

  let demo = await User.findOne({ email: userEmail });
  if (!demo) {
    demo = await User.create({
      name: 'Demo Traveler',
      email: userEmail,
      password,
      role: 'user',
    });
    console.log('Created demo user:', userEmail, '/ Password123');
  } else {
    console.log('Demo user exists:', userEmail);
  }

  const hotelCount = await Hotel.countDocuments();
  if (hotelCount === 0) {
    await Hotel.insertMany(sampleHotels);
    console.log('Inserted sample hotels');
  } else {
    console.log('Hotels already present, skipping hotel seed');
  }

  await SiteSetting.findOneAndUpdate({ key: 'siteName' }, { value: 'Nature Touch' }, { upsert: true });

  if ((await Destination.countDocuments()) === 0) {
    await Destination.insertMany(sampleDestinations);
    console.log('Inserted sample destinations');
  }

  const dests = await Destination.find().limit(2);
  if (dests.length && (await Bike.countDocuments()) === 0) {
    await Bike.insertMany([
      { title: 'Royal Enfield Classic', destination: dests[0]._id, bikeType: 'Cruiser', price: 1200 },
      { title: 'Himalayan Adventure', destination: dests[1]._id, bikeType: 'Adventure', price: 1500 },
    ]);
    console.log('Inserted sample bikes');
  }

  const hotels = await Hotel.find().limit(4);
  if (hotels.length && demo) {
    const existingBookings = await Booking.countDocuments({ user: demo._id });
    if (existingBookings === 0) {
      await Booking.create({
        user: demo._id,
        bookingType: 'flight',
        date: new Date(Date.now() + 86400000 * 7),
        time: '10:30',
        source: 'Delhi (DEL)',
        destination: 'Jaipur (JAI)',
        price: 4500,
        passengerName: demo.name,
        passengerEmail: demo.email,
        passengerPhone: '+919999000000',
        status: 'confirmed',
      });
      await Booking.create({
        user: demo._id,
        bookingType: 'bus',
        date: new Date(Date.now() + 86400000 * 14),
        time: '06:00',
        source: 'Haridwar',
        destination: 'Kedarnath (Gaurikund)',
        price: 1200,
        passengerName: demo.name,
        passengerEmail: demo.email,
        status: 'confirmed',
      });
      console.log('Inserted sample transport bookings for demo user');
    }

    const hb = await HotelBooking.countDocuments({ user: demo._id });
    if (hb === 0 && hotels[0]) {
      const checkIn = new Date(Date.now() + 86400000 * 3);
      const checkOut = new Date(Date.now() + 86400000 * 6);
      const nights = 3;
      await HotelBooking.create({
        user: demo._id,
        hotel: hotels[0]._id,
        checkIn,
        checkOut,
        guests: 2,
        totalPrice: nights * hotels[0].pricePerNight * 2,
        guestName: demo.name,
        guestEmail: demo.email,
        status: 'confirmed',
      });
      console.log('Inserted sample hotel booking for demo user');
    }
  }

  if ((await Feedback.countDocuments()) === 0) {
    await Feedback.create({
      name: 'Priya',
      email: 'priya@example.com',
      rating: 5,
      comment: 'Smooth booking for Jaipur — loved the hotel suggestions.',
      category: 'general',
      approved: true,
    });
    console.log('Inserted sample feedback');
  }

  if ((await Contact.countDocuments()) === 0) {
    await Contact.create({
      name: 'Rahul',
      email: 'rahul@example.com',
      message: 'Do you offer group discounts for Char Dham?',
    });
    console.log('Inserted sample contact');
  }

  const bikes = await Bike.find().limit(2);
  if (bikes.length && demo) {
    const bb = await BikeBooking.countDocuments({ user: demo._id });
    if (bb === 0) {
      await BikeBooking.create({
        user: demo._id,
        destination: bikes[0].destination,
        bike: bikes[0]._id,
        date: new Date(Date.now() + 86400000 * 5),
        time: '09:00',
        price: bikes[0].price,
        status: 'approved',
      });
      console.log('Inserted sample bike booking for demo user');
    }
  }

  console.log('Seed complete.');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
