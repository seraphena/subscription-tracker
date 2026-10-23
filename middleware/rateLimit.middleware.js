import { rateLimit } from 'express-rate-limit';

const handler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later',
  });
};

// General limiter for the whole API: 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler,
});

// Strict limiter for sign-up and sign-in: 10 attempts per 15 minutes per IP
// This is what stops password guessing and fake-account spam
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler,
});
// Blocks requests with no User-Agent or with obvious scripted clients
const blockedAgents = /curl|wget|python-requests|scrapy|httpclient|libwww/i;

export const botFilter = (req, res, next) => {
  const agent = req.headers['user-agent'];

  if (!agent || blockedAgents.test(agent)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  next();
};