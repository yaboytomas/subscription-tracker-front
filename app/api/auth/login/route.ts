import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createToken, setTokenCookie } from '@/lib/auth';
import { sendSignInVerificationEmail } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    // Parse request body
    const body = await req.json();
    const { email, password, twoFactorCode } = body;
    
    console.log("Login attempt for:", email, "with 2FA code?", !!twoFactorCode);
    
    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide email and password' },
        { status: 400 }
      );
    }
    
    // Find user and include password for verification in a single query
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log("User not found:", email);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if user exists and verify password in one step
    const passwordValid = await user.comparePassword(password);
    if (!passwordValid) {
      console.log("Invalid password for:", email);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if 2FA is required for this user
    const securityPreferences = user.securityPreferences || {};
    const twoFactorEnabled = securityPreferences.twoFactorEnabled || false;
    const alwaysRequire2FA = securityPreferences.alwaysRequire2FA || false;
    
    console.log("User security preferences:", {
      email: user.email,
      securityPrefs: JSON.stringify(securityPreferences),
      twoFactorEnabled: twoFactorEnabled,
      alwaysRequire2FA: alwaysRequire2FA,
      twoFactorCodeProvided: !!twoFactorCode
    });
    
    // Require 2FA if both:
    // 1. 2FA is enabled
    // 2. No code provided
    if (twoFactorEnabled && !twoFactorCode) {
      console.log("2FA is enabled but no code provided, triggering 2FA flow");
      // User has 2FA enabled but no code provided - trigger 2FA process
      try {
        // Call 2FA endpoint to send code
        const twoFARequest = await fetch(`${req.nextUrl.origin}/api/auth/2fa`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        
        const twoFAResponse = await twoFARequest.json();
        console.log("2FA code sent response:", twoFAResponse);
        
        if (twoFAResponse.success) {
          // Return indication that 2FA is required
          return NextResponse.json({
            success: false,
            requiresTwoFactor: true,
            message: 'Two-factor authentication code sent to your email',
            expiresAt: twoFAResponse.expiresAt
          }, { status: 200 });
        } else {
          throw new Error(twoFAResponse.message || 'Failed to send 2FA code');
        }
      } catch (twoFAError: any) {
        console.error('2FA error:', twoFAError);
        return NextResponse.json(
          { success: false, message: twoFAError.message || 'Failed to send 2FA code' },
          { status: 500 }
        );
      }
    }
    
    // If 2FA is enabled and code is provided, verify it
    if (twoFactorEnabled && twoFactorCode) {
      console.log("Verifying 2FA code");
      try {
        // Call 2FA endpoint to verify code
        const verifyRequest = await fetch(`${req.nextUrl.origin}/api/auth/2fa`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, code: twoFactorCode }),
        });
        
        const verifyResponse = await verifyRequest.json();
        console.log("2FA verification response:", verifyResponse);
        
        if (!verifyResponse.success) {
          return NextResponse.json({
            success: false,
            message: verifyResponse.message || 'Invalid 2FA code',
          }, { status: 401 });
        }
      } catch (verifyError: any) {
        console.error('2FA verification error:', verifyError);
        return NextResponse.json(
          { success: false, message: verifyError.message || 'Failed to verify 2FA code' },
          { status: 500 }
        );
      }
    }
    
    // Get IP and device info from request
    const ipAddress = req.headers.get('x-forwarded-for') || 'Unknown';
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    
    // Attempt to send sign-in verification email (don't block login if it fails)
    try {
      const loginInfo = {
        ipAddress: ipAddress.toString(),
        deviceInfo: userAgent,
        location: 'Unknown', // You could use a geolocation service here
        time: new Date()
      };
      
      // Send sign-in verification email in the background
      sendSignInVerificationEmail(
        { email: user.email, name: user.name },
        loginInfo
      ).catch(error => console.error('Failed to send sign-in verification email:', error));
      
      console.log('Sign-in verification email triggered for:', user.email);
    } catch (emailError) {
      // Log but don't block login
      console.error('Error sending sign-in verification email:', emailError);
    }
    
    console.log("Login successful, returning success response");
    
    // Generate token and set cookie in parallel
    const [token] = await Promise.all([
      createToken(user),
      setTokenCookie(createToken(user))
    ]);
    
    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 