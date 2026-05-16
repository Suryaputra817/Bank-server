import dotenv from "dotenv";
const config = {
  MONGO_URI: process.env.MONGO_URI,
  GOOGLE_USER_EMAIL: process.env.EMAIL_USER,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
  EMAIL_PASS: process.env.EMAIL_PASS,
};

export default config;
