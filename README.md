# ShopKart

**ShopKart** is a full‑stack MERN e‑commerce application built as part of the 2029 Lab assignments. It demonstrates core concepts of React, Node/Express, MongoDB, authentication, and payment integration while following clean, production‑ready patterns.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [API Overview](#api-overview)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- User registration & login with JWT authentication
- Product catalog with pagination & search
- Shopping cart & wishlist (persisted in MongoDB)
- Order placement with Razorpay payment gateway integration
- Role‑based protected routes (admin vs regular user)
- Responsive UI built with vanilla CSS (modern design – glassmorphism, dark mode, micro‑animations)
- Comprehensive unit tests for backend controllers

---

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router, Context API |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB (Atlas or local) |
| Auth | JWT, bcrypt for password hashing |
| Payments | Razorpay SDK |
| Testing | Jest & Supertest (backend) |
| CI/CD | (optional) GitHub Actions |

---

## Prerequisites
- **Node.js** (v20 or later) and **npm**
- **MongoDB** instance (local or Atlas) – connection string in `backend/.env`
- **Razorpay** account credentials (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` in `.env`)
- **Git** for version control

---

## Installation
```bash
# Clone the repository (if you haven't already)
# git clone https://github.com/Darshana232/ShopKart.git
# cd ShopKart

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

Create a `.env` file in `backend/` (copy from `.env.example` if present) and fill in:
```
MONGO_URI=mongodb://localhost:27017/shopkart
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
PORT=5000
```

---

## Running the App
**Development mode** (both front and back run concurrently):
```bash
# In one terminal – start the backend
cd backend && npm run dev

# In another terminal – start the Vite dev server
cd frontend && npm run dev
```
The backend will listen on `http://localhost:5000` and the frontend on `http://localhost:5173` (default Vite port). Open the frontend URL in a browser to explore the store.

**Production build**:
```bash
# Build frontend assets
cd frontend && npm run build

# Serve static files via Express (backend already serves them in production mode)
cd ../backend && npm start
```
The app will be available at `http://localhost:5000`.

---

## API Overview
All API routes are prefixed with `/api/v1`.
- **Auth**: `/api/v1/auth/register`, `/api/v1/auth/login`
- **Products**: `/api/v1/products` (GET, POST, PUT, DELETE – admin only for mutating)
- **Cart**: `/api/v1/cart` (GET, POST, DELETE)
- **Wishlist**: `/api/v1/wishlist`
- **Orders**: `/api/v1/orders` (POST to create order, GET to list user orders)
- **Payments**: `/api/v1/payments/checkout` (Razorpay order creation)

Each route uses Express middleware for authentication (`authMiddleware`) and role checks where appropriate. See `backend/middlewares` for implementation details.

---

## Testing
```bash
# Run backend tests
cd backend && npm test
```
Tests are located in `backend/tests/` and cover controllers, services, and middleware logic.

---

## Deployment
The repository can be containerised with a `Dockerfile` (add one if needed) and deployed to platforms like Render, Railway, or AWS Elastic Beanstalk. Set the required environment variables (`MONGO_URI`, `JWT_SECRET`, `RAZORPAY_*`, `PORT`) in your hosting environment and point `MONGO_URI` to a managed MongoDB cluster.

---

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes and push (`git push origin feature/your-feature`)
4. Open a Pull Request

Please follow the existing code style, write unit tests for new functionality, and ensure the CI pipeline passes.

---

## License
This project is licensed under the MIT License – see the `LICENSE` file for details.
