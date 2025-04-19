import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Login user and generate token
export const login = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
};

// Register user
export const register = async (req, res) => {
    const { username, password, role } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    const user = new User({ username, password, role });
    await user.save();
    res.status(201).json({ message: 'User created' });
};
