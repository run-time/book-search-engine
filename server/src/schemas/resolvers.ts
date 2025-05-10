import User from '../models/User.js';
import { signToken } from '../services/auth.js';
import { GraphQLError } from 'graphql';
import { BookInput } from './types.js';

// MongoDB connection status
import mongoose from 'mongoose';

// Create a custom AuthenticationError using GraphQLError
const AuthenticationError = (message: string): GraphQLError => {
  return new GraphQLError(message, {
    extensions: {
      code: 'UNAUTHENTICATED'
    }
  });
};

// Create a DatabaseError using GraphQLError
const DatabaseError = (message: string): GraphQLError => {
  return new GraphQLError(message, {
    extensions: {
      code: 'DATABASE_ERROR'
    }
  });
};

interface ResolverContext {
  user: {
    _id: unknown;
    username: string;
    email: string;
  } | null;
}

// Mock user data for when DB is not available
const mockUserData = {
  _id: 'mockuser123',
  username: 'demouser',
  email: 'demo@example.com',
  savedBooks: [
    {
      bookId: 'mock123',
      authors: ['Mock Author'],
      description: 'This is a mock book because the database is not available.',
      title: 'Database Connection Issues',
      image: 'https://via.placeholder.com/150',
      link: '#'
    }
  ],
  bookCount: 1
};

const resolvers = {
  Query: {
    me: async (_: any, __: any, { user }: ResolverContext) => {
      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        console.warn('Database not connected, returning mock data');
        
        if (!user) {
          throw AuthenticationError('Not logged in');
        }
        
        // Return mock data when DB is not connected
        return {
          ...mockUserData,
          _id: user._id,
          username: user.username,
          email: user.email
        };
      }
      
      // Normal operation when DB is connected
      if (!user) {
        throw AuthenticationError('Not logged in');
      }
      
      try {
        return await User.findOne({ _id: user._id });
      } catch (error) {
        console.error('Error fetching user:', error);
        throw DatabaseError('Error fetching user data');
      }
    },
  },

  Mutation: {
    addUser: async (_: any, { username, email, password }: { username: string; email: string; password: string }) => {
      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        throw DatabaseError('Database connection is currently unavailable. Please try again later.');
      }
      
      try {
        const user = await User.create({ username, email, password });
        const token = signToken(user.username, user.email, user._id);
        return { token, user };
      } catch (error) {
        console.error('Error creating user:', error);
        throw DatabaseError('Error creating user account');
      }
    },

    login: async (_: any, { email, password }: { email: string; password: string }) => {
      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        // For login, we can provide a demo account if DB is not available
        if (email === 'demo@example.com' && password === 'password123') {
          const token = signToken('demouser', 'demo@example.com', 'mockuser123');
          return { token, user: mockUserData };
        }
        
        throw DatabaseError('Database connection is currently unavailable. Please try again later.');
      }
      
      try {
        const user = await User.findOne({ email });
        
        if (!user) {
          throw AuthenticationError('No user found with this email address');
        }
        
        const correctPw = await user.isCorrectPassword(password);
        
        if (!correctPw) {
          throw AuthenticationError('Incorrect credentials');
        }
        
        const token = signToken(user.username, user.email, user._id);
        return { token, user };
      } catch (error) {
        // Don't expose internal errors to clients
        if (error instanceof GraphQLError) {
          throw error;
        }
        console.error('Login error:', error);
        throw new GraphQLError('An error occurred during login', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    saveBook: async (_: any, { input }: { input: BookInput }, { user }: ResolverContext) => {
      // Check authentication
      if (!user) {
        throw AuthenticationError('You need to be logged in!');
      }
      
      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        throw DatabaseError('Database connection is currently unavailable. Please try again later.');
      }
      
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (error) {
        console.error('Error saving book:', error);
        throw new GraphQLError('Error saving book', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    removeBook: async (_: any, { bookId }: { bookId: string }, { user }: ResolverContext) => {
      // Check authentication
      if (!user) {
        throw AuthenticationError('You need to be logged in!');
      }
      
      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        throw DatabaseError('Database connection is currently unavailable. Please try again later.');
      }
      
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        
        if (!updatedUser) {
          throw new GraphQLError("Couldn't find user with this id!", {
            extensions: { code: 'NOT_FOUND' }
          });
        }
        
        return updatedUser;
      } catch (error) {
        console.error('Error removing book:', error);
        throw new GraphQLError('Error removing book', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },
  },
};

export default resolvers;