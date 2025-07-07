import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { organisationStructures, users, userPermissions } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface PermissionDetail {
  permissionId: string;
  structureId: string;
  structureName: string;
  structurePath: string;
  parentId: string | null;
  assignedAt: Date;
}

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

    // Step 3: Calculate permission summary
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