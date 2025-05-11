
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

require('dotenv').config();

const authController = {
  // Register a new user
  async register(req, res) {
    try {
      const { username, email, password, role } = req.body;
      
      // Check if email or username exists
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      // Create user
      const newUser = await userModel.create({
        username,
        email,
        password,
        role: role || 'client' // Usar el rol proporcionado o client por defecto
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      res.status(201).json({
        user: newUser,
        token
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Check if user exists
      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Update user status to online
      await userModel.updateStatus(user.id, 'online');
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      // Don't return password
      const { password: pass, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Verify user token
  async verify(req, res) {
    try {
      const user = await userModel.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ user });
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = authController;
