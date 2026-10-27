# 🚀 Blogify Backend API — Module 2 Documentation

This backend is a RESTful API built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**. It provides complete authentication, user identity management, and CRUD services for the Blogify web platform.

---

## 🛠️ Technology Stack
- **Runtime:** Node.js (LTS recommended)
- **Framework:** Express.js 4.x
- **Database:** MongoDB (via MongoDB Atlas or local instance)
- **ODM:** Mongoose 8.x
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Validation:** `express-validator`
- **Security:** `cors`, `dotenv`, input sanitization, and parameterized Mongoose queries

---

## 📂 Backend Architecture & Structure

```text
backend/
├── server.js               # Entry point: initializes Express, DB connection, CORS & routes
├── package.json            # Node.js dependencies and run scripts
├── .env.example            # Template for environment variables (safe for Git)
├── .gitignore              # Ignores node_modules and real .env files
│
├── config/
│   └── db.js               # MongoDB Mongoose connection handler
│
├── models/
│   ├── User.js             # User Schema (pre-save bcrypt hashing, email uniqueness)
│   └── Blog.js             # Blog Schema (author relation, timestamps, indexes)
│
├── controllers/
│   ├── authController.js   # Logic for register, login, and profile fetching (/me)
│   └── blogController.js   # CRUD handlers, author ownership enforcement, search/filter
│
├── routes/
│   ├── authRoutes.js       # Route declarations with express-validator schemas
│   └── blogRoutes.js       # Public & protected blog endpoints
│
└── middleware/
    ├── authMiddleware.js   # JWT verification and user population
    └── errorMiddleware.js  # Centralized error handler and 404 handler
```

---

## ⚙️ Environment Variables Configuration

Create a file named `.env` in the `backend/` folder based on `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.yourmongodb.net/blogify?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_random_key_minimum_32_characters
JWT_EXPIRES_IN=1d
CLIENT_ORIGIN=http://127.0.0.1:5500
```

> **Security Reminder:** Never commit `.env` into version control. It is already added to `backend/.gitignore`.

---

## 🌐 API Endpoints Reference

### 1. Health Check
- `GET /api/health` — Public health verification endpoint.

### 2. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user with `{ name, email, password }` |
| `POST` | `/api/auth/login` | Public | Authenticate user with `{ email, password }` and get JWT |
| `GET` | `/api/auth/me` | Protected (JWT) | Get currently authenticated user profile |

### 3. Blog Endpoints (`/api/blogs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/blogs` | Public | List published blogs (Supports `?search=` and `?category=`) |
| `GET` | `/api/blogs/my` | Protected (JWT) | List all posts (published + draft) by logged-in user |
| `GET` | `/api/blogs/:id` | Public / Author | Get single blog by ID (drafts restricted to author) |
| `POST` | `/api/blogs` | Protected (JWT) | Create a blog post (`title`, `description`, `content`, etc.) |
| `PUT` | `/api/blogs/:id` | Protected (Author) | Update an existing post owned by the caller |
| `DELETE` | `/api/blogs/:id` | Protected (Author) | Delete an existing post owned by the caller |

---

## 🧪 Quick Test Requests (cURL / REST Client)

### Health Check:
```bash
curl http://localhost:5000/api/health
```

### Register User:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alex Johnson\",\"email\":\"alex@example.com\",\"password\":\"Password123\"}"
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"alex@example.com\",\"password\":\"Password123\"}"
```

### Create Blog (requires `Bearer <TOKEN>`):
```bash
curl -X POST http://localhost:5000/api/blogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"title\":\"Understanding Modern Backend Architectures\",\"category\":\"Engineering\",\"description\":\"A guide to Express and MongoDB REST APIs.\",\"content\":\"Full article content here...\",\"status\":\"published\"}"
```
