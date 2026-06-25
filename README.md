# 💼 Full Stack Job Portal — MERN Stack

<p align="center">
  <b>A modern, responsive job portal that helps users discover remote jobs, search intelligently, and manage their own job postings.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/MERN_Stack-3C873A?style=for-the-badge&logo=javascript&logoColor=white" />
</p>

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,nodejs,express,mongodb,js,css,git,github,vscode" />
</p>

<p align="center">
  <a href="https://job-portal-simple.vercel.app/">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-Visit_Project-6C63FF?style=for-the-badge" />
  </a>
  <a href="https://job-portal-nhpx.onrender.com">
    <img src="https://img.shields.io/badge/⚙️_Backend_API-Open_API-00C7B7?style=for-the-badge" />
  </a>
</p>

---

## 🌟 Project Preview

<p align="center">
  <img width="95%" alt="Job Portal Landing Page" src="https://github.com/user-attachments/assets/5cc9dcd1-6f9e-4158-8269-95d91a4ef41f" />
</p>

<p align="center">
  <img width="95%" alt="Job Portal Dashboard" src="https://github.com/user-attachments/assets/399fece4-1fb5-471c-a55d-2349ff4de891" />
</p>

---

## 🌍 Overview

**Full Stack Job Portal** is a modern MERN-stack application designed to make job searching simple, fast, and visually engaging.

Users can register, log in, browse jobs, search for relevant opportunities, view remote jobs fetched from an external API, and manage their own local job listings.

The project uses a clean **glassmorphism UI**, animated backgrounds, responsive layouts, and a structured backend connected to MongoDB.

---

## ✨ Features

| Feature                  | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| 🔐 Secure Authentication | User registration and login with credentials stored in MongoDB   |
| 🔍 Smart Job Search      | Search jobs with auto-suggestions based on available job data    |
| 🌍 Remote Jobs API       | Fetches real remote job listings using the Remotive API          |
| ➕ Post Jobs              | Logged-in users can create their own local job posts             |
| 🗑️ Delete Jobs          | Users can delete their own posted jobs                           |
| 🎨 Glassmorphism UI      | Frosted-glass effects, gradients, animations, and modern styling |
| 📱 Fully Responsive      | Optimized for desktop, tablet, and mobile devices                |
| ⚡ Fast Navigation        | Client-side routing using React Router                           |

---

## 🧱 Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,nodejs,express,mongodb,js,css" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Remotive_API-Remote_Jobs-6C63FF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" />
</p>

| Layer                 | Technology                      |
| --------------------- | ------------------------------- |
| ⚛️ Frontend           | React.js                        |
| 🧭 Routing            | React Router                    |
| 🎨 Styling            | CSS3, Glassmorphism, Animations |
| 🟢 Backend            | Node.js + Express.js            |
| 🍃 Database           | MongoDB Atlas                   |
| 🌍 External API       | Remotive API                    |
| ▲ Frontend Deployment | Vercel                          |
| ☁️ Backend Deployment | Render                          |
| 📦 Package Manager    | npm                             |

---

## 📂 Project Structure

```text
job-portal/
│
├── client/                         # React frontend
│   ├── public/
│   └── src/
│       ├── components/             # Reusable UI components
│       ├── App.js                  # Main routing logic
│       ├── Home.js                 # Landing page
│       ├── JobPage.js              # Job dashboard and search
│       ├── Login.js                # Login page
│       └── Register.js             # Registration page
│
├── server/                         # Node.js + Express backend
│   ├── models/
│   │   ├── User.js                 # User database schema
│   │   └── Job.js                  # Job database schema
│   ├── index.js                    # API routes and database connection
│   ├── package.json
│   └── .env                        # Environment variables
│
└── README.md
```

---

## 🚀 Run Locally

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/job-portal.git
cd job-portal
```

### 2️⃣ Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Start the backend server:

```bash
node index.js
```

The backend will run at:

```text
http://localhost:5000
```

---

### 3️⃣ Set Up the Frontend

Open a new terminal and run:

```bash
cd client
npm install
npm start
```

The frontend will run at:

```text
http://localhost:3000
```

---

## 🌐 Live Demo

| Service        | Link                                                      |
| -------------- | --------------------------------------------------------- |
| 🌐 Frontend    | [Visit Job Portal](https://job-portal-simple.vercel.app/) |
| ⚙️ Backend API | [Open Backend API](https://job-portal-nhpx.onrender.com)  |

---

## 🔮 Future Improvements

* 🔑 Add JWT authentication and password hashing
* 👤 Add user profile pages
* ❤️ Add saved jobs / wishlist functionality
* 📄 Add resume upload support
* 🧠 Add AI-based job recommendations
* 🔔 Add job alerts and email notifications
* 🏢 Add recruiter/company dashboards
* 📊 Add analytics for job posts and applications
* 🔍 Add filters for location, salary, skills, and job type

---

## ⚠️ Notes

* The backend hosted on Render may take a few seconds to wake up on the first request.
* External job listings depend on the availability of the Remotive API.
* This project was created for learning, portfolio, and demonstration purposes.

---

## 👨‍💻 Developed By

<p align="center">
  Made with 💼 and ❤️ by <b>Samar Anand</b>
</p>

<p align="center">
  ⭐ If you like this project, consider giving it a star!
</p>
