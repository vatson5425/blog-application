# 📝 Blogify — Responsive Modern Blog Application

> **Frontend Development Internship — Module 1, Task 1**  
> A complete, responsive, and professional editorial blogging web application built purely with **HTML5, CSS3, and Vanilla JavaScript**, powered by browser **LocalStorage**.

---

## 🌟 Overview & Objectives

**Blogify** is a modern editorial blogging platform designed for developers, designers, and creative writers. Built as part of a frontend engineering internship task, it fulfills all industry-grade UI/UX benchmarks, complete responsiveness, accessibility, and dynamic local client-side data persistence.

### Key Objectives:
- ✅ Create a clean, elegant visual aesthetic using modern typography (**Inter**, **Plus Jakarta Sans**), subtle shadows, and an indigo color palette.
- ✅ Implement seamless client-side authentication and session handling using **LocalStorage**.
- ✅ Provide a real-time reactive blog catalog with **live text search** and **instant category filtering**.
- ✅ Build an author **Creator Dashboard** with dynamic metric counters (Total, Published, Draft) and interactive management tables.
- ✅ Implement a complete **Blog Editor** supporting image URL live previews, draft vs. publish state management, and post editing.
- ✅ Strict compliance: **Zero external frameworks or libraries** (No React, Vue, Bootstrap, or Tailwind). Pure standard web technologies.

---

## 🛠️ Technologies Used

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic structure (`<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`) |
| **CSS3** | Custom properties (CSS variables), Flexbox, CSS Grid, animations, and responsive media queries |
| **Vanilla JavaScript (ES6+)** | DOM manipulation, validation, routing helpers, modal handling, and state sync |
| **LocalStorage API** | Browser-level persistence for demo users, active sessions, and blog articles |
| **Google Fonts** | Professional web typography (`Inter` & `Plus Jakarta Sans`) |
| **Inline SVG Icons** | Lightweight, high-resolution icons with zero external icon dependencies |

---

## 🚀 Key Features

### 1. Home Page (`index.html`)
- **Sticky Glassmorphic Navigation:** Brand logo, desktop & mobile hamburger menu, dynamic auth action pills.
- **Hero Banner:** Call-to-actions, live statistics highlights, and featured article showcase card.
- **Search & Category Filtering:** Instant search bar filtering by title, excerpt, content, or author, combined with tag pills (*All*, *Engineering*, *Design*, *JavaScript*, *Technology*).
- **Responsive Blog Cards:** Image cover, category badge, publication date, read time estimate, author badge, and quick modal reader.
- **Empty States:** Friendly feedback UI when no articles match search queries.

### 2. Login Page (`login.html`)
- Centered, elevated card layout with smooth shadows.
- Form validation for email format and password presence.
- **Show/Hide password toggle** with eye icons.
- **"Remember Me"** functionality caching email in LocalStorage.
- Pre-seeded **Demo Credentials Helper**:
  - **Email:** `alex@example.com`
  - **Password:** `Password123`

### 3. Register Page (`register.html`)
- Full Name, Email, Password, and Password Confirmation fields.
- Real-time error validation with inline feedback.
- Prevents duplicate email registrations.
- Automatically signs in newly registered users and redirects to Dashboard.

### 4. Creator Dashboard (`dashboard.html`)
- **Authentication Guard:** Automatically redirects unauthenticated guests to `login.html`.
- **Dynamic Metrics Cards:** Total Articles, Published Articles, and Draft Articles counters.
- **Articles Table:** Displays all user posts with category badges, status badges, and direct **Edit** and **Delete** actions.
- **Modal Confirmation:** Accessible popup dialog confirming deletion before removing posts.

### 5. Blog Editor (`create-blog.html`)
- Create new posts or edit existing posts via URL query parameters (`?id=post_xxx`).
- Form fields: Blog Title, Category, Status (Published or Draft), Short Excerpt, Content, and Featured Image URL.
- **Live Image Previewer:** Renders the image instantly upon entering an image link.
- Action triggers for both **Save as Draft** and **Publish Article**.

---

## 📂 Project Structure

