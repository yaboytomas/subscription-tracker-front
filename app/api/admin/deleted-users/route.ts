import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import DeletedUser from '@/models/DeletedUser';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';

// Admin role check - ensure this is a privileged operation
const isAdmin = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    // You can implement role-based access control here
    // For now, we'll assume all valid users with ID 'adminId' are admins
    return user && user._id.toString() === process.env.ADMIN_USER_ID;
  } catch (error) {
    return false;
  }
};

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Get token from cookie
    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token and get user ID
    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminCheck = await isAdmin(decodedToken.id);
    if (!adminCheck) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const email = searchParams.get('email');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    
    // Build query
    const query: any = {};
    
    if (email) {
      query.email = { $regex: email, $options: 'i' }; // Case-insensitive search
    }
    
    if (fromDate || toDate) {
      query.deletedAt = {};
      if (fromDate) {
        query.deletedAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        query.deletedAt.$lte = new Date(toDate);
      }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await DeletedUser.countDocuments(query);
    
    // Get paginated results
    const deletedUsers = await DeletedUser.find(query)
      .sort({ deletedAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);
    
    // Return data
    return NextResponse.json({
      success: true,
      data: {
        deletedUsers,
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          page,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching deleted users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch deleted users' },
      { status: 500 }
    );
  }
} 