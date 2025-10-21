require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cabshare';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- User Schema and Model ---
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    batch: { type: String, required: true },
    regno: { type: String, required: true, unique: true }, // Registration number as unique identifier
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true } // Hashed password
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});
const User = mongoose.model('User', userSchema);

// --- Ride Schema and Model (Existing) ---
const rideSchema = new mongoose.Schema({
    from: String,
    to: String,
    date: String,
    time: String,
    seats: Number,
    notes: String,
    owner: String, // This will now be the user's regno
    joined: [{ type: String }], // regno
    pendingRequests: [{ type: String }] // regno of users who requested to join
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});
const Ride = mongoose.model('Ride', rideSchema);

// --- Message Schema and Model ---
const messageSchema = new mongoose.Schema({
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
    user: { type: String, required: true }, // regno
    text: { type: String, required: true },
    time: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// --- API Endpoints ---

// User Registration
app.post('/api/signup', async (req, res) => {
    try {
        const { name, batch, regno, email, password } = req.body;

        // Check if user with regno or email already exists
        const existingUser = await User.findOne({ $or: [{ regno: regno }, { email: email }] });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this registration number or email already exists.' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            batch,
            regno,
            email,
            password: hashedPassword
        });

        await newUser.save();
        // Send back user data, but exclude the password for security
        const userResponse = newUser.toObject();
        delete userResponse.password;
        res.status(201).json({ message: 'User registered successfully!', user: userResponse });

    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body; // 'username' can be regno or email

        // Find user by regno or email
        const user = await User.findOne({ $or: [{ regno: username }, { email: username }] });
        if (!user) {
            return res.status(401).json({ message: 'Invalid registration number/email or password.' });
        }

        // Compare provided password with hashed password in database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid registration number/email or password.' });
        }

        // Login successful. Send back user data, exclude password.
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(200).json({ message: 'Login successful!', user: userResponse });

    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// NEW: Endpoint to get user profile by regno
app.get('/api/users/:regno', async (req, res) => {
    try {
        const userRegno = req.params.regno;
        const user = await User.findOne({ regno: userRegno });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Send back user data, but exclude the password for security
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json(userResponse);

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching user profile.' });
    }
});


// Get all rides
app.get('/api/rides', async (req, res) => {
    try {
        const rides = await Ride.find();
        res.json(rides);
    } catch (error) {
        console.error('Error fetching all rides:', error);
        res.status(500).json({ message: 'Error fetching all rides.' });
    }
});

// Create a new ride
app.post('/api/rides', async (req, res) => {
    try {
        const ride = new Ride(req.body);
        await ride.save();
        res.status(201).json(ride); // Use 201 for successful creation
    } catch (error) {
        console.error('Error creating ride:', error);
        res.status(500).json({ message: 'Error creating ride.' });
    }
});

app.get('/api/rides/my', async (req, res) => {
    const ownerName = req.query.owner;
    if (!ownerName) {
        return res.status(400).json({ message: 'Owner username (regno) is required.' });
    }
    try {
        const myRides = await Ride.find({ owner: ownerName });
        res.json(myRides);
    } catch (error) {
        console.error(`Error fetching rides for owner ${ownerName}:`, error);
        res.status(500).json({ message: 'Error fetching your rides.' });
    }
});


// Get a single ride by ID
app.get('/api/rides/:id', async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found.' });
        }
        res.json(ride);
    } catch (error) {
        console.error('Error fetching ride by ID:', error);
        res.status(500).json({ message: 'Error fetching ride.' });
    }
});

// Endpoint to join a ride
app.post('/api/rides/:id/join', async (req, res) => {
    const rideId = req.params.id;
    const { userName } = req.body;
    try {
        const ride = await Ride.findById(rideId);
        if (!ride) return res.status(404).json({ message: 'Ride not found.' });

        // Prevent joining if full
        if (ride.joined.length >= ride.seats) {
            return res.status(400).json({ message: 'No seats available.' });
        }

        if (!ride.joined.includes(userName)) {
            ride.joined.push(userName);
            // Remove from pendingRequests if present
            ride.pendingRequests = ride.pendingRequests.filter(r => r !== userName);
            await ride.save();
        }

        res.json({ message: 'Successfully joined ride!', ride });
    } catch (error) {
        res.status(500).json({ message: 'Error joining ride.' });
    }
});

