import jwt from 'jsonwebtoken';

import User from '../models/user.model.js';
import { JWT_SECRET } from '../config/env.js';

const authorize = async (req, res, next) => {
  try {
    let token;

    // Expect the header: Authorization: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized: no token provided' });
    }

    // Throws if the token is invalid or expired
    const decoded = jwt.verify(token, JWT_SECRET);

    // Make sure the user still exists
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: user no longer exists' });
    }

    // Attach the user so later controllers know who is making the request
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
      error: error.message,
    });
  }
};

export default authorize;