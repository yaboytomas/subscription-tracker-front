import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmailHistory from '@/models/EmailHistory';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';
import { 
  sendEmailChangeNotificationToOldEmail, 
  sendEmailChangeConfirmationToNewEmail 
} from '@/lib/email-service';
import { updateRegistryEmail, updateUserRegistry } from '@/lib/registry-utils';

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    // Get current user from token
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { newEmail, password, reason } = body;
    
    // Basic validation
    if (!newEmail || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    
    // Get user with password field included (it's normally excluded)
    const user = await User.findById(currentUser.id).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Password is incorrect' },
        { status: 401 }
      );
    }
    
    // If the new email is the same as the current one, no need to update
    if (user.email === newEmail) {
      return NextResponse.json({
        success: true,
        message: 'Email remains unchanged',
      });
    }
    
    // Check if email is already in use
    const existingUser = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email is already in use' },
        { status: 400 }
      );
    }
    
    // Get client IP and user agent for audit trail
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Store old email before updating
    const previousEmail = user.email;
    
    // Store email change history
    const emailHistory = new EmailHistory({
      userId: user._id,
      previousEmail,
      newEmail: newEmail,
      changedAt: new Date(),
      reason: reason || 'User requested change',
      ipAddress,
      userAgent
    });
    
    await emailHistory.save();
    console.log(`Email history recorded for user ${user._id}: ${previousEmail} → ${newEmail}`);
    
    // Update the user registry
    await updateRegistryEmail(user._id.toString(), previousEmail, newEmail);
    
    // Update email
    user.email = newEmail;
    await user.save();
    
    // Send notification emails
    try {
      // Send notification to the old email
      await sendEmailChangeNotificationToOldEmail({
        name: user.name,
        previousEmail,
        newEmail,
        ipAddress
      });
      
      // Send confirmation to the new email
      await sendEmailChangeConfirmationToNewEmail({
        name: user.name,
        previousEmail,
        newEmail
      });
      
      console.log('Email change notifications sent successfully');
    } catch (emailError) {
      // Don't fail the request if emails fail, just log it
      console.error('Failed to send email change notifications:', emailError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Email updated successfully',
      data: {
        previousEmail,
        newEmail
      }
    });
  } catch (error: any) {
    console.error('Error changing email:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 