// Endpoint to leave a ride
app.post('/api/rides/:id/leave', async (req, res) => {
    const rideId = req.params.id;
    const userName = req.body.userName; // This is the regno of the leaving user

    if (!userName) {
        return res.status(400).json({ message: 'Leaving user name (regno) is required.' });
    }

    try {
        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found.' });
        }

        const initialJoinedLength = ride.joined.length;
        ride.joined = ride.joined.filter(member => member !== userName);

        if (ride.joined.length === initialJoinedLength) {
            return res.status(400).json({ message: 'You are not a member of this ride.' });
        }

        await ride.save();
        res.json({ message: 'Successfully left ride!', ride });

    } catch (error) {
        console.error(`Error leaving ride ${rideId} for ${userName}:`, error);
        res.status(500).json({ message: 'Error leaving ride.' });
    }
});

// Get all messages for a ride
app.get('/api/messages/:rideId', async (req, res) => {
    try {
        const rideObjectId = new mongoose.Types.ObjectId(req.params.rideId);
        const messages = await Message.find({ rideId: rideObjectId }).sort({ time: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages.' });
    }
});

// Post a new message to a ride chat
app.post('/api/messages/:rideId', async (req, res) => {
    try {
        const { user, text } = req.body;
        if (!user || !text) {
            return res.status(400).json({ message: 'User and text are required.' });
        }
        const rideObjectId = new mongoose.Types.ObjectId(req.params.rideId);
        const message = new Message({
            rideId: rideObjectId,
            user,
            text
        });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error saving message.' });
    }
});

// Endpoint to request to join a ride
app.post('/api/rides/:id/request', async (req, res) => {
    const rideId = req.params.id;
    const { regno } = req.body;
    try {
        const ride = await Ride.findById(rideId);
        if (!ride) return res.status(404).json({ message: 'Ride not found.' });
        if (ride.joined.includes(regno)) return res.status(400).json({ message: 'Already joined.' });
        if (ride.pendingRequests.includes(regno)) return res.status(400).json({ message: 'Already requested.' });

        ride.pendingRequests.push(regno);
        await ride.save();

        // Optionally: Notify owner via chat
        await Message.create({
            rideId: ride._id,
            user: 'System',
            text: `${regno} has requested to join the ride.`,
            time: new Date()
        });

        res.json({ message: 'Request sent.' });
    } catch (error) {
        res.status(500).json({ message: 'Error requesting to join ride.' });
    }
});

// Endpoint to handle ride join requests (approve/reject)
app.post('/api/rides/:id/handle-request', async (req, res) => {
    const rideId = req.params.id;
    const { regno, action } = req.body;
    try {
        const ride = await Ride.findById(rideId);
        if (!ride) return res.status(404).json({ message: 'Ride not found.' });

        ride.pendingRequests = ride.pendingRequests.filter(r => r !== regno);

        if (action === 'approve') {
            if (!ride.joined.includes(regno)) {
                ride.joined.push(regno);
                await Message.create({
                    rideId: ride._id,
                    user: 'System',
                    text: `${regno} has been approved and joined the ride.`,
                    time: new Date()
                });
            }
        } else {
            await Message.create({
                rideId: ride._id,
                user: 'System',
                text: `${regno}'s join request was rejected.`,
                time: new Date()
            });
        }

        await ride.save();
        res.json(ride); // Return updated ride
    } catch (error) {
        res.status(500).json({ message: 'Error handling request.' });
    }
});

// Delete a ride by ID (only owner can delete)
app.delete('/api/rides/:id', async (req, res) => {
    try {
        const rideId = req.params.id;
        // Optionally, check owner from req.body.owner or authentication
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found.' });
        }
        // Optionally: Only allow owner to delete
        // if (req.body.owner && ride.owner !== req.body.owner) {
        //     return res.status(403).json({ message: 'Only the owner can delete this ride.' });
        // }
        await Ride.findByIdAndDelete(rideId);
        // Optionally: Delete associated messages
        await Message.deleteMany({ rideId: ride._id });
        res.json({ message: 'Ride deleted successfully.' });
    } catch (error) {
        console.error('Error deleting ride:', error);
        res.status(500).json({ message: 'Error deleting ride.' });
    }
});

// Start server (This should always be at the end of your route definitions)
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
