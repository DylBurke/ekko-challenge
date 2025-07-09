import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { organisationStructures, users, userPermissions } from '@/db/schema';
import { eq, like, or, inArray, and, gt } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Validate userId format (should be UUID)
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid user ID provided' },
        { status: 400 }
      );
    }

    // Step 1: Get requesting user's information and their permissions
    const requestingUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        spiritAnimal: users.spiritAnimal,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (requestingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Step 2: Get user's direct permissions (structures they have access to)
    const userDirectPermissions = await db
      .select({
        structureId: userPermissions.structureId,
        structureName: organisationStructures.name,
        structurePath: organisationStructures.path,
        structureLevel: organisationStructures.level,
      })
      .from(userPermissions)
      .innerJoin(organisationStructures, eq(userPermissions.structureId, organisationStructures.id))
      .where(eq(userPermissions.userId, userId));

    if (userDirectPermissions.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          userId,
          accessibleUsers: [],
          message: 'User has no permissions assigned',
        },
      });
    }

    // Step 3: Find all downstream structures using materialized paths
    // For each structure the user has access to, find all descendant structures
    const pathConditions = userDirectPermissions.map(permission => 
      like(organisationStructures.path, `${permission.structurePath}/%`)
    );

    // Also include the exact structures they have direct access to
    const exactStructureIds = userDirectPermissions.map(p => p.structureId);

    const allAccessibleStructures = await db
      .select({
        id: organisationStructures.id,
        name: organisationStructures.name,
        path: organisationStructures.path,
        level: organisationStructures.level,
      })
      .from(organisationStructures)
      .where(
        or(
          // Include descendant structures (children, grandchildren, etc.)
          ...pathConditions,
          // Include the exact structures they have direct access to
          inArray(organisationStructures.id, exactStructureIds)
        )
      );

    // Step 4: Find all users who have permissions to these accessible structures
    // BUT only include users who are positioned DOWNSTREAM from the requesting user
    const accessibleStructureIds = allAccessibleStructures.map(s => s.id);

    if (accessibleStructureIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          userId,
          accessibleUsers: [],
          message: 'No accessible structures found',
        },
      });
    }

    // Step 5: Get the requesting user's highest access level (lowest number = highest level)
    const requestingUserHighestLevel = Math.min(...userDirectPermissions.map(p => p.structureLevel));

        // Step 6: Find users who are positioned downstream from the requesting user
    // This means users whose permissions are to structures that are:
    // 1. Within the requesting user's accessible structures
    // 2. At a LOWER organizational level (higher number) than the requesting user's position
    // Simple rule: users can only see users with permissions to structures that are children of their structures
    
    const accessibleUsers = await db
      .select({
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        userRole: users.role,
        userSpiritAnimal: users.spiritAnimal,
        structureId: userPermissions.structureId,
        structureName: organisationStructures.name,
        structurePath: organisationStructures.path,
        structureLevel: organisationStructures.level,
      })
      .from(users)
      .innerJoin(userPermissions, eq(users.id, userPermissions.userId))
      .innerJoin(organisationStructures, eq(userPermissions.structureId, organisationStructures.id))
      .where(
        and(
          inArray(userPermissions.structureId, accessibleStructureIds),
          or(
            // Users at lower structural levels (downstream)
            and(
              gt(organisationStructures.level, requestingUserHighestLevel),
              // Ensure the user's structure path is actually downstream from requesting user's permissions
              or(
                ...userDirectPermissions.map(permission => 
                  like(organisationStructures.path, `${permission.structurePath}/%`)
                )
              )
            ),
            // Include requesting user themselves
            eq(users.id, userId)
          )
        )
      )
      .orderBy(organisationStructures.level, users.name);

    // Step 7: Group results by user to avoid duplicates
    const userMap = new Map();
    
    accessibleUsers.forEach(result => {
      if (!userMap.has(result.userId)) {
        userMap.set(result.userId, {
          id: result.userId,
          name: result.userName,
          email: result.userEmail,
          role: result.userRole,
          spiritAnimal: result.userSpiritAnimal,
          structures: [],
        });
      }
      
      userMap.get(result.userId).structures.push({
        id: result.structureId,
        name: result.structureName,
        path: result.structurePath,
        level: result.structureLevel,
      });
    });

    const finalResults = Array.from(userMap.values());

    return NextResponse.json({
      success: true,
      data: {
        userId,
        userPermissions: userDirectPermissions,
        accessibleStructures: allAccessibleStructures,
        accessibleUsers: finalResults,
        totalUsers: finalResults.length,
        totalStructures: allAccessibleStructures.length,
      },
    });

  } catch (error) {
    console.error('Error fetching accessible users:', error);
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