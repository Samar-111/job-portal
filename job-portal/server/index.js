const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); // Ensure this file exists in models folder
const Job = require('./models/Job');   // Ensure this file exists in models folder

const app = express();
const PORT = 5000;

// --- Middleware ---
app.use(express.json());
app.use(cors());

// --- Database Connection ---
const DB_URI = "mongodb+srv://Samar:samar123@cluster0.woujhfa.mongodb.net/?appName=Cluster0"; 
mongoose.connect(DB_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ Connection Error:", err));

// --- ROUTES ---

// 1. REGISTER ROUTE (Debug Mode)
app.post('/register', async (req, res) => {
    console.log("➡️ Register Attempt:", req.body); // Print what the frontend sent
    try {
        const { username, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("⚠️ Username already taken:", username);
            return res.status(400).json({ error: "Username already taken" });
        }

        const user = new User({ username, password });
        await user.save();
        
        console.log("✅ User Created Successfully:", username);
        res.json({ message: "User registered successfully!" });
    } catch (err) {
        console.error("❌ Register Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// 2. LOGIN ROUTE (Debug Mode)
app.post('/login', async (req, res) => {
    console.log("➡️ Login Attempt:", req.body); // Print what the frontend sent
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user) {
            console.log("❌ User not found in DB");
            return res.status(400).json({ error: "User not found" });
        }

        // Simple password check (In real apps, use hashing!)
        if (user.password !== password) {
            console.log("❌ Incorrect Password. Expected:", user.password, "Got:", password);
            return res.status(400).json({ error: "Invalid password" });
        }
        
        console.log("✅ Login Successful for:", username);
        res.json({ message: "Login successful", username: user.username });
    } catch (err) {
        console.error("❌ Login Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 3. JOB ROUTES (Keep these so the app still works)
app.get('/jobs', async (req, res) => {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.json(jobs);
});

app.post('/jobs', async (req, res) => {
    const newJob = new Job(req.body);
    const savedJob = await newJob.save();
    res.json(savedJob);
});

app.delete('/jobs/:id', async (req, res) => {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});