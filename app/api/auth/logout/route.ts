import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
    
    // Clear the auth cookie directly on the response
    response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      expires: new Date(0),
      sameSite: 'strict',
    });
    
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