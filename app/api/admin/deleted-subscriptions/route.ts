import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import DeletedSubscription from '@/models/DeletedSubscription';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';

// Admin role check
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const deletionMethod = searchParams.get('deletionMethod');
    
    // Build query
    const query: any = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    if (deletionMethod) {
      query.deletionMethod = deletionMethod;
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
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await DeletedSubscription.countDocuments(query);
    
    // Get paginated results
    const deletedSubscriptions = await DeletedSubscription.find(query)
      .sort({ deletedAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);
    
    // Get unique users for the sidebar filter
    const uniqueUsers = await DeletedSubscription.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    // Get categories for the filter
    const categories = await DeletedSubscription.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Return data
    return NextResponse.json({
      success: true,
      data: {
        deletedSubscriptions,
        filters: {
          users: uniqueUsers,
          categories: categories.map(c => c._id)
        },
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          page,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching deleted subscriptions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch deleted subscriptions' },
      { status: 500 }
    );
  }
} 