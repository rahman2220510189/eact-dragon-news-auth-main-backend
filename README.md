# 🐉 The Dragon News — Server (Backend)

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-black?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge)](https://jwt.io/)
[![Render](https://img.shields.io/badge/Deployed-Render-purple?style=for-the-badge)](https://render.com/)

> **REST API backend for The Dragon News — Bangladesh's AI-powered Bengali news portal**

---

## 📌 Project Description

This is the backend API server for The Dragon News platform. Built with Node.js, Express and MongoDB, it handles user authentication, news management, comments, categories and admin operations. All endpoints are secured with JWT authentication.

---

## 🧩 Problem Solved

- Provides a secure, scalable REST API for the Bengali news portal
- Handles JWT-based authentication with password hashing
- Manages news CRUD with author-based access control
- Supports admin operations for content moderation
- Enables image upload via ImgBB integration

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register/login with bcrypt password hashing
- 📰 **News CRUD** — Create, read, update, delete news with author protection
- 💬 **Comments System** — Add and delete comments on news articles
- 👍 **Like System** — Toggle likes on news with duplicate prevention
- 🏷️ **Categories** — Manage news categories
- 🛡️ **Admin Panel API** — User management, role assignment, content moderation
- 📊 **Dashboard Stats** — Total users, news, comments and categories count
- 🔒 **Role-Based Access** — User and Admin roles with middleware protection

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js 18+ | Runtime environment |
| Express.js 5 | Web framework |
| MongoDB Atlas | Database |
| MongoDB Native Driver | Database connection |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| dotenv | Environment variables |
| cors | Cross-origin requests |
| multer | File upload handling |
| nodemon | Development auto-restart |

---

## 📁 Folder Structure

```
server/
├── index.js              # Entry point — MongoDB connection & route setup
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment variable template
├── .gitignore
├── package.json
├── middleware/
│   └── verifyToken.js    # JWT verification middleware
├── routes/
│   ├── auth.routes.js    # Register, login, profile
│   ├── news.routes.js    # News CRUD + likes
│   ├── category.routes.js # Category management
│   ├── comment.routes.js # Comment system
│   └── admin.routes.js   # Admin operations
└── utils/
    └── uploadImage.js    # Image upload helper
```

---

## 🔗 API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login user |
| GET | `/me` | Private | Get current user |
| PATCH | `/update` | Private | Update profile |

### News Routes — `/api/news`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Get all news (filter by category) |
| GET | `/my-posts` | Private | Get logged-in user's posts |
| GET | `/:id` | Public | Get single news |
| POST | `/` | Private | Create news |
| PATCH | `/:id` | Private | Update own news |
| DELETE | `/:id` | Private | Delete own news |
| POST | `/:id/like` | Private | Toggle like |

### Category Routes — `/api/categories`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Get all categories |
| GET | `/:id` | Public | Get single category |
| POST | `/` | Private | Add new category |

### Comment Routes — `/api/comments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/:newsId` | Public | Get comments for a news |
| POST | `/` | Private | Add comment |
| DELETE | `/:id` | Private | Delete own comment |

### Admin Routes — `/api/admin`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/stats` | Admin | Dashboard statistics |
| GET | `/users` | Admin | Get all users |
| PATCH | `/users/:id/role` | Admin | Change user role |
| DELETE | `/users/:id` | Admin | Delete user |
| GET | `/news` | Admin | Get all news |
| PATCH | `/news/:id` | Admin | Edit any news |
| DELETE | `/news/:id` | Admin | Delete any news |
| DELETE | `/categories/:id` | Admin | Delete category |

---

## ⚙️ Installation

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account
- npm or yarn

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/rahman2220510189/eact-dragon-news-auth-main-backend.git

# 2. Navigate to project directory
cd eact-dragon-news-auth-main-backend

# 3. Install dependencies
npm install

# 4. Create environment file
cp .env.example .env

# 5. Add your credentials to .env

# 6. Start development server
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
DB_NAME=fake_news
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173
PORT=5000
```

### Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🌱 Database Seeding

After setup, seed the database with initial categories:

```bash
node seedCategories.js
```

This will create 8 default categories:
- Breaking News, Regular News, International News
- Sports, Entertainment, Culture, Arts, All News

---

## 🚢 Deployment on Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repository
4. Configure:

```
Build Command: npm install
Start Command: node index.js
```

5. Add Environment Variables:

```
DB_USER=...
DB_PASS=...
DB_NAME=fake_news
JWT_SECRET=...
FRONTEND_URL=https://your-app.vercel.app
PORT=5000
```

### ⚠️ MongoDB Atlas Network Access

Go to MongoDB Atlas → Network Access → Add IP Address → `0.0.0.0/0`

This allows Render servers to connect to your database.

---

## 🔒 Security Features

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- JWT tokens expire in **7 days**
- Admin routes protected by **dual middleware** (verifyToken + verifyAdmin)
- Author-based access control on news edit/delete
- CORS configured for specific frontend URL only

---

## 📖 Usage Guide

### Register a user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"123456"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```

### Get all news

```bash
curl http://localhost:5000/api/news
```

### Make a user admin

```bash
node makeAdmin.js
# Update the email in makeAdmin.js first
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**MD. Naymur Rahman**

- GitHub: [@rahman2220510189](https://github.com/rahman2220510189)
- Frontend Repo: [Dragon News Client](https://github.com/rahman2220510189/eact-dragon-news-auth-main)
- Backend Repo: [Dragon News Server](https://github.com/rahman2220510189/eact-dragon-news-auth-main-backend)
- AI Model Repo: [Fake News Detection](https://github.com/rahman2220510189/Fake_News_Detection)

---

> *"Journalism Without Fear or Favour"* 🐉