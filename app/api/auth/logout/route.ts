import { NextRequest, NextResponse } from 'next/server';
import { deleteTokenCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Clear the auth cookie
    deleteTokenCookie();
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
    
    // Set explicit cookie clearing headers for extra security
    response.headers.set('Set-Cookie', 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict');
    
    // Add Clear-Site-Data header to clear client-side storage
    // This is supported in most modern browsers and helps clear localStorage, sessionStorage, etc.
    response.headers.set('Clear-Site-Data', '"cookies", "storage"');
    
    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 