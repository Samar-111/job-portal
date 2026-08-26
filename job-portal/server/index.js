const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const User = require('./models/User');
const Job = require('./models/Job');
const Alert = require('./models/Alert');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}


app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(uploadsDir));


const DB_URI = process.env.MONGO_URI || "mongodb+srv://Samar:samar123@cluster0.woujhfa.mongodb.net/?appName=Cluster0"; 
mongoose.connect(DB_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ Connection Error:", err));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only .pdf, .doc and .docx files are allowed!'));
        }
    }
});


app.post('/register', async (req, res) => {
    console.log("➡️ Register Attempt:", req.body);
    try {
        const { username, email, password, role } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Please enter all fields" });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with that username or email" });
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'candidate'
        });

        await user.save();
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key_12345', { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error("❌ Register Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

app.post('/login', async (req, res) => {
    console.log("➡️ Login Attempt:", req.body);
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Please enter all fields" });
        }

        const user = await User.findOne({ $or: [{ username }, { email: username }] });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key_12345', { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error("❌ Login Error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/profile/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('savedJobs');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/profile/me', auth, async (req, res) => {
    try {
        const { fullName, bio, skills } = req.body;
        
        let skillsArray = [];
        if (skills) {
            skillsArray = Array.isArray(skills) 
                ? skills 
                : skills.split(',').map(s => s.trim()).filter(Boolean);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    'profile.fullName': fullName || "",
                    'profile.bio': bio || "",
                    'profile.skills': skillsArray
                }
            },
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/profile/resume', auth, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Please upload a file" });
        }

        const resumeUrl = `/uploads/${req.file.filename}`;
        const resumeName = req.file.originalname;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    'profile.resumeUrl': resumeUrl,
                    'profile.resumeName': resumeName
                }
            },
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/jobs', async (req, res) => {
    try {
        const { location, salary, jobType, skills, search } = req.query;
        let query = {};

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        if (jobType) {
            query.jobType = jobType;
        }
        if (skills) {
            const skillsList = skills.split(',').map(s => s.trim()).filter(Boolean);
            query.skillsRequired = { $in: skillsList };
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Simple salary parsing filter if needed, otherwise string match
        if (salary) {
            query.salary = { $regex: salary, $options: 'i' };
        }

        const jobs = await Job.find(query).populate('postedBy', 'username email').sort({ postedAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/jobs', auth, async (req, res) => {
    try {
        const { title, company, location, salary, description, skillsRequired, jobType } = req.body;
        
        let skillsArray = [];
        if (skillsRequired) {
            skillsArray = Array.isArray(skillsRequired) 
                ? skillsRequired 
                : skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
        }

        const newJob = new Job({
            title,
            company,
            location,
            salary,
            description,
            skillsRequired: skillsArray,
            jobType,
            postedBy: req.user._id
        });

        const savedJob = await newJob.save();

        const alerts = await Alert.find({
            $or: [
                { keyword: { $regex: title, $options: 'i' } },
                { keyword: { $regex: company, $options: 'i' } }
            ]
        }).populate('user', 'email username');

        alerts.forEach(alert => {
            console.log(`🔔 ALERT SENT: Email sent to ${alert.user.email} for new job post "${title}" matching keyword "${alert.keyword}"`);
        });

        res.json(savedJob);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/jobs/:id', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        if (job.postedBy && job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Not authorized to delete this job" });
        }

        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/jobs/:id/apply', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        const alreadyApplied = job.applications.some(app => app.candidate.toString() === req.user._id.toString());
        if (alreadyApplied) {
            return res.status(400).json({ error: "You have already applied to this job." });
        }

        const candidateUser = await User.findById(req.user._id);
        if (!candidateUser.profile.resumeUrl) {
            return res.status(400).json({ error: "Please upload your resume in your profile page before applying." });
        }

        job.applications.push({
            candidate: req.user._id,
            resumeUrl: candidateUser.profile.resumeUrl,
            resumeName: candidateUser.profile.resumeName || "Resume",
            status: 'Applied'
        });

        await job.save();
        res.json({ message: "Application submitted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/jobs/:id/applications/:appId', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const application = job.applications.id(req.params.appId);
        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        application.status = status;
        await job.save();
        res.json({ message: "Application status updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/jobs/:id/save', auth, async (req, res) => {
    try {
        const jobId = req.params.id;
        const user = await User.findById(req.user._id);
        
        const isSaved = user.savedJobs.includes(jobId);
        if (isSaved) {
            user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId.toString());
        } else {
            user.savedJobs.push(jobId);
        }

        await user.save();
        res.json({ isSaved: !isSaved, message: isSaved ? "Job removed from wishlist" : "Job saved to wishlist" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/alerts', auth, async (req, res) => {
    try {
        const { keyword, location, jobType } = req.body;
        if (!keyword) {
            return res.status(400).json({ error: "Keyword is required" });
        }

        const newAlert = new Alert({
            user: req.user._id,
            keyword,
            location,
            jobType
        });

        await newAlert.save();
        res.json(newAlert);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/alerts', auth, async (req, res) => {
    try {
        const alerts = await Alert.find({ user: req.user._id });
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/alerts/:id', auth, async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (!alert || alert.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Alert not found or unauthorized" });
        }
        await Alert.findByIdAndDelete(req.params.id);
        res.json({ message: "Alert deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/alerts/history', auth, async (req, res) => {
    try {
        const alerts = await Alert.find({ user: req.user._id });
        if (alerts.length === 0) {
            return res.json([]);
        }

        const queryOr = alerts.map(a => {
            let filter = {
                $or: [
                    { title: { $regex: a.keyword, $options: 'i' } },
                    { company: { $regex: a.keyword, $options: 'i' } }
                ]
            };
            if (a.location) {
                filter.location = { $regex: a.location, $options: 'i' };
            }
            if (a.jobType) {
                filter.jobType = a.jobType;
            }
            return filter;
        });

        const matchingJobs = await Job.find({ $or: queryOr }).sort({ postedAt: -1 }).limit(20);
        res.json(matchingJobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/analytics', auth, async (req, res) => {
    try {
        const myJobs = await Job.find({ postedBy: req.user._id });
        
        let totalJobs = myJobs.length;
        let totalApplications = 0;
        let shortlistedCount = 0;
        let rejectedCount = 0;
        let appliedCount = 0;

        myJobs.forEach(job => {
            totalApplications += job.applications.length;
            job.applications.forEach(app => {
                if (app.status === 'Shortlisted') shortlistedCount++;
                else if (app.status === 'Rejected') rejectedCount++;
                else appliedCount++;
            });
        });

        res.json({
            totalJobs,
            totalApplications,
            appliedCount,
            shortlistedCount,
            rejectedCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/recommendations', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const userSkills = user.profile.skills || [];

        if (userSkills.length === 0) {
            const latestJobs = await Job.find().sort({ postedAt: -1 }).limit(10);
            return res.json(latestJobs);
        }

        const allJobs = await Job.find().populate('postedBy', 'username');
        
        const scoredJobs = allJobs.map(job => {
            let score = 0;
            const titleLower = job.title.toLowerCase();
            const descLower = job.description.toLowerCase();
            const companyLower = job.company.toLowerCase();

            userSkills.forEach(skill => {
                const skillLower = skill.toLowerCase();
                
                // Match in title: +5 points
                if (titleLower.includes(skillLower)) {
                    score += 5;
                }
                if (job.skillsRequired && job.skillsRequired.some(s => s.toLowerCase() === skillLower)) {
                    score += 3;
                }
                if (descLower.includes(skillLower)) {
                    score += 1;
                }
            });

            return { job, score };
        });

        const filteredRecommendations = scoredJobs
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.job);

        if (filteredRecommendations.length === 0) {
            const fallbackJobs = await Job.find().sort({ postedAt: -1 }).limit(5);
            return res.json(fallbackJobs);
        }

        res.json(filteredRecommendations.slice(0, 10));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
