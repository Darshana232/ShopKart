# ShopKart MERN E-Commerce: Teachings & Concepts

This document contains all the instructional comments, architecture explanations, and MERN concepts that were applied during the development of the ShopKart application. It serves as your personal study guide, separating the teachings from the clean production code.

## Lab 01: Backend Architecture & Authentication

### The Concept: RESTful API and Authentication
**Why we need it:** 
A frontend needs a secure way to communicate with a database. We use a REST API (Express) to expose endpoints. For e-commerce, user authentication is critical to protect user data, orders, and wishlists.

**Social Media vs. E-Commerce:**
- *Social Media:* Users have profiles, posts, and followers.
- *E-Commerce (ShopKart):* Users (Customers) have profiles, cart items, wishlists, and order history. The authentication flow (JWT in cookies) is exactly the same, but the data models differ.

### Key Learnings from Backend Models
1. **Mongoose Schemas:** We define the structure of our MongoDB documents. For `Customer`, we store name, email, and password.
2. **Password Hashing:** We NEVER store plain-text passwords. We use `bcrypt` to hash the password before saving it to the database (`pre('save')` hook).
3. **JWT Authentication:** When a user logs in, we generate a JSON Web Token (JWT) and store it in an `HttpOnly` cookie. This prevents XSS (Cross-Site Scripting) attacks because JavaScript cannot access the cookie.
4. **Middleware:** We created an `auth.middleware.js` to protect routes. It intercepts the request, checks for the JWT in the cookie, verifies it, and attaches the user ID to `req.userId` before passing control to the controller.

## Lab 02: Frontend Architecture & Global State

### The Concept: React Context API and Protected Routes
**Why we need it:**
In React, passing data (like "is the user logged in?") down through many components as props is called "prop drilling." The Context API allows us to create global state that any component can access.

**Social Media vs. E-Commerce:**
- Both apps need to know if a user is authenticated to show/hide the Login vs. Profile pages.
- We use the `AuthContext` to store the user data and provide `login`, `register`, and `logout` functions globally.

### Key Learnings from Frontend Setup
1. **Axios Instance:** We configure `axios` with `withCredentials: true` so it automatically sends our `HttpOnly` JWT cookie with every request.
2. **React Context (`AuthContext` & `WishlistContext`):** We wrap our application in Providers. Any component can call `useAuth()` or `useWishlist()` to get the latest state without passing props.
3. **Protected Routes:** We created a wrapper component that checks if `user` exists in `AuthContext`. If not, it redirects them to `/login`.
4. **Glassmorphism Design:** We used modern CSS (backdrop-filter, rgba backgrounds) to create a premium, translucent design system.

## Lab 03: Product Catalog & Database Seeding

### The Concept: Dynamic Routing and Querying
**Why we need it:**
An e-commerce store needs to display hundreds of products. Hardcoding them is impossible. We need a dynamic product page that fetches data from MongoDB.

**Social Media vs. E-Commerce:**
- *Social Media:* A Feed fetches posts from all users or friends.
- *E-Commerce:* The Products page fetches items based on categories, price filters, and search queries.

### Key Learnings from Product Catalog
1. **Database Seeding:** We created a script to populate MongoDB with initial product data (electronics, clothing, etc.) so we have something to display.
2. **Dynamic Querying:** Our backend route `/api/products` accepts query parameters (`?category=electronics&search=phone`). The Mongoose controller dynamically builds a query object to filter the database results.
3. **React Router (`useParams`):** For the Product Detail page (`/products/:id`), we extract the `:id` from the URL using `useParams()` and fetch the specific product from the backend.

## Lab 04: Wishlist System & M:N Relationships

### The Concept: Many-to-Many Database Relationships
**Why we need it:**
A customer can have many products in their wishlist, and a product can be in many customers' wishlists. This is a Many-to-Many (M:N) relationship.

**Social Media vs. E-Commerce:**
- *Social Media:* Users "Like" a post. The schema links `UserId` and `PostId`.
- *E-Commerce:* Customers "Wishlist" a product. The schema links `CustomerId` and `ProductId`. The architecture is identical.

### Key Learnings from Wishlist
1. **Compound Index:** In the `Wishlist` schema, we used `index({ customer: 1, product: 1 }, { unique: true })`. This database-level constraint ensures a user cannot add the exact same product to their wishlist twice.
2. **Mongoose `populate()`:** When fetching a user's wishlist, the database only has the `productId`. We use `.populate('product')` to tell Mongoose to fetch the full product details (name, price, image) from the Products collection automatically.
3. **Optimistic UI Updates:** When a user clicks the heart icon, we immediately update the local React state (toggle the heart color) while making the API request in the background. This makes the app feel lightning fast.
4. **Context Badge:** The navbar cart/wishlist badge listens to the `WishlistContext`. Whenever an item is added/removed, the badge automatically updates across the entire app.

## Lab 05: Shopping Cart & Embedded Documents

### The Concept: Embedded Subdocuments & Quantity Control
**Why we need it:**
Unlike a wishlist which is a flat set of items, an e-commerce shopping cart requires quantities, real-time stock checks, and immediate line item subtotal calculations.

**Social Media vs. E-Commerce:**
- *Social Media:* Bookmarked posts.
- *E-Commerce:* An embedded array of `{ product, quantity }` inside the `Customer` document.

### Key Learnings from Cart Setup
1. **Embedded vs. Referenced:** The cart belongs exclusively to one user and is frequently modified together with user sessions. Embedding `cart` inside `Customer` allows atomic retrieval in a single query.
2. **Quantity vs Stock:** Each addition checks current product stock to guarantee `quantity <= product.stock`.
3. **Cart Badge:** Derived count `cartItems.reduce((acc, item) => acc + item.quantity, 0)` drives real-time badge updates.

## Lab 06: Checkout, Orders & Razorpay Payment Integration

### The Concept: Immutable Historical Records & Payment Gateways
**Why we need it:**
A cart is temporary state that the customer can change at any time. An order is a permanent, immutable legal contract of a completed transaction that must withstand price changes, catalog updates, and audit requirements.

**Social Media vs. E-Commerce:**
- *Social Media:* Post publishing with likes and comments.
- *E-Commerce:* Multi-step purchase funnel: Cart → Address Validation → Stock Lock → Razorpay Payment Order → Client Checkout → HMAC Signature Verification → Stock Decrement → Cart Reset → Permanent Order History.

### Key Learnings from Lab 06
1. **Purchase-Time Snapshots:** Store product `name`, `price`, `image`, and `quantity` directly in the `Order` subdocuments. Catalog price changes in future months will never alter historical order amounts.
2. **Server-Side Price Authority:** NEVER trust total amount or line item prices sent from React. Recalculate everything on the server.
3. **Razorpay Standard Checkout:**
   - Server calls Razorpay Orders API with amount in paise (`₹1 = 100 paise`).
   - Browser opens Razorpay Checkout modal.
   - Upon completion, the browser receives `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
4. **HMAC SHA-256 Signature Verification:** Use Node's `crypto` module to compute `crypto.createHmac('sha256', secret).update(dbOrderId + '|' + paymentId).digest('hex')`. Only when signatures match do we mark the order `PAID` and `PLACED`.
5. **Cart Clearing Safety:** The user's cart is cleared in MongoDB and in React memory **ONLY AFTER** successful signature verification. If payment fails, the cart remains untouched.
6. **Multi-Tenant Ownership Verification:** `GET /orders/:id` verifies `order.customer.toString() === req.customerId` to eliminate Insecure Direct Object Reference (IDOR) vulnerabilities.
