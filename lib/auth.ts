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
  cookies().delete('token');
};

// Get current user from token
export const getCurrentUser = async (req: NextRequest) => {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return null;
    }
    
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