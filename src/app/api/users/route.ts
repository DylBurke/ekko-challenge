import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// I wrote this route to get the users from the database
export async function GET() {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        spiritAnimal: users.spiritAnimal,
      })
      .from(users)
      .orderBy(users.name);

    return NextResponse.json({
      success: true,
      data: allUsers,
      total: allUsers.length,
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

interface CreateUserRequest {
  name: string;
  email: string;
  role: string;
  spiritAnimal: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: CreateUserRequest = await request.json();
    
    if (!body.name || !body.email || !body.role || !body.spiritAnimal) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          message: 'Name, email, role, and spirit animal are all required'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email format',
          message: 'Please provide a valid email address'
        },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User already exists',
          message: `A user with email ${body.email} already exists`
        },
        { status: 409 }
      );
    }

    // Create the user
    const newUser = await db
      .insert(users)
      .values({
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        role: body.role.trim(),
        spiritAnimal: body.spiritAnimal.trim(),
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        spiritAnimal: users.spiritAnimal,
      });

    return NextResponse.json({
      success: true,
      data: newUser[0],
      message: `User ${newUser[0].name} created successfully`,
    });

  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 