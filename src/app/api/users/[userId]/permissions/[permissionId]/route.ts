import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { userPermissions, users, organisationStructures } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

interface RevokePermissionResponse {
  success: boolean;
  data?: {
    revokedPermission: {
      userId: string;
      userName: string;
      structureId: string;
      structureName: string;
      revokedAt: Date;
    };
    remainingPermissions: number;
  };
  error?: string;
  message?: string;
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string; permissionId: string }> }
): Promise<NextResponse<RevokePermissionResponse>> {
  try {
    const { userId, permissionId } = await context.params;

    // Validate parameters
    if (!userId || !permissionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters',
          message: 'Both userId and permissionId are required',
        },
        { status: 400 }
      );
    }

    // Validate UUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId) || !uuidRegex.test(permissionId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid parameter format',
          message: 'userId and permissionId must be valid UUIDs',
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          message: `No user found with ID: ${userId}`,
        },
        { status: 404 }
      );
    }

    // Check if the permission exists and get structure info
    const permission = await db
      .select({
        permissionId: userPermissions.id,
        userId: userPermissions.userId,
        structureId: userPermissions.structureId,
        structureName: organisationStructures.name,
      })
      .from(userPermissions)
      .innerJoin(organisationStructures, eq(userPermissions.structureId, organisationStructures.id))
      .where(
        and(
          eq(userPermissions.id, permissionId),
          eq(userPermissions.userId, userId)
        )
      )
      .limit(1);

    if (permission.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permission not found',
          message: `No permission found with ID: ${permissionId} for user: ${userId}`,
        },
        { status: 404 }
      );
    }

    const permissionToRevoke = permission[0];

    // Delete the permission
    const deletedPermissions = await db
      .delete(userPermissions)
      .where(
        and(
          eq(userPermissions.id, permissionId),
          eq(userPermissions.userId, userId)
        )
      )
      .returning();

    if (deletedPermissions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to revoke permission',
          message: 'Permission could not be deleted',
        },
        { status: 500 }
      );
    }

    // Get count of remaining permissions for this user
    const remainingPermissionsCount = await db
      .select()
      .from(userPermissions)
      .where(eq(userPermissions.userId, userId));

    const remainingCount = remainingPermissionsCount.length;

    return NextResponse.json({
      success: true,
      data: {
        revokedPermission: {
          userId: permissionToRevoke.userId,
          userName: user[0].name,
          structureId: permissionToRevoke.structureId,
          structureName: permissionToRevoke.structureName,
          revokedAt: new Date(),
        },
        remainingPermissions: remainingCount,
      },
      message: `Successfully revoked permission for ${user[0].name} from ${permissionToRevoke.structureName}`,
    });

  } catch (error) {
    console.error('Error revoking permission:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}