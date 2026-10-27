# 📝 Blogify — Full-Stack Blog Application

> **Frontend & Backend Development Internship**  
> **Module 1:** Responsive Frontend Application (HTML5, CSS3, Vanilla JS)  
> **Module 2:** Backend RESTful APIs (Node.js, Express.js, MongoDB, Mongoose, JWT)  
> **GitHub Repository:** [https://github.com/vatson5425/blog-application](https://github.com/vatson5425/blog-application)

---

## 🌟 Project Overview

**Blogify** is a complete, full-stack, responsive editorial blogging platform. Originally created as an accessible, modern frontend, it has now been extended with an enterprise-standard **Node.js & Express REST API** powered by **MongoDB Atlas**, authenticated securely via **JSON Web Tokens (JWT)** and **bcryptjs**.

---

## 🚀 Module 1: Frontend Highlights
- **5 Complete Responsive Pages:**
  - `index.html`: Home page featuring hero showcase, live search, topic filters, blog cards, and quick reading modal.
  - `login.html`: Centered login card with email validation, password show/hide, and demo credential hints.
  - `register.html`: Registration form with full name, email, password strength checks, and confirm-password verification.
  - `dashboard.html`: Creator dashboard with live analytics counters (Total, Published, Draft) and interactive article table.
  - `create-blog.html`: Dedicated blog composer with live featured image preview, draft/publish options, and edit-in-place support.
- **Design Excellence:** Pure Vanilla CSS3 with custom variables, smooth transitions, glassmorphic header, mobile hamburger drawer, and zero external CSS frameworks (no Tailwind/Bootstrap).
- **Graceful Offline / Fallback Support:** Integrated client-side fallback that keeps the application fully functional even when the backend server is offline.

---

## ⚡ Module 2: Backend REST API Highlights
- **Node.js & Express.js Architecture:** Modular architecture structured with clean separation of concerns (`config/`, `models/`, `controllers/`, `routes/`, `middleware/`).
- **MongoDB & Mongoose:** Schema modeling with pre-save password hashing, email normalization, author relations (`ref: 'User'`), and search indexes.
- **Stateless JWT Authentication:**
  - Passwords securely hashed with `bcryptjs` (salt rounds: 10).
  - Signed JSON Web Tokens (`jsonwebtoken`) with configurable expiration.
  - Protected endpoints secured via `authMiddleware.js`.
  - Passwords and sensitive hashes are never exposed in JSON responses.
- **Strict Authorization:** Only authors can edit or delete their own posts; unauthorized access returns HTTP 403. Private drafts can only be accessed by the creator.
- **Centralized Error Handling:** Custom middleware intercepts Mongoose validation errors, duplicate keys (`code: 11000`), cast errors, and undefined routes (HTTP 404).

---

## 🛠️ Complete Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Grid & Flexbox), Vanilla JavaScript (ES6+), Google Fonts (*Inter*, *Plus Jakarta Sans*) |
| **Backend Runtime** | Node.js (v18+ LTS recommended) |
| **Backend Framework** | Express.js 4.x |
| **Database & ODM** | MongoDB (MongoDB Atlas cloud cluster or local), Mongoose 8.x |
| **Authentication & Security** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`, `express-validator` |
| **API Client** | Native `fetch` with Bearer token authentication (`js/api.js`) |

---

## 📂 Project Directory Structure

```text
blog-application/
│
├── index.html            # Public homepage with search, filter, and article modal
├── login.html            # User login with validation and password toggles
├── register.html         # User registration with validation and redirect
├── dashboard.html        # Creator dashboard with analytics and post management
├── create-blog.html      # Blog composer and editor with live image preview
│
├── css/
│   └── style.css         # Complete master stylesheet
│
├── js/
│   ├── api.js            # Centralized REST client communicating with Express API
│   ├── main.js           # Session manager, global navigation, and toast alerts
│   ├── auth.js           # Form handlers for login and registration
│   ├── dashboard.js      # Dashboard data populator and delete modal handler
│   └── blog.js           # Catalog search/filter and blog composer logic
│
├── assets/
│   └── images/           # Application media assets
│
├── backend/
│   ├── server.js         # Express app entry point & MongoDB connection gate
│   ├── package.json      # Backend scripts and dependencies
│   ├── .env.example      # Environment variable template with safe placeholders
│   ├── .gitignore        # Ignores backend/node_modules and backend/.env
│   ├── config/
│   │   └── db.js         # Mongoose connection logic
│   ├── models/
│   │   ├── User.js       # User model with bcrypt pre-save hook
│   │   └── Blog.js       # Blog model with author reference and status
│   ├── controllers/
│   │   ├── authController.js # Handlers for register, login, and getMe
│   │   └── blogController.js # CRUD handlers and ownership checks
│   ├── routes/
│   │   ├── authRoutes.js # Express router for auth endpoints
│   │   └── blogRoutes.js # Express router for blog endpoints
│   ├── middleware/
│   │   ├── authMiddleware.js # JWT Bearer token authentication
│   │   └── errorMiddleware.js# Centralized error handler & 404 handler
│   └── README.md         # Dedicated backend documentation
│
├── .gitignore            # Root Git ignore (protects all .env files and node_modules)
└── README.md             # Master full-stack project documentation
```

---

## 🌐 API Endpoints Reference

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/health` | Public | Health check verifying server status |
| **POST** | `/auth/register` | Public | Register new user account (`name`, `email`, `password`) |
| **POST** | `/auth/login` | Public | Authenticate user credentials and receive JWT |
| **GET** | `/auth/me` | Protected (JWT) | Retrieve currently authenticated user profile |
| **GET** | `/blogs` | Public | Retrieve published blogs (supports `?search=` and `?category=`) |
| **GET** | `/blogs/my` | Protected (JWT) | Retrieve all posts (drafts + published) by authenticated user |
| **GET** | `/blogs/:id` | Public / Author | Retrieve single blog (drafts restricted to post author) |
| **POST** | `/blogs` | Protected (JWT) | Create new blog post (auto-assigns authenticated user as author) |
| **PUT** | `/blogs/:id` | Protected (Author) | Update an existing post owned by the caller |
| **DELETE**| `/blogs/:id` | Protected (Author) | Delete an existing post owned by the caller |

---

## 🍃 MongoDB Setup Instructions (MongoDB Atlas Cloud)

1. **Sign Up:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. **Create a Free Cluster:** Choose the free **M0 Shared Tier** and select your closest cloud region.
3. **Create Database User:**
   - Under **Security &rarr; Database Access**, click **Add New Database User**.
   - Select **Password Authentication**. Enter a username (e.g. `blog_admin`) and a secure password.
   - Assign user privileges: **Read and write to any database**.
4. **Configure Network Access:**
   - Under **Security &rarr; Network Access**, click **Add IP Address**.
   - For local development, choose **Allow Access from Anywhere (`0.0.0.0/0`)** or add your current IP address.
5. **Get Connection String:**
   - Under **Databases**, click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection URI:
     `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/blogify?retryWrites=true&w=majority`
   - Replace `<username>` and `<password>` with your database user credentials.

---

## ⚙️ Environment Variables Setup

1. In the `backend/` directory, copy `.env.example` to create your real `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Open `backend/.env` and update the values:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://blog_admin:YOUR_ACTUAL_PASSWORD@cluster0.xxxx.mongodb.net/blogify?retryWrites=true&w=majority
   JWT_SECRET=my_super_secret_jwt_random_key_min_32_characters_long_12345
   JWT_EXPIRES_IN=1d
   CLIENT_ORIGIN=http://127.0.0.1:5500
   ```
> ⚠️ **Important Security Rule:** Never commit `backend/.env` to GitHub. The root and backend `.gitignore` files are already configured to protect your credentials.

---

## 💻 Local Development Setup & Running Guide

### 1. Prerequisites Check
Verify that Node.js and npm are installed on your machine:
```bash
node --version
npm --version
```
*(If Node.js is not yet installed, download the current LTS installer from [nodejs.org](https://nodejs.org/) and install it).*

### 2. Install Backend Dependencies
Open a terminal in the `backend/` directory and install packages:
```powershell
cd backend
npm install
```

### 3. Start the Backend Server
```powershell
# Development mode with auto-reload (using nodemon):
npm run dev

# Or standard production mode:
npm start
```
When running, you should see:
```text
✅ MongoDB Connected Successfully: cluster0.xxxx.mongodb.net
🚀 Blog API Server running in development mode on port 5000
🔗 Health check available at: http://localhost:5000/api/health
```

### 4. Start the Frontend
In a separate terminal or in VS Code:
1. Open the project root folder `C:\Blog`.
2. Right-click `index.html` and select **"Open with Live Server"** (running at `http://127.0.0.1:5500`).
3. The frontend is automatically wired to communicate with `http://localhost:5000/api`.

---

## 🧪 Comprehensive API Testing Checklist

You can test every endpoint using Postman, Thunder Client, or cURL:

### 1. Health Check
- **Request:** `GET http://localhost:5000/api/health`
- **Expected:** `200 OK` &rarr; `{ "success": true, "message": "Blog API server is running" }`

### 2. User Registration
- **Request:** `POST http://localhost:5000/api/auth/register`
- **Body:**
  ```json
  {
    "name": "Alex Johnson",
    "email": "alex@example.com",
    "password": "Password123"
  }
  ```
- **Expected:** `201 Created` &rarr; returns JWT token and user info without password.
- **Negative Test:** Submitting the same email again returns `400 Bad Request` with message *"An account with this email address already exists"*.

### 3. User Login
- **Request:** `POST http://localhost:5000/api/auth/login`
- **Body:**
  ```json
  {
    "email": "alex@example.com",
    "password": "Password123"
  }
  ```
- **Expected:** `200 OK` &rarr; returns signed token and user profile.
- **Negative Test:** Wrong password returns `401 Unauthorized` with generic *"Invalid email or password"*.

### 4. Fetch Current User Profile
- **Request:** `GET http://localhost:5000/api/auth/me`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Expected:** `200 OK` &rarr; returns profile. Sending without token returns `401 Unauthorized`.

### 5. Create Blog Post
- **Request:** `POST http://localhost:5000/api/blogs`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Body:**
  ```json
  {
    "title": "Scalable REST APIs with Express & Mongoose",
    "category": "Engineering",
    "description": "Learn how to structure enterprise-grade APIs in Node.js.",
    "content": "Deep dive into controllers, services, middleware, and database validation...",
    "status": "published"
  }
  ```
- **Expected:** `201 Created` &rarr; blog created with author automatically linked to authenticated user.

### 6. Public Blog Listing & Search
- **Request:** `GET http://localhost:5000/api/blogs?search=scalable&category=Engineering`
- **Expected:** `200 OK` &rarr; returns published blogs matching search query with populated author details.

### 7. User's Dashboard Articles
- **Request:** `GET http://localhost:5000/api/blogs/my`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Expected:** `200 OK` &rarr; returns all blogs (drafts and published) authored by the caller.

### 8. Update Blog Post (Ownership Check)
- **Request:** `PUT http://localhost:5000/api/blogs/<BLOG_ID>`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Body:** `{ "title": "Updated Title", "status": "draft" }`
- **Expected:** `200 OK` if author matches; `403 Forbidden` if another user attempts the update.

### 9. Delete Blog Post
- **Request:** `DELETE http://localhost:5000/api/blogs/<BLOG_ID>`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Expected:** `200 OK` if author matches; `403 Forbidden` if caller is not the author.

---

## 🔒 Security Architecture & Best Practices

1. **Environment Secrets:** All sensitive credentials (`MONGODB_URI`, `JWT_SECRET`) reside solely in `.env` and are strictly excluded from version control via `.gitignore`.
2. **Password Protection:** Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with 10 salt rounds.
3. **Information Disclosure Prevention:** Queries exclude password fields by default (`select: false`), and generic authentication error messages prevent user enumeration.
4. **CORS Governance:** CORS middleware is configured to allow only trusted origins (`CLIENT_ORIGIN` / `http://127.0.0.1:5500`), blocking unauthorized cross-origin requests.
5. **No Blind Trust on Client IDs:** Author identities are exclusively determined by verifying the signed JWT payload on the server, never by trusting client-submitted user IDs.
6. **Production Considerations:**
   - Deploy backend behind HTTPS/TLS to encrypt credentials and tokens in transit.
   - For high-security environments, store JWTs in `httpOnly`, `secure`, `sameSite` cookies to defend against XSS.
   - Implement rate-limiting (`express-rate-limit`) and security headers (`helmet`).

---

## 📤 GitHub Commit & Push Guide

Your local project is already linked to:
`https://github.com/vatson5425/blog-application`

To commit and push Module 2 without exposing secrets:

```powershell
# 1. Review status and verify that .env is NOT staged
& "C:\Program Files\Git\cmd\git.exe" status

# 2. Stage all project files (safe .gitignore rules prevent .env from staging)
& "C:\Program Files\Git\cmd\git.exe" add .

# 3. Double-check staged files to confirm no .env is included
& "C:\Program Files\Git\cmd\git.exe" status

# 4. Commit Module 2 completion
& "C:\Program Files\Git\cmd\git.exe" commit -m "feat(module-2): complete backend REST API with Express, MongoDB, Mongoose, and JWT authentication"

# 5. Push to GitHub main branch
& "C:\Program Files\Git\cmd\git.exe" push origin main
```

---

## 🎓 Internship Reflection & Learnings

Completing Module 2 bridged the gap from client-side programming to complete full-stack web development:
- **RESTful API Principles:** Gained practical understanding of HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`), status codes (`200`, `201`, `400`, `401`, `403`, `404`, `500`), and predictable JSON payloads.
- **Authentication & Authorization:** Learned the mechanics of stateless authentication using JWTs and how middleware enforces granular role and ownership permissions.
- **Data Modeling & Validation:** Designed resilient MongoDB schemas using Mongoose, pre-save hooks, indexing, and input sanitization via `express-validator`.
- **Full-Stack Integration:** Replaced local-only mocks with live asynchronous `fetch` calls, handling network states, loading indicators, and graceful fallbacks.

---

**Developed with ❤️ for the Full-Stack Web Development Internship.**
