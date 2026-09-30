# 🏨 Havenza — Full-Stack Hotel Booking & Reservation Platform

[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)

> A modern, scalable **MERN Stack** hotel reservation platform featuring multi-role access control for Guests, Hotel Owners, and Administrators. Includes real-time room availability search, dynamic pricing, Stripe payment gateway, and an automated booking management pipeline.

---

## 🌟 Core Features

### 👤 For Guests & Travelers
- **Intuitive Hotel & Room Discovery**: Multi-filter search by location, price range, room amenities, and guest capacity.
- **Detailed Room Previews**: High-resolution image galleries, room specs, cancellation policies, and verified customer reviews.
- **Secure Stripe Checkout**: Seamless, PCI-compliant payment gateway integration for instant booking confirmations.
- **My Bookings Dashboard**: Real-time reservation status tracking (`Confirmed`, `Pending`, `Checked Out`, `Cancelled`) with automated PDF invoice receipts.
- **Customer Reviews**: Rate and review properties following completed stays.

### 🏢 For Hotel Owners & Hosts
- **Room & Inventory Management**: Add, edit, or remove rooms with dynamic pricing, bed types, and amenity checklists.
- **Host Dashboard & Analytics**: Overview of total bookings, occupancy rates, earnings, and checkout status.
- **Booking History & Checkout Manager**: Track check-in / check-out schedules and pending payments.
- **Guest Review Moderation**: View customer feedback and manage ratings.

### 🛡️ For System Administrators
- **Platform Governance**: Review and approve new hotel partner listings before they go live.
- **Analytics & Reporting**: System-wide performance metrics, revenue tracking, and dispute management.
- **Role-Based Access Control (RBAC)**: Secure access isolation between User, Hotel Owner, and Admin portals.

---

## 🏗️ System Architecture

               ┌────────────────────────────────────────┐
               │             React Client               │
               │  (Vite, Tailwind CSS, Context API)     │
               └──────────────────┬─────────────────────┘
                                  │ REST / JSON
                                  ▼
               ┌────────────────────────────────────────┐
               │        Node.js & Express Server        │
               │    (JWT Auth, Stripe Webhooks, CORS)   │
               └──────────────────┬─────────────────────┘
                                  │ Mongoose ODM
                                  ▼
               ┌────────────────────────────────────────┐
               │           MongoDB Database             │
               │    (Users, Hotels, Rooms, Bookings)    │
               └────────────────────────────────────────┘

---

## 🗄️ Database Models

| Model | Key Fields | Description |
|---|---|---|
| **`User`** | `name`, `email`, `password`, `role`, `avatar` | Stores credentials and roles (`user`, `hotelOwner`, `admin`). |
| **`Hotel`** | `name`, `ownerId`, `address`, `city`, `rating`, `images` | Property profiles and vendor verification status. |
| **`Room`** | `hotelId`, `roomType`, `pricePerNight`, `amenities`, `images` | Room inventory and availability states. |
| **`Booking`** | `userId`, `roomId`, `checkIn`, `checkOut`, `totalAmount`, `status` | Reservation details, payment intents, and stay records. |
| **`Review`** | `userId`, `hotelId`, `rating`, `comment` | Verified guest ratings and reviews. |

---

## 📁 Repository Structure

```text
Havenza-Hotel-booking-platform/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/        # Navbar, Hero, HotelCard, Modals, Admin components
│   │   ├── pages/             # Home, RoomDetails, MyBookings, HotelOwner Dashboard
│   │   ├── context/           # Global auth & booking context state
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── server/                    # Node.js & Express backend API
    ├── configs/               # Database connection & Cloudinary setup
    ├── controllers/           # Auth, Hotel, Room, and Booking controllers
    ├── middleware/            # Auth verification & file upload handlers
    ├── models/                # MongoDB schemas (User, Hotel, Room, Booking)
    ├── routes/                # API route definitions
    └── server.js              # Application entry point
```


---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v18+)
- [MongoDB](https://www.mongodb.com) (Local instance or MongoDB Atlas)
- [Stripe Account](https://stripe.com) (Test API keys)

### 1. Backend Setup
```bash
cd server

# Install dependencies
npm install

# Setup environment variables in .env
# PORT=5000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# STRIPE_SECRET_KEY=your_stripe_secret_key

# Run the server
npm run dev
# or: node server.js

```

### 2. Frontend Setup
```
cd client

# Install dependencies
npm install

# Setup environment variables in .env
# VITE_API_URL=http://localhost:5000

# Start Vite dev server
npm run dev
