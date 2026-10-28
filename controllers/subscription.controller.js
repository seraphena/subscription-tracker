import mongoose from 'mongoose';

import Subscription, { getNextRenewalDate } from '../models/subscription.model.js';
import { workflowClient } from '../config/upstash.js';
import { SERVER_URL } from '../config/env.js';


const baseUrl = SERVER_URL || `http://localhost:${PORT}`;


const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Only these fields can be set by the client
const ALLOWED_FIELDS = ['name', 'price', 'currency', 'frequency', 'category', 'paymentMethod', 'startDate'];

const pickAllowed = (body) =>
  Object.fromEntries(Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key)));

// Keeps renewal dates and statuses up to date before we read them
const syncRenewals = async (userId) => {
  const stale = await Subscription.find({
    user: userId,
    status: { $in: ['active', 'cancelled'] },
    renewalDate: { $lt: new Date() },
  });

  for (const subscription of stale) {
    if (subscription.status === 'active') {
      subscription.renewalDate = getNextRenewalDate(subscription.startDate, subscription.frequency);
    } else {
      subscription.status = 'expired';
    }
    await subscription.save();
  }
};

// Finds a subscription and makes sure it belongs to the logged-in user
const findOwnedSubscription = async (id, userId) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError('Invalid subscription id', 400);
  }

  const subscription = await Subscription.findById(id);

  if (!subscription) {
    throw createError('Subscription not found', 404);
  }

  if (subscription.user.toString() !== userId.toString()) {
    throw createError('You are not allowed to access this subscription', 403);
  }

  return subscription;
};

// POST /api/v1/subscriptions
// POST /api/v1/subscriptions
export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...pickAllowed(req.body),
      user: req.user._id,
    });

    // Start the reminder workflow, but never let it block or break the request
    try {
      const result = await Promise.race([
        workflowClient.trigger({
          url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
          body: { subscriptionId: subscription.id },
          headers: { 'content-type': 'application/json' },
          retries: 0,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Workflow trigger timed out')), 5000)
        ),
      ]);
      console.log('Workflow started, run id:', result.workflowRunId);
    } catch (workflowError) {
      console.error('Could not start reminder workflow:', workflowError.message);
    }

    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/subscriptions  (optional ?status=active|cancelled|expired)
export const getSubscriptions = async (req, res, next) => {
  try {
    await syncRenewals(req.user._id);

    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const subscriptions = await Subscription.find(filter).sort({ renewalDate: 1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/subscriptions/user/:id
export const getUserSubscriptions = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      throw createError('You are not the owner of this account', 403);
    }

    await syncRenewals(req.user._id);

    const subscriptions = await Subscription.find({ user: req.params.id }).sort({ renewalDate: 1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/subscriptions/upcoming-renewals  (optional ?days=7)
export const getUpcomingRenewals = async (req, res, next) => {
  try {
    await syncRenewals(req.user._id);

    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 365);
    const now = new Date();
    const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const subscriptions = await Subscription.find({
      user: req.user._id,
      status: 'active',
      renewalDate: { $gte: now, $lte: until },
    }).sort({ renewalDate: 1 });

    res.status(200).json({
      success: true,
      days,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/subscriptions/:id
export const getSubscription = async (req, res, next) => {
  try {
    await syncRenewals(req.user._id);

    const subscription = await findOwnedSubscription(req.params.id, req.user._id);

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/subscriptions/:id
export const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await findOwnedSubscription(req.params.id, req.user._id);

    subscription.set(pickAllowed(req.body));
    await subscription.save(); // runs validation and recalculates the renewal date if needed

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/subscriptions/:id/cancel
export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await findOwnedSubscription(req.params.id, req.user._id);

    if (subscription.status !== 'active') {
      throw createError(`Subscription is already ${subscription.status}`, 400);
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled. It stays valid until the renewal date.',
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/subscriptions/:id
export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await findOwnedSubscription(req.params.id, req.user._id);

    await subscription.deleteOne();

    res.status(200).json({ success: true, message: 'Subscription deleted' });
  } catch (error) {
    next(error);
  }
};