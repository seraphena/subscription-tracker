import mongoose from 'mongoose';

import User from '../models/user.model.js';

// GET /api/v1/users
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/users/:id
export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // A malformed id would otherwise crash with a Mongoose CastError (500)
    if (!mongoose.isValidObjectId(id)) {
      const error = new Error('Invalid user id');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};