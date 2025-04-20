import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Login user and generate token
export const login = async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });
    try {
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // ✅ Include relevant user info in the response
        res.json({

            token,
            user: {
                _id: user._id,
                username: user.username,
                role: user.role,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Register user
export const register = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const user = new User({ username, password, role });
        await user.save();

        res.status(201).json({ message: 'User created successfully' });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};
