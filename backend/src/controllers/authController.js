const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { sendWelcomeEmail } = require('../utils/email');

const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register new user
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Duplicate entry' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        role: role || 'USER'
      }
    });

    // Send welcome email
    sendWelcomeEmail(user);

    // Generate JWT token
    const token = generateToken(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.isActive === false) { // Explicit check
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Logout user
const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        bio: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      bio
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(bio !== undefined && { bio })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        bio: true,
        emailVerified: true,
        phoneVerified: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    console.log('Change password request received');
    console.log('Request body:', { ...req.body, currentPassword: '[HIDDEN]', newPassword: '[HIDDEN]' });
    console.log('User ID from token:', req.user?.id);

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    console.log('Current password valid:', isCurrentPasswordValid);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    console.log('Password updated successfully');
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword
};
