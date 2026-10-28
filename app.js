import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dns from 'node:dns';

import { PORT } from './config/env.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscriptions.routes.js';
import connectToDatabase from './database/mongodb.js';
import errorMiddleware from './middleware/error.middleware.js';
import { apiLimiter, authLimiter } from './middleware/rateLimit.middleware.js';
import workflowRouter from './routes/workflow.routes.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

app.use(helmet());
app.use(apiLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);

app.get('/', (req, res) => {
  res.send('welcome to the app');
});

// Error handler goes last, after all routes
app.use(errorMiddleware);

app.listen(PORT, async () => {
  console.log(`Subscription tracking app is running on http://localhost:${PORT}`);
  await connectToDatabase();
});

export default app;