import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { organisationStructures, users, userPermissions } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

interface PermissionDetail {
  permissionId: string;
  structureId: string;
  structureName: string;
  structurePath: string;
  parentId: string | null;
  assignedAt: Date;
}

interface UpdatePermissionsRequest {
  structureIds: string[];
}

interface UpdatePermissionsResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    changes: {
      added: {
        id: string;
        name: string;
        path: string;
        level: number;
        levelName: string;
      }[];
      removed: {
        id: string;
        name: string;
        path: string;
        level: number;
        levelName: string;
      }[];
      unchanged: {
        id: string;
        name: string;
        path: string;
        level: number;
        levelName: string;
      }[];
    };
    newPermissions: {
      permissionId: string;
      structure: {
        id: string;
        name: string;
        path: string;
        level: number;
        levelName: string;
        parentId: string | null;
      };
      assignedAt: Date;
    }[];
    summary: {
      totalPermissions: number;
      permissionsAdded: number;
      permissionsRemoved: number;
      permissionsUnchanged: number;
    };
  };
  error?: string;
  message?: string;
}

// This route is designed to get the permissions for a user 
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

    // Step 1: Get user basic info first
    const userInfo = await db
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

    if (userInfo.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found',
          message: `No user found with ID: ${userId}`
        },
        { status: 404 }
      );
    }

    const user = userInfo[0];

    // Step 2: Get user's direct permissions with structure details
    const userDirectPermissions = await db
      .select({
        permissionId: userPermissions.id,
        structureId: userPermissions.structureId,
        structureName: organisationStructures.name,
        structurePath: organisationStructures.path,
        structureLevel: organisationStructures.level,
        parentId: organisationStructures.parentId,
        assignedAt: userPermissions.createdAt,
      })
      .from(userPermissions)
      .innerJoin(organisationStructures, eq(userPermissions.structureId, organisationStructures.id))
      .where(eq(userPermissions.userId, userId))
      .orderBy(organisationStructures.level, organisationStructures.name);

    // Step 3: Construct permission summary
    const permissionSummary = {
      totalPermissions: userDirectPermissions.length,
      levelDistribution: userDirectPermissions.reduce((acc, perm) => {
        const levelName = getLevelName(perm.structureLevel);
        acc[levelName] = (acc[levelName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      hasMultiplePermissions: userDirectPermissions.length > 1,
      accessLevels: [...new Set(userDirectPermissions.map(p => p.structureLevel))].sort(),
    };

    // Step 4: Group permissions by level for better organization
    const permissionsByLevel = userDirectPermissions.reduce((acc, perm) => {
      const level = perm.structureLevel;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push({
        permissionId: perm.permissionId,
        structureId: perm.structureId,
        structureName: perm.structureName,
        structurePath: perm.structurePath,
        parentId: perm.parentId,
        assignedAt: perm.assignedAt,
      });
      return acc;
    }, {} as Record<number, PermissionDetail[]>);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          spiritAnimal: user.spiritAnimal,
        },
        permissions: userDirectPermissions.map(perm => ({
          permissionId: perm.permissionId,
          structure: {
            id: perm.structureId,
            name: perm.structureName,
            path: perm.structurePath,
            level: perm.structureLevel,
            levelName: getLevelName(perm.structureLevel),
            parentId: perm.parentId,
          },
          assignedAt: perm.assignedAt,
        })),
        summary: permissionSummary,
        permissionsByLevel,
      },
    });

  } catch (error) {
    console.error('Error fetching user permissions:', error);
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

// This route is designed to update the permissions for a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse<UpdatePermissionsResponse>> {
  try {
    const { userId } = await params;
    
    // Validate userId format
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid user ID provided',
          message: 'User ID must be a valid UUID'
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body: UpdatePermissionsRequest = await request.json();
    
    if (!body.structureIds || !Array.isArray(body.structureIds)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request body',
          message: 'structureIds must be an array of structure IDs'
        },
        { status: 400 }
      );
    }

    // Validate UUID format for all structure IDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidIds = body.structureIds.filter(id => !uuidRegex.test(id));
    
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid structure IDs',
          message: `Invalid UUID format for structure IDs: ${invalidIds.join(', ')}`
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
      .where(eq(users.id, userId))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found',
          message: `No user found with ID: ${userId}`
        },
        { status: 404 }
      );
    }

    const user = userExists[0];

    // Step 2: Verify all structure IDs exist (if any provided)
    let validStructures: { id: string; name: string; path: string; level: number; parentId: string | null }[] = [];
    
    if (body.structureIds.length > 0) {
      validStructures = await db
        .select({
          id: organisationStructures.id,
          name: organisationStructures.name,
          path: organisationStructures.path,
          level: organisationStructures.level,
          parentId: organisationStructures.parentId,
        })
        .from(organisationStructures)
        .where(inArray(organisationStructures.id, body.structureIds));

      if (validStructures.length !== body.structureIds.length) {
        const foundIds = validStructures.map(s => s.id);
        const missingIds = body.structureIds.filter(id => !foundIds.includes(id));
        
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid structure IDs',
            message: `Structure IDs not found: ${missingIds.join(', ')}`
          },
          { status: 404 }
        );
      }
    }

    // Step 3: Get current permissions
    const currentPermissions = await db
      .select({
        permissionId: userPermissions.id,
        structureId: userPermissions.structureId,
        structureName: organisationStructures.name,
        structurePath: organisationStructures.path,
        structureLevel: organisationStructures.level,
        parentId: organisationStructures.parentId,
      })
      .from(userPermissions)
      .innerJoin(organisationStructures, eq(userPermissions.structureId, organisationStructures.id))
      .where(eq(userPermissions.userId, userId));

    // Step 4: Calculate changes
    const currentStructureIds = currentPermissions.map(p => p.structureId);
    const newStructureIds = body.structureIds;
    
    const toAdd = newStructureIds.filter(id => !currentStructureIds.includes(id));
    const toRemove = currentStructureIds.filter(id => !newStructureIds.includes(id));
    const unchanged = currentStructureIds.filter(id => newStructureIds.includes(id));

    // Step 5: Perform the transaction
    // Remove old permissions
    if (toRemove.length > 0) {
      await db
        .delete(userPermissions)
        .where(
          eq(userPermissions.userId, userId)
        );
    } else if (currentPermissions.length > 0 && newStructureIds.length === 0) {
      // Remove all permissions if structureIds is empty
      await db
        .delete(userPermissions)
        .where(eq(userPermissions.userId, userId));
    }

    // Add new permissions
    let newPermissions: (typeof userPermissions.$inferSelect)[] = [];
    if (newStructureIds.length > 0) {
      // Insert all new permissions
      const permissionsToInsert = newStructureIds.map(structureId => ({
        userId,
        structureId,
      }));
      
      newPermissions = await db
        .insert(userPermissions)
        .values(permissionsToInsert)
        .returning();
    }

    // Step 6: Prepare response data
    const addedStructures = validStructures.filter(s => toAdd.includes(s.id));
    const removedStructures = currentPermissions
      .filter(p => toRemove.includes(p.structureId))
      .map(p => ({
        id: p.structureId,
        name: p.structureName,
        path: p.structurePath,
        level: p.structureLevel,
        levelName: getLevelName(p.structureLevel),
      }));
    const unchangedStructures = validStructures.filter(s => unchanged.includes(s.id));

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        changes: {
          added: addedStructures.map(s => ({
            id: s.id,
            name: s.name,
            path: s.path,
            level: s.level,
            levelName: getLevelName(s.level),
          })),
          removed: removedStructures,
          unchanged: unchangedStructures.map(s => ({
            id: s.id,
            name: s.name,
            path: s.path,
            level: s.level,
            levelName: getLevelName(s.level),
          })),
        },
        newPermissions: validStructures.map((structure, index) => ({
          permissionId: newPermissions[index]?.id || 'existing',
          structure: {
            id: structure.id,
            name: structure.name,
            path: structure.path,
            level: structure.level,
            levelName: getLevelName(structure.level),
            parentId: structure.parentId,
          },
          assignedAt: newPermissions[index]?.createdAt || new Date(),
        })),
        summary: {
          totalPermissions: validStructures.length,
          permissionsAdded: addedStructures.length,
          permissionsRemoved: removedStructures.length,
          permissionsUnchanged: unchangedStructures.length,
        },
      },
    });

  } catch (error) {
    console.error('Error updating user permissions:', error);
    
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