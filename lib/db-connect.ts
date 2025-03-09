import mongoose from 'mongoose';

// Connection cache
let cachedConnection: typeof mongoose | null = null;

async function dbConnect(): Promise<typeof mongoose> {
  // Return cached connection if exists
  if (cachedConnection) {
    return cachedConnection;
  }

  // If no cached connection, create a new one
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env'
    );
  }

  try {
    const opts = {
      bufferCommands: false,
    };

    const connection = await mongoose.connect(MONGODB_URI, opts);
    cachedConnection = connection;
    
    console.log('MongoDB connected successfully');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default dbConnect; 