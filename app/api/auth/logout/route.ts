import { NextRequest, NextResponse } from 'next/server';
import { deleteTokenCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Clear the auth cookie
    deleteTokenCookie();
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 