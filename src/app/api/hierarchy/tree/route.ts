import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { organisationStructures, userPermissions } from '@/db/schema';
import { count } from 'drizzle-orm';

// I added this interface to help with the tree structure
interface TreeNode {
  id: string;
  name: string;
  level: number;
  path: string;
  userCount: number;
  children: TreeNode[];
  parentId: string | null;
}

export async function GET() {
  try {
    // Step 1: Get all organisation structures
    const allStructures = await db
      .select({
        id: organisationStructures.id,
        name: organisationStructures.name,
        level: organisationStructures.level,
        path: organisationStructures.path,
        parentId: organisationStructures.parentId,
      })
      .from(organisationStructures)
      .orderBy(organisationStructures.level, organisationStructures.name);

    // Step 2: Get direct user counts for each structure (users directly assigned to that structure only)
    const userCounts = await db
      .select({
        structureId: userPermissions.structureId,
        userCount: count(userPermissions.userId),
      })
      .from(userPermissions)
      .groupBy(userPermissions.structureId);

    // Create a map for quick user count lookup
    const userCountMap = new Map(
      userCounts.map(uc => [uc.structureId, Number(uc.userCount)])
    );

    // Step 3: Add user counts to structures
    const structuresWithCounts = allStructures.map(structure => ({
      ...structure,
      userCount: userCountMap.get(structure.id) || 0,
    }));

    // Step 4: Convert flat structure to tree nodes
    const nodeMap = new Map<string, TreeNode>();
    
    // Create all nodes first
    structuresWithCounts.forEach(structure => {
      nodeMap.set(structure.id, {
        id: structure.id,
        name: structure.name,
        level: structure.level,
        path: structure.path,
        parentId: structure.parentId,
        userCount: structure.userCount,
        children: [],
      });
    });

    // Step 5: Build the tree by linking children to parents
    const rootNodes: TreeNode[] = [];

    allStructures.forEach(structure => {
      const node = nodeMap.get(structure.id)!;
      
      if (structure.parentId === null) {
        // This is a root node
        rootNodes.push(node);
      } else {
        // This is a child node, add it to its parent
        const parentNode = nodeMap.get(structure.parentId);
        if (parentNode) {
          parentNode.children.push(node);
        }
      }
    });

    // Step 6: Sort children at each level for consistent ordering
    const sortChildren = (node: TreeNode) => {
      node.children.sort((a, b) => {
        // Sort by level first, then by name
        if (a.level !== b.level) {
          return a.level - b.level;
        }
        return a.name.localeCompare(b.name);
      });
      
      // Recursively sort children of children
      node.children.forEach(sortChildren);
    };

    rootNodes.forEach(sortChildren);

    // Step 7: Calculate tree statistics
    const totalStructures = allStructures.length;
    
    // Get total unique users (avoid double counting)
    const totalUniqueUsers = await db
      .select({
        totalUsers: count(userPermissions.userId),
      })
      .from(userPermissions);
    
    const totalUsers = Number(totalUniqueUsers[0]?.totalUsers || 0);
    const maxDepth = Math.max(...allStructures.map(s => s.level)) + 1;

    // Step 8: Get some additional insights
    const levelCounts = allStructures.reduce((acc, structure) => {
      acc[structure.level] = (acc[structure.level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const levelNames = {
      0: 'Company',
      1: 'Division', 
      2: 'Department',
      3: 'Team',
    };

    return NextResponse.json({
      success: true,
      data: {
        tree: rootNodes,
        metadata: {
          totalStructures,
          totalUsers,
          maxDepth,
          levelCounts,
          levelNames,
          paths: allStructures.map(s => s.path).sort(),
        },
      },
    });

  } catch (error) {
    console.error('Error fetching hierarchy tree:', error);
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