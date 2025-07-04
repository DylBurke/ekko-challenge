import { config } from 'dotenv';
import { db } from './connection';
import { sql } from 'drizzle-orm';

// Load environment variables
config({ path: '.env.local' });

export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Database connection successful');
    
    // Test schema tables exist
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('organisation_structures', 'users', 'user_permissions')
    `);
    
    console.log('✅ Schema tables found:', tables.map((row: Record<string, unknown>) => row.table_name));
    
    // Test hierarchical query with sample data
    const hierarchicalQuery = await db.execute(sql`
      WITH RECURSIVE hierarchy AS (
        SELECT id, name, level, parent_id, path, 0 as depth
        FROM organisation_structures
        WHERE parent_id IS NULL
        
        UNION ALL
        
        SELECT os.id, os.name, os.level, os.parent_id, os.path, h.depth + 1
        FROM organisation_structures os
        JOIN hierarchy h ON os.parent_id = h.id
      )
      SELECT * FROM hierarchy ORDER BY depth, name
    `);
    
    console.log('✅ Hierarchical query test successful');
    console.log('Hierarchy structure:', hierarchicalQuery);
    
    // Test user permissions query
    const userPermissionsQuery = await db.execute(sql`
      SELECT u.name as user_name, u.email, u.spirit_animal, os.name as structure_name, os.level, os.path
      FROM users u
      JOIN user_permissions up ON u.id = up.user_id
      JOIN organisation_structures os ON up.structure_id = os.id
      ORDER BY os.level, u.name
    `);
    
    console.log('✅ User permissions query test successful');
    console.log('User permissions:', userPermissionsQuery);
    
    console.log('🎉 All database tests passed!');
    
    return {
      connection: true,
      tables: tables,
      hierarchyCount: hierarchicalQuery.length,
      permissionsCount: userPermissionsQuery.length,
    };
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    throw error;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection()
    .then(() => {
      console.log('Database test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database test failed:', error);
      process.exit(1);
    });
} 