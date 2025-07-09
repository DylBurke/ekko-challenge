import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { users } from '@/db/schema';

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