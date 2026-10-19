
import express from 'express';
import cookieParser from 'cookie-parser';


import { PORT } from './config/env.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscriptions.routes.js';
import connectToDatabase from './Database/mongodb.js';
import dns from 'node:dns';
import errorMiddleware from './middleware/error.middleware.js';
import cookieParser from 'cookie-parser';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();
app.use(express.json());
app.use (express.urlencoded(options,{ extended:false}));
app.use(cookieParser())

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/subscriptions',subscriptionRouter);
app.use(errorMiddleware)



app.get('/', (req, res) => {
    res.send('welcome to the app');
});

app.listen(PORT,  async () => {
    console.log(`Subscription tracking app is running on http://localhost:${PORT}`);
    await connectToDatabase();



});

export default app;

