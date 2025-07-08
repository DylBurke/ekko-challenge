import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { organisationStructures, users, userPermissions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface AssignPermissionRequest {
  userId: string;
  structureId: string;
}

interface AssignPermissionResponse {
  success: boolean;
  data?: {
    permission: {
      id: string;
      userId: string;
      structureId: string;
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
      structure: {
        id: string;
        name: string;
        path: string;
        level: number;
        levelName: string;
      };
      assignedAt: Date;
    };
  };
  error?: string;
  message?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<AssignPermissionResponse>> {
  try {
    // Parse and validate request body
    const body: AssignPermissionRequest = await request.json();
    
    if (!body.userId || !body.structureId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          message: 'Both userId and structureId are required'
        },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.userId) || !uuidRegex.test(body.structureId)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid ID format',
          message: 'User ID and Structure ID must be valid UUIDs'
        },
        { status: 400 }
      );
    }

    // Step 1: Verify user exists
    const userExists = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, body.userId))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found',
          message: `No user found with ID: ${body.userId}`
        },
        { status: 404 }
      );
    }

    // Step 2: Verify structure exists
    const structureExists = await db
      .select({
        id: organisationStructures.id,
        name: organisationStructures.name,
        path: organisationStructures.path,
        level: organisationStructures.level,
      })
      .from(organisationStructures)
      .where(eq(organisationStructures.id, body.structureId))
      .limit(1);

    if (structureExists.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Structure not found',
          message: `No organizational structure found with ID: ${body.structureId}`
        },
        { status: 404 }
      );
    }

    // Step 3: Check if permission already exists
    const existingPermission = await db
      .select()
      .from(userPermissions)
      .where(
        and(
          eq(userPermissions.userId, body.userId),
          eq(userPermissions.structureId, body.structureId)
        )
      )
      .limit(1);

    if (existingPermission.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Permission already exists',
          message: `User ${userExists[0].name} already has access to ${structureExists[0].name}`
        },
        { status: 409 }
      );
    }

    // Step 4: Create the permission
    const newPermission = await db
      .insert(userPermissions)
      .values({
        userId: body.userId,
        structureId: body.structureId,
      })
      .returning();

    // Step 5: Return success response with full details
    const user = userExists[0];
    const structure = structureExists[0];

    return NextResponse.json({
      success: true,
      data: {
        permission: {
          id: newPermission[0].id,
          userId: user.id,
          structureId: structure.id,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          structure: {
            id: structure.id,
            name: structure.name,
            path: structure.path,
            level: structure.level,
            levelName: getLevelName(structure.level),
          },
          assignedAt: newPermission[0].createdAt,
        },
      },
    });

  } catch (error) {
    console.error('Error assigning permission:', error);
    
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

// Helper function to get level name
function getLevelName(level: number): string {
  const levelNames: Record<number, string> = {
    0: 'Company',
    1: 'Division',
    2: 'Department', 
    3: 'Team',
  };
  return levelNames[level] || `Level ${level}`;
} 