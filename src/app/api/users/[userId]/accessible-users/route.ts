import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { organisationStructures, users, userPermissions } from '@/db/schema';
import { eq, like, or, inArray, and, ilike, count } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const mode = searchParams.get('mode') || 'users'; // 'tree', 'users', 'search'
    const structureId = searchParams.get('structureId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const searchQuery = searchParams.get('q')?.trim();

    // Validate userId format (should be UUID)
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid user ID provided' },
        { status: 400 }
      );
    }

    // Step 1: Get requesting user's information and their permissions
    // At a later stage, I wanted to implement auth middleware so that upon login, this would happen
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

    // Step 3: Find all downstream structures using materialised paths
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
          // Include the exact structures they have direct access to (I do this because I want to also return the requesting
          // user's information on themselves for better UX)
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
      .where(getAccessibleUsersWhereClause(userId, userDirectPermissions, allAccessibleStructures))
      .orderBy(organisationStructures.level, users.name);

    // Step 5: Group results by user to avoid duplicates
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

    // Handle different modes
    if (mode === 'tree') {
      return await handleTreeMode(userId, userDirectPermissions, allAccessibleStructures);
    }
    
    if (mode === 'users' && structureId) {
      return await handleUsersMode(userId, structureId, page, limit, allAccessibleStructures, userDirectPermissions);
    }
    
    if (mode === 'search' && searchQuery) {
      return await handleSearchMode(userId, searchQuery, limit, allAccessibleStructures);
    }

    // Default: return original format for backward compatibility
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

interface UserPermission {
  structureId: string;
  structureName: string;
  structurePath: string;
  structureLevel: number;
}

interface AccessibleStructure {
  id: string;
  name: string;
  path: string;
  level: number;
}

// Reusable function to build the accessible users WHERE clause
function getAccessibleUsersWhereClause(
  userId: string, 
  userDirectPermissions: UserPermission[], 
  allAccessibleStructures: AccessibleStructure[]
) {
  const exactStructureIds = userDirectPermissions.map(p => p.structureId);
  const accessibleStructureIds = allAccessibleStructures.map(s => s.id);

  return and(
    inArray(userPermissions.structureId, accessibleStructureIds),
    or(
      // Users in downstream structures (children, grandchildren, etc.)
      or(
        ...userDirectPermissions.map(permission => 
          like(organisationStructures.path, `${permission.structurePath}/%`)
        )
      ),
      // Include requesting user themselves (only if they are in one of their permitted structures)
      and(
        eq(users.id, userId),
        inArray(organisationStructures.id, exactStructureIds)
      )
    )
  );
}

// Helper function to build tree structure in the FE with user counts
async function handleTreeMode(userId: string, userDirectPermissions: UserPermission[], allAccessibleStructures: AccessibleStructure[]) {
  // Get accessible users with minimal selection for performance
  const accessibleUsers = await db
    .select({
      userId: users.id,
      structureId: userPermissions.structureId,
    })
    .from(users)
    .innerJoin(userPermissions, eq(users.id, userPermissions.userId))
    .innerJoin(organisationStructures, eq(userPermissions.structureId, organisationStructures.id))
    .where(getAccessibleUsersWhereClause(userId, userDirectPermissions, allAccessibleStructures));

  // Create a map of structure ID to count accessible users
  const structureUserCountMap = new Map<string, number>();
  accessibleUsers.forEach(user => {
    const currentCount = structureUserCountMap.get(user.structureId) || 0;
    structureUserCountMap.set(user.structureId, currentCount + 1);
  });

  // Get user counts for each accessible structure based on actually accessible users
  const structureUserCounts = allAccessibleStructures.map(structure => ({
    ...structure,
    userCount: structureUserCountMap.get(structure.id) || 0,
  }));

  // Build hierarchical tree
  interface TreeNode {
    id: string;
    name: string;
    path: string;
    level: number;
    userCount: number;
    children: TreeNode[];
  }

  const buildTree = (structures: (AccessibleStructure & { userCount: number })[], parentPath: string | null = null): TreeNode[] => {
    if (parentPath === null) {
      // For root level, find the topmost structures the user has direct access to
      const directAccessPaths = userDirectPermissions.map(p => p.structurePath);
      const rootStructures = structures.filter(s => directAccessPaths.includes(s.path));
      
      return rootStructures.map(structure => ({
        id: structure.id,
        name: structure.name,
        path: structure.path,
        level: structure.level,
        userCount: structure.userCount,
        children: buildTree(structures, structure.path),
      }));
    }
    
    // For child levels, find direct children only
    return structures
      .filter(s => {
        return s.path.startsWith(parentPath + '/') && 
               s.path.split('/').length === parentPath.split('/').length + 1;
      })
      .map(structure => ({
        id: structure.id,
        name: structure.name,
        path: structure.path,
        level: structure.level,
        userCount: structure.userCount,
        children: buildTree(structures, structure.path),
      }));
  };

  const tree = buildTree(structureUserCounts);

  return NextResponse.json({
    success: true,
    data: {
      userId,
      mode: 'tree',
      tree,
      totalStructures: allAccessibleStructures.length,
    },
  });
}

