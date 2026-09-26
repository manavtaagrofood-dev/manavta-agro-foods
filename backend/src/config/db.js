import mongoose from 'mongoose';
import { env } from './env.js';
export async function connectDb() {
  if (!env.mongoUri) throw new Error('MONGODB_URI is required');
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000, maxPoolSize: 10, minPoolSize: 1 });
  return mongoose.connection;
}
export async function disconnectDb() { await mongoose.disconnect(); }
export function dbState() { return { state: mongoose.connection.readyState, name: mongoose.connection.name || null }; }
