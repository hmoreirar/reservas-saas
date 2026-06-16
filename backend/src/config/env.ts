import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = ['JWT_SECRET'] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const JWT_SECRET = process.env.JWT_SECRET as string;
