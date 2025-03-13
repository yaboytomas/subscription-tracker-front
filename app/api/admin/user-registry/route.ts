import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import UserRegistry from '@/models/UserRegistry';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';

// Cache duration in seconds (2 minutes for admin data)
const CACHE_DURATION = 120;

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
    const name = searchParams.get('name');
    const minSpend = searchParams.get('minSpend') ? parseFloat(searchParams.get('minSpend') || '0') : null;
    const maxSpend = searchParams.get('maxSpend') ? parseFloat(searchParams.get('maxSpend') || '0') : null;
    
    // Build query
    const query: any = {};
    
    if (email) {
      query.$or = [
        { currentEmail: { $regex: email, $options: 'i' } },
        { 'emailHistory.email': { $regex: email, $options: 'i' } }
      ];
    }
    
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    
    if (minSpend !== null || maxSpend !== null) {
      query.totalMonthlySpend = {};
      
      if (minSpend !== null) {
        query.totalMonthlySpend.$gte = minSpend;
      }
      
      if (maxSpend !== null) {
        query.totalMonthlySpend.$lte = maxSpend;
      }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await UserRegistry.countDocuments(query);
    
    // Get paginated results
    const registries = await UserRegistry.find(query)
      .sort({ lastUpdated: -1 }) // Most recently updated first
      .skip(skip)
      .limit(limit);
    
    // Create response with data
    const response = NextResponse.json({
      success: true,
      data: {
        registries,
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          page,
          limit
        }
      }
    });

    // Add caching headers
    response.headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=30`);
    
    // Create a unique ETag based on the query parameters and latest registry update
    const latestUpdate = registries.length > 0 
      ? Math.max(...registries.map(reg => reg.lastUpdated.getTime()))
      : Date.now();
    const queryHash = JSON.stringify({ email, name, minSpend, maxSpend });
    response.headers.set('ETag', `"${queryHash}-${latestUpdate}"`);

    return response;
  } catch (error) {
    console.error('Error fetching user registries:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user registries' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    // Parse request body
    const body = await req.json();
    const { action, userId } = body;
    
    if (!action || !userId) {
      return NextResponse.json(
        { success: false, message: 'Action and userId are required' },
        { status: 400 }
      );
    }
    
    // Perform requested action
    switch (action) {
      case 'rebuild':
        // Find all users
        if (userId === 'all') {
          const users = await User.find({});
          let successCount = 0;
          let failCount = 0;
          
          for (const user of users) {
            try {
              // Force a full rebuild of the registry for this user
              const registry = await UserRegistry.findOne({ userId: user._id });
              
              if (registry) {
                await UserRegistry.deleteOne({ userId: user._id });
              }
              
              // Recreate the registry from scratch using existing data
              const newRegistry = new UserRegistry({
                userId: user._id,
                name: user.name,
                currentEmail: user.email,
                emailHistory: [
                  {
                    email: user.email,
                    isPrimary: true,
                    isVerified: true,
                    addedAt: user.createdAt,
                    source: 'signup'
                  }
                ],
                subscriptions: [],
                totalMonthlySpend: 0,
                accountCreatedAt: user.createdAt,
                lastActive: new Date(),
              });
              
              await newRegistry.save();
              successCount++;
            } catch (error) {
              console.error(`Error rebuilding registry for user ${user._id}:`, error);
              failCount++;
            }
          }
          
          return NextResponse.json({
            success: true,
            message: `Registry rebuild complete. Success: ${successCount}, Failed: ${failCount}`,
          });
        } else {
          // Rebuild just for specified user
          const user = await User.findById(userId);
          
          if (!user) {
            return NextResponse.json(
              { success: false, message: 'User not found' },
              { status: 404 }
            );
          }
          
          // Delete existing registry
          await UserRegistry.deleteOne({ userId });
          
          // Create new blank registry
          const newRegistry = new UserRegistry({
            userId: user._id,
            name: user.name,
            currentEmail: user.email,
            emailHistory: [
              {
                email: user.email,
                isPrimary: true,
                isVerified: true,
                addedAt: user.createdAt,
                source: 'signup'
              }
            ],
            subscriptions: [],
            totalMonthlySpend: 0,
            accountCreatedAt: user.createdAt,
            lastActive: new Date(),
          });
          
          await newRegistry.save();
          
          return NextResponse.json({
            success: true,
            message: `Registry rebuilt for user ${userId}`,
          });
        }
        
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing user registries:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to manage user registries' },
      { status: 500 }
    );
  }
} 