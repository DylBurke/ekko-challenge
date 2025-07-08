import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { organisationStructures } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface CreateStructureRequest {
  name: string;
  parentId?: string;
}

interface CreateStructureResponse {
  success: boolean;
  data?: {
    structure: {
      id: string;
      name: string;
      path: string;
      level: number;
      levelName: string;
      parentId: string | null;
      depth: number;
      createdAt: Date;
    };
    parent?: {
      id: string;
      name: string;
      path: string;
      level: number;
      levelName: string;
    };
    hierarchy: {
      maxLevel: number;
      totalStructures: number;
      childrenCount: number;
    };
  };
  error?: string;
  message?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateStructureResponse>> {
  try {
    // Parse and validate request body
    const body: CreateStructureRequest = await request.json();
    
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing or invalid name',
          message: 'Name is required and must be a string'
        },
        { status: 400 }
      );
    }

    // Trim and validate name
    const name = body.name.trim();
    if (name.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid name',
          message: 'Name cannot be empty'
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid name',
          message: 'Name must be 100 characters or less'
        },
        { status: 400 }
      );
    }

    // Validate parentId format if provided
    let parentId: string | null = null;
    if (body.parentId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(body.parentId)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid parent ID format',
            message: 'Parent ID must be a valid UUID'
          },
          { status: 400 }
        );
      }
      parentId = body.parentId;
    }

    // Step 1: Get parent information if parentId is provided
    let parent: { id: string; name: string; path: string; level: number } | null = null;
    let newLevel = 0;
    let newPath = '';

    if (parentId) {
      const parentResult = await db
        .select({
          id: organisationStructures.id,
          name: organisationStructures.name,
          path: organisationStructures.path,
          level: organisationStructures.level,
        })
        .from(organisationStructures)
        .where(eq(organisationStructures.id, parentId))
        .limit(1);

      if (parentResult.length === 0) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Parent not found',
            message: `No organizational structure found with ID: ${parentId}`
          },
          { status: 404 }
        );
      }

      parent = parentResult[0];
      newLevel = parent.level + 1;
      
      // Create path: parent.path + '/' + slugified name
      const slug = slugify(name);
      newPath = `${parent.path}/${slug}`;
    } else {
      // Root level structure
      newLevel = 0;
      newPath = slugify(name);
    }

    // Step 2: Check for duplicate names at the same level under the same parent
    const existingStructure = await db
      .select()
      .from(organisationStructures)
      .where(
        and(
          eq(organisationStructures.name, name),
          parentId 
            ? eq(organisationStructures.parentId, parentId)
            : eq(organisationStructures.level, 0) // Root level check
        )
      )
      .limit(1);

    if (existingStructure.length > 0) {
      const context = parent ? `under ${parent.name}` : 'at root level';
      return NextResponse.json(
        { 
          success: false,
          error: 'Duplicate structure name',
          message: `A structure named "${name}" already exists ${context}`
        },
        { status: 409 }
      );
    }

    // Step 3: Check for path conflicts
    const existingPath = await db
      .select()
      .from(organisationStructures)
      .where(eq(organisationStructures.path, newPath))
      .limit(1);

    if (existingPath.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Path conflict',
          message: `Path "${newPath}" already exists. Please use a different name.`
        },
        { status: 409 }
      );
    }

    // Step 4: Validate hierarchy depth (prevent too deep nesting)
    const maxDepth = 5; // Company -> Division -> Department -> Team -> Sub-Team
    if (newLevel >= maxDepth) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Maximum hierarchy depth exceeded',
          message: `Cannot create structures deeper than ${maxDepth} levels`
        },
        { status: 400 }
      );
    }

    // Step 5: Create the new structure
    const newStructure = await db
      .insert(organisationStructures)
      .values({
        name: name,
        parentId: parentId,
        level: newLevel,
        path: newPath,
      })
      .returning();

    // Step 6: Get hierarchy statistics
    const [totalStructures, childrenCount] = await Promise.all([
      // Total structures count
      db
        .select({ count: organisationStructures.id })
        .from(organisationStructures),
      
      // Count children of the parent (if exists)
      parentId 
        ? db
            .select({ count: organisationStructures.id })
            .from(organisationStructures)
            .where(eq(organisationStructures.parentId, parentId))
        : Promise.resolve([{ count: 0 }])
    ]);

    // Step 7: Calculate max level in the system
    const maxLevelResult = await db
      .select({ maxLevel: organisationStructures.level })
      .from(organisationStructures)
      .orderBy(organisationStructures.level)
      .limit(1);

    const maxLevel = maxLevelResult.length > 0 ? Math.max(...maxLevelResult.map(r => r.maxLevel)) : 0;

    const created = newStructure[0];

    return NextResponse.json({
      success: true,
      data: {
        structure: {
          id: created.id,
          name: created.name,
          path: created.path,
          level: created.level,
          levelName: getLevelName(created.level),
          parentId: created.parentId,
          depth: created.level, // depth is same as level in our hierarchy
          createdAt: created.createdAt,
        },
        parent: parent ? {
          id: parent.id,
          name: parent.name,
          path: parent.path,
          level: parent.level,
          levelName: getLevelName(parent.level),
        } : undefined,
        hierarchy: {
          maxLevel: maxLevel,
          totalStructures: totalStructures.length,
          childrenCount: childrenCount.length,
        },
      },
    });

  } catch (error) {
    console.error('Error creating organizational structure:', error);
    
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

// Helper function to create URL-friendly slugs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Helper function to get level name
function getLevelName(level: number): string {
  const levelNames: Record<number, string> = {
    0: 'Company',
    1: 'Division',
    2: 'Department', 
    3: 'Team',
    4: 'Sub-Team',
  };
  return levelNames[level] || `Level ${level}`;
} 