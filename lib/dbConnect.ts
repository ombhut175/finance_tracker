import mongoose from 'mongoose';

interface ConnectionObject {
  isConnected?: number;
}

const connection: ConnectionObject = {};

export async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log('Already connected to database');
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || '');

    connection.isConnected = db.connections[0].readyState;

    console.log('database connected successfully');
  } catch (error) {
    console.error('error while connecting database : ' + error);

    process.exit(0);
  }
}
