
const userModel = require('../models/userModel');

const userController = {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await userModel.findAllExcept(req.user.userId);
      res.json(users);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Get user by ID
  async getUserById(req, res) {
    try {
      const user = await userModel.findById(req.params.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Update user profile
  async updateProfile(req, res) {
    try {
      const { username, avatar, bio, skills } = req.body;
      
      const updatedUser = await userModel.updateProfile(req.user.userId, {
        username,
        avatar,
        bio,
        skills
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = userController;