// Helper function to get paginated users for a specific structure so that as we scale the list won't break
async function handleUsersMode(userId: string, structureId: string, page: number, limit: number, allAccessibleStructures: AccessibleStructure[], userDirectPermissions: UserPermission[]) {
  // Verify structure is accessible
  const isAccessible = allAccessibleStructures.some(s => s.id === structureId);
  if (!isAccessible) {
    return NextResponse.json(
      { error: 'Structure not accessible to this user' },
      { status: 403 }
    );
  }

  // Get accessible users using the reusable WHERE clause
  const accessibleUserIds = await db
    .select({
      userId: users.id,
    })
    .from(users)
    .innerJoin(userPermissions, eq(users.id, userPermissions.userId))
    .innerJoin(organisationStructures, eq(userPermissions.structureId, organisationStructures.id))
    .where(getAccessibleUsersWhereClause(userId, userDirectPermissions, allAccessibleStructures));

  const accessibleUserIdSet = new Set(accessibleUserIds.map(u => u.userId));

  const offset = (page - 1) * limit;

  // Get paginated users for this structure, but only those that are accessible
  const paginatedUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      spiritAnimal: users.spiritAnimal,
    })
    .from(users)
    .innerJoin(userPermissions, eq(users.id, userPermissions.userId))
    .where(
      and(
        eq(userPermissions.structureId, structureId),
        inArray(users.id, Array.from(accessibleUserIdSet))
      )
    )
    .orderBy(users.name)
    .limit(limit)
    .offset(offset);

  // Get total count for pagination (only accessible users)
  const totalCount = await db
    .select({ count: count() })
    .from(userPermissions)
    .innerJoin(users, eq(userPermissions.userId, users.id))
    .where(
      and(
        eq(userPermissions.structureId, structureId),
        inArray(users.id, Array.from(accessibleUserIdSet))
      )
    );

  const total = totalCount[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    success: true,
    data: {
      userId,
      mode: 'users',
      structureId,
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
}

// Helper function to search users within accessible scope
async function handleSearchMode(userId: string, searchQuery: string, limit: number, allAccessibleStructures: AccessibleStructure[]) {
  const accessibleStructureIds = allAccessibleStructures.map(s => s.id);
  
  if (accessibleStructureIds.length === 0) {
    return NextResponse.json({
      success: true,
      data: {
        userId,
        mode: 'search',
        query: searchQuery,
        users: [],
        total: 0,
      },
    });
  }

  // Search users by name or email within accessible structures
  const searchPattern = `%${searchQuery}%`;
  const searchResults = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      spiritAnimal: users.spiritAnimal,
      structureName: organisationStructures.name,
      structureLevel: organisationStructures.level,
    })
    .from(users)
    .innerJoin(userPermissions, eq(users.id, userPermissions.userId))
    .innerJoin(organisationStructures, eq(userPermissions.structureId, organisationStructures.id))
    .where(
      and(
        inArray(userPermissions.structureId, accessibleStructureIds),
        or(
          ilike(users.name, searchPattern),
          ilike(users.email, searchPattern)
        )
      )
    )
    .orderBy(users.name)
    .limit(limit);

  // Remove duplicates (users might have multiple permissions)
  const uniqueUsers = Array.from(
    new Map(
      searchResults.map(user => [
        user.id,
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          spiritAnimal: user.spiritAnimal,
          primaryStructure: user.structureName,
          structureLevel: user.structureLevel,
        },
      ])
    ).values()
  );

  return NextResponse.json({
    success: true,
    data: {
      userId,
      mode: 'search',
      query: searchQuery,
      users: uniqueUsers,
      total: uniqueUsers.length,
      limit,
    },
  });
} 