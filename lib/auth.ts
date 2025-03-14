import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import User, { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d'; // Token expiry time

// Create JWT token
export const createToken = (user: any) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      name: user.name 
    }, 
    JWT_SECRET, 
    { expiresIn: TOKEN_EXPIRY }
  );
};

// Set cookie with token
export const setTokenCookie = (token: string) => {
  // Clear any existing token first
  cookies().delete('token');
  
  // Set the new token
  cookies().set({
    name: 'token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'strict',
  });
};

// Delete auth cookie
export const deleteTokenCookie = () => {
  // Standard deletion
  cookies().delete('token');
  
  // Force expiration by setting to epoch time
  cookies().set({
    name: 'token',
    value: '',
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    expires: new Date(0),
    sameSite: 'strict',
  });
};

// Verify token without database lookup
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

// Get current user from token
export const getCurrentUser = async (req: NextRequest) => {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      console.log('No token found in request cookies');
      return null;
    }
    
    console.log('Token found, attempting to decode');
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    console.log('Token decoded successfully, user ID:', decoded.id);
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log('No user found with ID:', decoded.id);
      return null;
    }
    
    console.log('User found successfully:', user.name, user.email);
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}; 