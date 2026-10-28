import { config } from 'dotenv';

const result = config({
    path: `.env.${process.env.NODE_ENV || 'developement'}.local`
});

console.log('Env file path:', `.env.${process.env.NODE_ENV || 'development'}.local`);
console.log('Dotenv error:', result.error);
console.log('Loaded variables:', result.parsed);
console.log('PORT:', process.env.PORT);

export const {
  PORT,
  NODE_ENV,
  DB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  QSTASH_URL,
  QSTASH_TOKEN,
  SERVER_URL,
  EMAIL_USER,
  EMAIL_PASSWORD,
} = process.env;