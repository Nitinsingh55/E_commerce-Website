# MAISON E-Commerce Website

A modern, full-stack e-commerce platform built with React, Node.js, Express, and PostgreSQL. It features a stunning UI, full shopping cart functionality, a robust admin panel, and secure database authentication.

https://maisonshopping.netlify.app/

## 🚀 Tech Stack

- **Frontend:** React, Vite, React Router DOM, Axios, CSS Modules/Plain CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (hosted on Neon Database)
- **Authentication:** JSON Web Tokens (JWT), bcrypt
- **File Uploads:** Multer (local `./uploads` folder)
- **Deployment:** Netlify (Frontend), Render (Backend)

---

## 💻 Run Instructions (Local Development)

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database Connection String

### 1. Database Setup
Create a new PostgreSQL database (e.g., using Neon.tech) and get the `DATABASE_URL` connection string.

### 2. Backend Setup
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` folder with your credentials:
   ```env
   # Required
   DATABASE_URL="postgresql://username:password@your-database-host.com/dbname?sslmode=require"
   JWT_SECRET="your_super_secret_jwt_key_here"
   PORT=5000
   NODE_ENV="development"
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *(Or run `node server.js` for production mode).*
5. Initialize and seed the database with mock products:
   Open your browser and visit:
   `http://localhost:5000/api/setup`
   Wait for the success message to ensure your database is populated.

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173` in your browser.

---

## 🔑 Admin Login

The backend seeder automatically creates an admin user for you to access the dashboard:
- **Email:** `admin@maison.com`
- **Password:** `admin123`

Access the admin panel at: `/admin/login`

---

## 🗺️ API Routes List

### Authentication `/api/auth`
- `POST /register` - Register a new user
- `POST /login` - Login user and return JWT
- `GET /profile` - Get logged-in user profile (Protected)

### Products `/api/products`
- `GET /` - Get all products (supports `?page=X`, `?limit=Y`, `?search=term`, `?category=Name`)
- `GET /:id` - Get a single product by ID
- `POST /` - Create a new product (Protected, Admin, supports multiple `images` via Multer)
- `PUT /:id` - Update a product (Protected, Admin)
- `DELETE /:id` - Delete a product and local image files (Protected, Admin)

### Categories `/api/categories`
- `GET /` - Get all product categories

### Cart `/api/cart`
- `GET /` - Get current user's cart (Protected)
- `POST /` - Add item to cart (Protected)
- `PUT /:id` - Update cart item quantity (Protected)
- `DELETE /:id` - Remove item from cart (Protected)

### Orders `/api/orders`
- `GET /` - Get current user's checkout orders (Protected)
- `POST /` - Create a new order (Protected)
- `GET /:id` - Get order by ID (Protected)
- `GET /admin` - Admin route to view all orders (Protected, Admin)
- `PUT /:id/status` - Update order status (Protected, Admin)

### Admin `/api/admin`
- Contains analytics and management routes for the admin dashboard.

---

## 🌐 Deployment Details
- **Frontend `netlify.toml`**: Configured to serve `index.html` on 404s to support React Router SPA behavior.
- **Backend `render.yaml`**: Automatically builds via `npm install` and sequentially executes `node scripts/initDB.js && node scripts/seedProducts.js` before starting the server.

*Created for MAISON E-Commerce.*
