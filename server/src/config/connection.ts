import mongoose from 'mongoose';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

// MongoDB Atlas connection URI with additional options for Render environment
const defaultUri = "mongodb+srv://jmont23:thetester@cluster0.sxoiyua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const uri = process.env.MONGODB_URI || defaultUri;

// Additional connection options for Render
// Add these options to help with SSL issues on Render
const renderUriSuffix = "&ssl=true&tlsAllowInvalidCertificates=true&tlsAllowInvalidHostnames=true";

// Add the suffix if it's not already there
const finalUri = uri.includes('&ssl=') ? uri : `${uri}${renderUriSuffix}`;

console.log(`MongoDB connection URI created. SSL options ${uri.includes('&ssl=') ? 'already present' : 'added'}`);

// Configure mongoose options for better reliability
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // 5 seconds timeout during server selection
  socketTimeoutMS: 45000, // 45 seconds timeout for operations
  family: 4, // Use IPv4, skip trying IPv6
  ssl: true,
  retryWrites: true,
  autoIndex: false, // Don't build indexes in production
  minPoolSize: 2,
  maxPoolSize: 10,
  // SSL options to help with Render
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  tlsInsecure: true,
};

// For direct MongoDB operations if needed
const client = new MongoClient(finalUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Add SSL options
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
});

// Connect using Mongoose for schema-based operations
console.log('Attempting to connect to MongoDB...');
try {
  mongoose.connect(finalUri, mongooseOptions)
    .then(() => console.log('Mongoose connection successful'))
    .catch(error => console.error('Mongoose connection error:', error));
} catch (error) {
  console.error('Error setting up MongoDB connection:', error);
}

// Log connection status
const dbConnection = mongoose.connection;

dbConnection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
});

dbConnection.once('open', () => {
  console.log('Connected to MongoDB via Mongoose');
});

// Function to test direct MongoDB connection
export async function testMongoConnection() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    return true;
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return false;
  } finally {
    try {
      await client.close();
    } catch (error) {
      console.error('Error closing MongoDB client:', error);
    }
  }
}

export default dbConnection;