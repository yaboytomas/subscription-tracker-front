import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailHistory from '@/models/EmailHistory';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get current user from token
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await EmailHistory.countDocuments({ userId: currentUser.id });
    
    // Fetch email history records
    const emailHistory = await EmailHistory.find({ userId: currentUser.id })
      .sort({ changedAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);
      
    return NextResponse.json({
      success: true,
      data: {
        emailHistory,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching email history:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 