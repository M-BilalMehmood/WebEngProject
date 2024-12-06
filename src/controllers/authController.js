import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Staff from '../models/Staff.js';
import { JWT_SECRET, googleClient } from '../config/auth.js';
import emailService from '../services/emailService.js';
import { sanitizeUser, generateRandomString } from '../utils/helpers.js';

class AuthController {
    constructor() {
        this.generateToken = this.generateToken.bind(this);
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
    }

    generateToken(user) {
        return jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: '1h',
        });
    }
    
    async register(req, res) {
        try {
            const { name, email, password, role, ...additionalInfo } = req.body;
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            let newUser;

            switch (role) {
                case 'doctor':
                    newUser = new Doctor({ name, email, password, role, ...additionalInfo });
                    break;
                case 'patient':
                    newUser = new Patient({ name, email, password, role, ...additionalInfo });
                    break;
                case 'staff':
                    newUser = new Staff({ name, email, password, role, ...additionalInfo });
                    break;
                default:
                    newUser = new User({ name, email, password, role });
            }

            await newUser.save();

            // Send welcome email
            await emailService.sendWelcomeEmail(newUser);

            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            const token = jwt.sign(
                { id: user._id, role: user.role },
                JWT_SECRET,
                { expiresIn: '1d' }
            );
            // Set the token as an HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: false, // Set to true in production
                sameSite: 'lax', // Adjust based on your needs
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });
            res.status(200).json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: error.message });
        }
    }

    async googleLogin(req, res) {
        try {
            const { token } = req.body;
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const { name, email } = ticket.getPayload();
            let user = await User.findOne({ email });
            if (!user) {
                user = new User({ name, email, password: generateRandomString(10), role: 'patient' });
                await user.save();
            }
            const jwtToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
            res.status(200).json({ token: jwtToken, user: sanitizeUser(user) });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const resetToken = generateRandomString(20);
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();

            await emailService.sendPasswordResetEmail(email, resetToken);

            res.status(200).json({ message: 'Password reset email sent' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });
            if (!user) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }
            user.password = newPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            res.status(200).json({ message: 'Password reset successful' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new AuthController();