```text
Blog/
│
├── index.html            # Home page (Catalog, Hero, Search, Filter, Quick Reader)
├── login.html            # User login with validation & password toggle
├── register.html         # User registration with password confirmation
├── dashboard.html        # Creator dashboard, analytics metrics & post table
├── create-blog.html      # Blog editor (Create, Edit, Live Image Preview)
│
├── css/
│   └── style.css         # Master stylesheet (Tokens, Flexbox, Grid, Themes)
│
├── js/
│   ├── main.js           # Storage seed, session manager, toast & global nav
│   ├── auth.js           # Login & register validation, password toggles
│   ├── dashboard.js      # Dashboard stats, table populator, delete modal
│   └── blog.js           # Blog grid renderer, search, filter & editor saving
│
├── assets/
│   └── images/           # Local media assets
│
└── README.md             # Project documentation & GitHub guide
```

---

## 💻 Local Development Setup

Follow these simple steps to run the project locally on your machine:

### Method 1: Using VS Code Live Server (Recommended)
1. Install [Visual Studio Code](https://code.visualstudio.com/) if you haven't already.
2. Open VS Code and install the **Live Server** extension (by *Ritwick Dey*) from the Extensions marketplace (`Ctrl + Shift + X`).
3. Click **File** &rarr; **Open Folder...** and select the `Blog` project directory.
4. Right-click on `index.html` in the file explorer and select **"Open with Live Server"**.
5. Your default browser will launch at `http://127.0.0.1:5500/index.html`.

### Method 2: Direct Browser Launch
1. Open the project folder in your file explorer.
2. Double-click `index.html` to open it in Chrome, Edge, Firefox, or Safari.

---

## 🧪 Testing Checklist & Verification Guide

| Step | Feature to Test | Expected Result |
| :---: | :--- | :--- |
| **1** | Open `index.html` | Pre-seeded sample articles display with cards and hero section. |
| **2** | Category Filter | Clicking *Design* or *Engineering* filters posts instantly. |
| **3** | Search Bar | Typing "JavaScript" filters cards matching title/content in real time. |
| **4** | Quick Read Modal | Clicking "Read Post &rarr;" opens the full article in a clean modal popup. |
| **5** | Mobile View | Resize browser or toggle mobile mode; hamburger menu toggles navigation links. |
| **6** | Demo Login | Go to `login.html`, click Sign In with demo credentials; redirects to Dashboard. |
| **7** | Registration | Go to `register.html`, create a new user; redirects to Dashboard with new user's name. |
| **8** | Dashboard Metrics | Total, Published, and Draft counts reflect existing articles accurately. |
| **9** | Create Blog Post | Go to `create-blog.html`, fill fields, and click "Publish Article"; post appears in list. |
| **10**| Save as Draft | Click "Save as Draft"; post shows amber "Draft" badge in dashboard. |
| **11**| Edit Post | Click "Edit" in dashboard; form pre-populates, allowing updates. |
| **12**| Delete Post | Click "Delete"; modal pops up, clicking "Yes, Delete" removes post and updates stats. |

---

## 📤 Step-by-Step GitHub Upload Guide

Follow these steps to upload your project to your GitHub profile:

1. **Initialize Git:**
   Open your terminal in the `Blog` folder:
   ```bash
   git init
   git add .
   git commit -m "feat: complete responsive blog application internship task"
   ```

2. **Create a GitHub Repository:**
   - Go to [GitHub](https://github.com/) and click **New Repository**.
   - Name it `responsive-blog-application`.
   - Set it to **Public**.
   - Do not check "Initialize with README" (since we already have one).
   - Click **Create repository**.

3. **Push Local Code to GitHub:**
   ```bash
   git remote add origin https://github.com/<your-username>/responsive-blog-application.git
   git branch -M main
   git push -u origin main
   ```

4. **Optional: Enable GitHub Pages (Live Demo Link):**
   - In your repository, go to **Settings** &rarr; **Pages**.
   - Under *Source*, select **Deploy from a branch**, choose `main`, and click **Save**.
   - Your project will be live at `https://<your-username>.github.io/responsive-blog-application/`!

---

## 🚀 Future Enhancements
- [ ] Rich text editor (WYSIWYG) with bold/italic controls.
- [ ] Dark / Light mode theme switcher toggle.
- [ ] Like counter and comment section with LocalStorage sync.
- [ ] Backend API integration using Node.js/Express and MongoDB.

---

**Developed with ❤️ for the Frontend Development Internship Program.**
