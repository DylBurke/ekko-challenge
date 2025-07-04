import { config } from 'dotenv';
import { db } from './connection';
import { organisationStructures, users, userPermissions } from './schema';

// Load environment variables
config({ path: '.env.local' });

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await db.delete(userPermissions);
    await db.delete(users);
    await db.delete(organisationStructures);
    
    // Create hierarchical business organisation structure
    // Level 0: Company
    const [company] = await db.insert(organisationStructures).values({
      name: 'Gekko Pty Ltd',
      level: 0,
      parentId: null,
      path: 'company',
    }).returning();
    
    // Level 1: Divisions
    const [engineering] = await db.insert(organisationStructures).values({
      name: 'Engineering Division',
      level: 1,
      parentId: company.id,
      path: 'company/engineering',
    }).returning();
    
    const [sales] = await db.insert(organisationStructures).values({
      name: 'Sales Division',
      level: 1,
      parentId: company.id,
      path: 'company/sales',
    }).returning();
    
    const [marketing] = await db.insert(organisationStructures).values({
      name: 'Marketing Division',
      level: 1,
      parentId: company.id,
      path: 'company/marketing',
    }).returning();
    
    const [hr] = await db.insert(organisationStructures).values({
      name: 'Human Resources',
      level: 1,
      parentId: company.id,
      path: 'company/hr',
    }).returning();
    
    // Level 2: Departments
    const [frontend] = await db.insert(organisationStructures).values({
      name: 'Frontend Engineering',
      level: 2,
      parentId: engineering.id,
      path: 'company/engineering/frontend',
    }).returning();
    
    const [backend] = await db.insert(organisationStructures).values({
      name: 'Backend Engineering',
      level: 2,
      parentId: engineering.id,
      path: 'company/engineering/backend',
    }).returning();
    
    const [devops] = await db.insert(organisationStructures).values({
      name: 'DevOps & Infrastructure',
      level: 2,
      parentId: engineering.id,
      path: 'company/engineering/devops',
    }).returning();
    
    const [enterprise] = await db.insert(organisationStructures).values({
      name: 'Enterprise Sales',
      level: 2,
      parentId: sales.id,
      path: 'company/sales/enterprise',
    }).returning();
    
    const [digital] = await db.insert(organisationStructures).values({
      name: 'Digital Marketing',
      level: 2,
      parentId: marketing.id,
      path: 'company/marketing/digital',
    }).returning();
    
    // Level 3: Teams
    const [reactTeam] = await db.insert(organisationStructures).values({
      name: 'React Platform Team',
      level: 3,
      parentId: frontend.id,
      path: 'company/engineering/frontend/react',
    }).returning();
    
    const [mobileTeam] = await db.insert(organisationStructures).values({
      name: 'Mobile Team',
      level: 3,
      parentId: frontend.id,
      path: 'company/engineering/frontend/mobile',
    }).returning();
    
    const [apiTeam] = await db.insert(organisationStructures).values({
      name: 'API Platform Team',
      level: 3,
      parentId: backend.id,
      path: 'company/engineering/backend/api',
    }).returning();
    
    const [dataTeam] = await db.insert(organisationStructures).values({
      name: 'Data Engineering Team',
      level: 3,
      parentId: backend.id,
      path: 'company/engineering/backend/data',
    }).returning();
    

    // Create test users based on business roles
    const [ceo] = await db.insert(users).values({
      name: 'Alice Johnson',
      email: 'alice.johnson@gekko.com',
      spiritAnimal: 'Eagle',
    }).returning();
    
    const [hrManager] = await db.insert(users).values({
      name: 'Sarah Wilson',
      email: 'sarah.wilson@gekko.com',
      spiritAnimal: 'Owl',
    }).returning();
    
    const [engineeringDirector] = await db.insert(users).values({
      name: 'David Chen',
      email: 'david.chen@gekko.com',
      spiritAnimal: 'Dragon',
    }).returning();
    
    const [salesDirector] = await db.insert(users).values({
      name: 'Maria Rodriguez',
      email: 'maria.rodriguez@gekko.com',
      spiritAnimal: 'Lion',
    }).returning();
    
    const [frontendManager] = await db.insert(users).values({
      name: 'Alex Kim',
      email: 'alex.kim@gekko.com',
      spiritAnimal: 'Phoenix',
    }).returning();
    
    const [backendManager] = await db.insert(users).values({
      name: 'Jordan Smith',
      email: 'jordan.smith@gekko.com',
      spiritAnimal: 'Bear',
    }).returning();
    
    const [enterpriseManager] = await db.insert(users).values({
      name: 'Emily Davis',
      email: 'emily.davis@gekko.com',
      spiritAnimal: 'Wolf',
    }).returning();
    
    const [teamLead] = await db.insert(users).values({
      name: 'Michael Brown',
      email: 'michael.brown@gekko.com',
      spiritAnimal: 'Hawk',
    }).returning();
    
    const [developer] = await db.insert(users).values({
      name: 'Lisa Thompson',
      email: 'lisa.thompson@gekko.com',
      spiritAnimal: 'Fox',
    }).returning();
    
    const [salesRep] = await db.insert(users).values({
      name: 'Robert Garcia',
      email: 'robert.garcia@gekko.com',
      spiritAnimal: 'Tiger',
    }).returning();
    
    // Assign permissions based on business hierarchy
    // CEO can see everything
    await db.insert(userPermissions).values({
      userId: ceo.id,
      structureId: company.id,
    });
    
    // HR Manager can see the entire company (for HR purposes)
    await db.insert(userPermissions).values({
      userId: hrManager.id,
      structureId: company.id,
    });
    
    // Engineering Director can see entire engineering division
    await db.insert(userPermissions).values({
      userId: engineeringDirector.id,
      structureId: engineering.id,
    });
    
    // Sales Director can see entire sales division
    await db.insert(userPermissions).values({
      userId: salesDirector.id,
      structureId: sales.id,
    });
    
    // Frontend Manager can see frontend department
    await db.insert(userPermissions).values({
      userId: frontendManager.id,
      structureId: frontend.id,
    });
    
    // Backend Manager can see backend department
    await db.insert(userPermissions).values({
      userId: backendManager.id,
      structureId: backend.id,
    });
    
    // Enterprise Sales Manager can see enterprise sales department
    await db.insert(userPermissions).values({
      userId: enterpriseManager.id,
      structureId: enterprise.id,
    });
    
    // Team Lead can see their specific team (React Platform)
    await db.insert(userPermissions).values({
      userId: teamLead.id,
      structureId: reactTeam.id,
    });
    
    // Team Lead ALSO has access to Mobile team (multiple permissions example)
    await db.insert(userPermissions).values({
      userId: teamLead.id,
      structureId: mobileTeam.id,
    });
    
    // Developer is assigned to React Platform team (so Team Lead can see them)
    await db.insert(userPermissions).values({
      userId: developer.id,
      structureId: reactTeam.id,
    });
    
    // Sales Rep is assigned to Enterprise Sales team (so Enterprise Manager can see them)
    await db.insert(userPermissions).values({
      userId: salesRep.id,
      structureId: enterprise.id,
    });
    
    // Frontend Manager ALSO has access to Digital Marketing (cross-functional work)
    await db.insert(userPermissions).values({
      userId: frontendManager.id,
      structureId: digital.id,
    });
    
    // Create additional users to demonstrate downstream access
    const [seniorDeveloper] = await db.insert(users).values({
      name: 'Jennifer Lee',
      email: 'jennifer.lee@gekko.com',
      spiritAnimal: 'Dolphin',
    }).returning();
    
    const [juniorDeveloper] = await db.insert(users).values({
      name: 'Mark Johnson',
      email: 'mark.johnson@gekko.com',
      spiritAnimal: 'Raven',
    }).returning();
    
    const [salesManager] = await db.insert(users).values({
      name: 'Steven Taylor',
      email: 'steven.taylor@gekko.com',
      spiritAnimal: 'Panther',
    }).returning();
    
    const [salesAssociate] = await db.insert(users).values({
      name: 'Amanda White',
      email: 'amanda.white@gekko.com',
      spiritAnimal: 'Butterfly',
    }).returning();
    
    // Assign additional users to demonstrate hierarchy
    // Senior Developer in Mobile team
    await db.insert(userPermissions).values({
      userId: seniorDeveloper.id,
      structureId: mobileTeam.id,
    });
    
    // Junior Developer in API Platform team
    await db.insert(userPermissions).values({
      userId: juniorDeveloper.id,
      structureId: apiTeam.id,
    });
    
    // Sales Manager in Enterprise Sales (has both individual contributor and management access)
    await db.insert(userPermissions).values({
      userId: salesManager.id,
      structureId: enterprise.id,
    });
    
    // Sales Associate in Enterprise Sales (so Sales Manager can see them)
    await db.insert(userPermissions).values({
      userId: salesAssociate.id,
      structureId: enterprise.id,
    });
    
    console.log('Database seeding completed successfully!');
    
    // Demonstrate the hierarchy and downstream access:
    console.log('\n=== HIERARCHY DEMONSTRATION ===');
    console.log('CEO (Alice Johnson) can see: ALL users (company level)');
    console.log('HR Manager (Sarah Wilson) can see: ALL users (company level)');
    console.log('Engineering Director (David Chen) can see: All engineering users');
    console.log('  - Frontend Manager (Alex Kim)');
    console.log('  - Backend Manager (Jordan Smith)'); 
    console.log('  - Team Lead (Michael Brown)');
    console.log('  - Developer (Lisa Thompson)');
    console.log('  - Senior Developer (Jennifer Lee)');
    console.log('  - Junior Developer (Mark Johnson)');
    console.log('Sales Director (Maria Rodriguez) can see: All sales users');
    console.log('  - Enterprise Manager (Emily Davis)');
    console.log('  - Sales Rep (Robert Garcia)');
    console.log('  - Sales Manager (Steven Taylor)');
    console.log('  - Sales Associate (Amanda White)');
    console.log('Frontend Manager (Alex Kim) can see:');
    console.log('  - Team Lead (Michael Brown)');
    console.log('  - Developer (Lisa Thompson)');
    console.log('  - Senior Developer (Jennifer Lee)');
    console.log('Team Lead (Michael Brown) can see:');
    console.log('  - Developer (Lisa Thompson) [React team]');
    console.log('  - Senior Developer (Jennifer Lee) [Mobile team]');
    console.log('\n=== MULTIPLE PERMISSIONS DEMONSTRATION ===');
    console.log('Team Lead (Michael Brown) has access to:');
    console.log('  - React Platform Team');
    console.log('  - Mobile Team');
    console.log('Frontend Manager (Alex Kim) has access to:');
    console.log('  - Frontend Engineering Department');
    console.log('  - Digital Marketing Department (cross-functional)');
    console.log('==================================\n');
    
    return {
      structures: {
        company,
        engineering,
        sales,
        marketing,
        hr,
        frontend,
        backend,
        devops,
        enterprise,
        digital,
        reactTeam,
        mobileTeam,
        apiTeam,
        dataTeam,
      },
      users: {
        ceo,
        hrManager,
        engineeringDirector,
        salesDirector,
        frontendManager,
        backendManager,
        enterpriseManager,
        teamLead,
        developer,
        salesRep,
        seniorDeveloper,
        juniorDeveloper,
        salesManager,
        salesAssociate,
      },
    };
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
} 