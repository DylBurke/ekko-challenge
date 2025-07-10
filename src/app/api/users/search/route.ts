import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { users } from '@/db/schema';
import { ilike, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const limit = parseInt(searchParams.get('limit') || '50');

    // Validate query parameter
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Query parameter must be at least 2 characters long'
      }, { status: 400 });
    }

    // Limit results to prevent performance issues
    const maxLimit = Math.min(limit, 100);

    // Search users by name or email (case-insensitive)
    const searchPattern = `%${query}%`;
    const searchResults = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        spiritAnimal: users.spiritAnimal,
      })
      .from(users)
      .where(
        or(
          ilike(users.name, searchPattern),
          ilike(users.email, searchPattern)
        )
      )
      .orderBy(users.name)
      .limit(maxLimit);

    return NextResponse.json({
      success: true,
      data: searchResults,
      total: searchResults.length,
      query: query,
      limit: maxLimit
    });

  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}