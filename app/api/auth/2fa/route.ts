import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { send2FACodeEmail } from '@/lib/email-service';

// Simple in-memory store for 2FA codes (would use Redis or similar in production)
const twoFactorCodes = new Map<string, { code: string, expiresAt: Date }>();

// Generate a random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send 2FA code to the user's email
export async function POST(req: NextRequest) {
  try {
    console.log("2FA code generation request received");
    
    // Connect to database
    await dbConnect();
    
    // Parse request body
    const body = await req.json();
    const { email } = body;
    
    console.log("Generating 2FA code for:", email);
    
    if (!email) {
      console.log("Email is required but not provided");
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Generate 2FA code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    console.log(`Generated 2FA code for ${email}: ${code}, expires at ${expiresAt}`);
    
    // Store code in memory (would use Redis or DB in production)
    twoFactorCodes.set(email, { code, expiresAt });
    
    // Send code via email
    const emailResult = await send2FACodeEmail(
      { email: user.email, name: user.name },
      code,
      10 // 10 minutes
    );
    
    console.log(`2FA code email sent to ${email}:`, emailResult ? "success" : "failed");
    
    // Return success without revealing the code
    return NextResponse.json({
      success: true,
      message: '2FA code sent to your email',
      expiresAt
    });
  } catch (error: any) {
    console.error('2FA error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify the 2FA code
export async function PUT(req: NextRequest) {
  try {
    console.log("2FA code verification request received");
    
    // Parse request body
    const body = await req.json();
    const { email, code } = body;
    
    console.log(`Verifying 2FA code for ${email}: ${code}`);
    
    if (!email || !code) {
      console.log("Email and code are required but not provided");
      return NextResponse.json(
        { success: false, message: 'Email and code are required' },
        { status: 400 }
      );
    }
    
    // Check if we have a code for this email
    const storedCode = twoFactorCodes.get(email);
    if (!storedCode) {
      console.log(`No stored code found for ${email}`);
      return NextResponse.json(
        { success: false, message: 'No 2FA code found or code expired' },
        { status: 400 }
      );
    }
    
    console.log(`Stored code for ${email}: ${storedCode.code}, expires at ${storedCode.expiresAt}`);
    
    // Check if code is expired
    if (new Date() > storedCode.expiresAt) {
      // Clean up expired code
      twoFactorCodes.delete(email);
      console.log(`Code expired for ${email}`);
      return NextResponse.json(
        { success: false, message: 'Code expired. Please request a new code' },
        { status: 400 }
      );
    }
    
    // Verify code
    if (code !== storedCode.code) {
      console.log(`Invalid code for ${email}: expected ${storedCode.code}, got ${code}`);
      return NextResponse.json(
        { success: false, message: 'Invalid code' },
        { status: 400 }
      );
    }
    
    // Clean up used code
    twoFactorCodes.delete(email);
    console.log(`2FA verification successful for ${email}`);
    
    // Return success
    return NextResponse.json({
      success: true,
      message: '2FA verification successful'
    });
  } catch (error: any) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 