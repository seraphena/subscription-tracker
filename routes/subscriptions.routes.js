import { Router } from 'express';

import authorize from '../middleware/auth.middleware.js';
import {
  createSubscription,
  getSubscriptions,
  getSubscription,
  getUserSubscriptions,
  getUpcomingRenewals,
  updateSubscription,
  cancelSubscription,
  deleteSubscription,
} from '../controllers/subscription.controller.js';

const subscriptionRouter = Router();

// Fixed paths must come BEFORE '/:id', or '/:id' would swallow them
subscriptionRouter.get('/', authorize, getSubscriptions);
subscriptionRouter.get('/upcoming-renewals', authorize, getUpcomingRenewals);
subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions);

subscriptionRouter.post('/', authorize, createSubscription);

subscriptionRouter.get('/:id', authorize, getSubscription);
subscriptionRouter.put('/:id/cancel', authorize, cancelSubscription);
subscriptionRouter.put('/:id', authorize, updateSubscription);
subscriptionRouter.delete('/:id', authorize, deleteSubscription);

export default subscriptionRouter;