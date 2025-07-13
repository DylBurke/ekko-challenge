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
    
    const [enterprise] = await db.insert(organisationStructures).values({
      name: 'Enterprise Sales',
      level: 2,
      parentId: sales.id,
      path: 'company/sales/enterprise',
    }).returning();
    
    const [saasSales] = await db.insert(organisationStructures).values({
      name: 'Saas Sales',
      level: 2,
      parentId: sales.id,
      path: 'company/sales/saas',
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
    
    const [businessDevTeam] = await db.insert(organisationStructures).values({
      name: 'Business Development Team',
      level: 3,
      parentId: enterprise.id,
      path: 'company/sales/enterprise/bizdev',
    }).returning();
    
    const [socialMediaTeam] = await db.insert(organisationStructures).values({
      name: 'Social Media Team',
      level: 3,
      parentId: digital.id,
      path: 'company/marketing/digital/social',
    }).returning();
    
    const [growthTeam] = await db.insert(organisationStructures).values({
      name: 'Growth Team',
      level: 3,
      parentId: saasSales.id,
      path: 'company/sales/saas/growth',
    }).returning();
    

    // Create test users based on business roles
    const [ceo] = await db.insert(users).values({
      name: 'Alice Johnson',
      email: 'alice.johnson@gekko.com',
      role: 'Chief Executive Officer',
      spiritAnimal: 'Eagle',
    }).returning();
    
    const [hrManager] = await db.insert(users).values({
      name: 'Sarah Wilson',
      email: 'sarah.wilson@gekko.com',
      role: 'HR Manager',
      spiritAnimal: 'Owl',
    }).returning();
    
    const [engineeringDirector] = await db.insert(users).values({
      name: 'David Chen',
      email: 'david.chen@gekko.com',
      role: 'Engineering Director',
      spiritAnimal: 'Dragon',
    }).returning();
    
    const [salesDirector] = await db.insert(users).values({
      name: 'Maria Rodriguez',
      email: 'maria.rodriguez@gekko.com',
      role: 'Sales Director',
      spiritAnimal: 'Lion',
    }).returning();
    
    const [marketingDirector] = await db.insert(users).values({
      name: 'Carlos Mendez',
      email: 'carlos.mendez@gekko.com',
      role: 'Marketing Director',
      spiritAnimal: 'Hawk',
    }).returning();
    
    const [frontendManager] = await db.insert(users).values({
      name: 'Alex Kim',
      email: 'alex.kim@gekko.com',
      role: 'Frontend Manager',
      spiritAnimal: 'Phoenix',
    }).returning();
    
    const [backendManager] = await db.insert(users).values({
      name: 'Jordan Smith',
      email: 'jordan.smith@gekko.com',
      role: 'Backend Manager',
      spiritAnimal: 'Bear',
    }).returning();
    
    const [enterpriseManager] = await db.insert(users).values({
      name: 'Emily Davis',
      email: 'emily.davis@gekko.com',
      role: 'Enterprise Sales Manager',
      spiritAnimal: 'Wolf',
    }).returning();
    
    
    const [digitalMarketingLead] = await db.insert(users).values({
      name: 'Priya Sharma',
      email: 'priya.sharma@gekko.com',
      role: 'Digital Marketing Department Lead',
      spiritAnimal: 'Peacock',
    }).returning();
    
    const [saasLead] = await db.insert(users).values({
      name: 'Alex Thompson',
      email: 'alex.thompson@gekko.com',
      role: 'Saas Lead',
      spiritAnimal: 'Falcon',
    }).returning();
    
    const [hrSpecialist1] = await db.insert(users).values({
      name: 'Michael Roberts',
      email: 'michael.roberts@gekko.com',
      role: 'HR Specialist',
      spiritAnimal: 'Turtle',
    }).returning();
    
    const [hrSpecialist2] = await db.insert(users).values({
      name: 'Rachel Green',
      email: 'rachel.green@gekko.com',
      role: 'Chief People Officer',
      spiritAnimal: 'Whale',
    }).returning();

    const [developer] = await db.insert(users).values({
      name: 'Lisa Thompson',
      email: 'lisa.thompson@gekko.com',
      role: 'Frontend Developer',
      spiritAnimal: 'Fox',
    }).returning();
    
    const [salesRep] = await db.insert(users).values({
      name: 'Robert Garcia',
      email: 'robert.garcia@gekko.com',
      role: 'Business Development Representative',
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
    
    // HR Manager is also positioned in HR department (so she appears with other HR staff)
    await db.insert(userPermissions).values({
      userId: hrManager.id,
      structureId: hr.id,
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
    
    // Marketing Director can see entire marketing division
    await db.insert(userPermissions).values({
      userId: marketingDirector.id,
      structureId: marketing.id,
    });
    
    // Digital Marketing Lead can see digital marketing department
    await db.insert(userPermissions).values({
      userId: digitalMarketingLead.id,
      structureId: digital.id,
    });
    
    // SaaS Lead can see SaaS Sales department
    await db.insert(userPermissions).values({
      userId: saasLead.id,
      structureId: saasSales.id,
    });
    
    // HR Specialist 2 (Chief People Officer) gets company-wide access
    await db.insert(userPermissions).values({
      userId: hrSpecialist2.id,
      structureId: company.id,
    });
    
    // HR Specialist 1 gets HR division access
    await db.insert(userPermissions).values({
      userId: hrSpecialist1.id,
      structureId: hr.id,
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
    

    
    // Developer is assigned to React Platform team (so Team Lead can see them)
    await db.insert(userPermissions).values({
      userId: developer.id,
      structureId: reactTeam.id,
    });
    
    // Sales Rep is assigned to Business Development Team
    await db.insert(userPermissions).values({
      userId: salesRep.id,
      structureId: businessDevTeam.id,
    });
    

    
    // Create additional users to demonstrate downstream access
    const [seniorDeveloper] = await db.insert(users).values({
      name: 'Jennifer Lee',
      email: 'jennifer.lee@gekko.com',
      role: 'Senior Frontend Developer',
      spiritAnimal: 'Dolphin',
    }).returning();
    
    const [juniorDeveloper] = await db.insert(users).values({
      name: 'Mark Johnson',
      email: 'mark.johnson@gekko.com',
      role: 'Backend Developer',
      spiritAnimal: 'Raven',
    }).returning();
    
    const [salesManager] = await db.insert(users).values({
      name: 'Steven Taylor',
      email: 'steven.taylor@gekko.com',
      role: 'Enterprise Sales Manager',
      spiritAnimal: 'Panther',
    }).returning();
    
    const [salesAssociate] = await db.insert(users).values({
      name: 'Amanda White',
      email: 'amanda.white@gekko.com',
      role: 'Business Development Associate',
      spiritAnimal: 'Butterfly',
    }).returning();
    
    // Additional new users
    const [dataEngineer1] = await db.insert(users).values({
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@gekko.com',
      role: 'Senior Data Engineer',
      spiritAnimal: 'Octopus',
    }).returning();
    
    const [dataEngineer2] = await db.insert(users).values({
      name: 'Sophie Chen',
      email: 'sophie.chen@gekko.com',
      role: 'Data Engineer',
      spiritAnimal: 'Spider',
    }).returning();
    
    const [mobileDeveloper] = await db.insert(users).values({
      name: 'Ryan O\'Connor',
      email: 'ryan.oconnor@gekko.com',
      role: 'Mobile Developer',
      spiritAnimal: 'Cheetah',
    }).returning();
    
    const [socialMediaManager] = await db.insert(users).values({
      name: 'Zoe Martinez',
      email: 'zoe.martinez@gekko.com',
      role: 'Social Media Manager',
      spiritAnimal: 'Parrot',
    }).returning();
    
    const [socialMediaSpecialist] = await db.insert(users).values({
      name: 'Jake Wilson',
      email: 'jake.wilson@gekko.com',
      role: 'Social Media Specialist',
      spiritAnimal: 'Chameleon',
    }).returning();
    
    const [growthManager] = await db.insert(users).values({
      name: 'Nina Patel',
      email: 'nina.patel@gekko.com',
      role: 'Growth Manager',
      spiritAnimal: 'Hummingbird',
    }).returning();
    
    const [growthAnalyst] = await db.insert(users).values({
      name: 'Tom Richards',
      email: 'tom.richards@gekko.com',
      role: 'Growth Analyst',
      spiritAnimal: 'Beaver',
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
    
    // Sales Associate in Business Development Team
    await db.insert(userPermissions).values({
      userId: salesAssociate.id,
      structureId: businessDevTeam.id,
    });
    
    // Additional team assignments
    // Data engineers in Data Engineering Team
    await db.insert(userPermissions).values({
      userId: dataEngineer1.id,
      structureId: dataTeam.id,
    });
    
    await db.insert(userPermissions).values({
      userId: dataEngineer2.id,
      structureId: dataTeam.id,
    });
    
    // Mobile developer in Mobile Team
    await db.insert(userPermissions).values({
      userId: mobileDeveloper.id,
      structureId: mobileTeam.id,
    });
    
    // Social media team members
    await db.insert(userPermissions).values({
      userId: socialMediaManager.id,
      structureId: socialMediaTeam.id,
    });
    
    await db.insert(userPermissions).values({
      userId: socialMediaSpecialist.id,
      structureId: socialMediaTeam.id,
    });
    
    // Growth team members
    await db.insert(userPermissions).values({
      userId: growthManager.id,
      structureId: growthTeam.id,
    });
    
    await db.insert(userPermissions).values({
      userId: growthAnalyst.id,
      structureId: growthTeam.id,
    });
    
    console.log('Database seeding completed successfully!');
    
    // Demonstrate the hierarchy and downstream access:
    console.log('\n=== UPDATED HIERARCHY DEMONSTRATION ===');
    console.log('🏢 COMPANY LEVEL:');
    console.log('  • CEO (Alice Johnson): ALL users');
    console.log('  • HR Manager (Sarah Wilson): ALL users');
    console.log('  • Chief People Officer (Rachel Green): ALL users');
    console.log('\n🏭 SALES DIVISION:');
    console.log('  • Sales Director (Maria Rodriguez): All sales users');
    console.log('    - Enterprise Sales: Emily, Steven, Robert, Amanda');
    console.log('    - SaaS Sales: Alex, Nina, Tom');
    console.log('\n📢 MARKETING DIVISION:');
    console.log('  • Marketing Director (Carlos Mendez): All marketing users');
    console.log('    - Digital Marketing: Priya, Zoe, Jake');
    console.log('\n🔧 ENGINEERING DIVISION:');
    console.log('  • Engineering Director (David Chen): All engineering users');
    console.log('    - Frontend: Lisa, Jennifer, Ryan');
    console.log('    - Backend: Mark, Ahmed, Sophie');
    console.log('\n📱 DIGITAL MARKETING:');
    console.log('  • Digital Marketing Lead (Priya Sharma): Digital marketing team');
    console.log('    - Social Media: Zoe, Jake');
    console.log('\n💼 BUSINESS DEVELOPMENT:');
    console.log('  • Enterprise Sales Manager (Emily Davis): Enterprise + Business Dev');
    console.log('    - Business Dev Team: Robert, Amanda');
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
        enterprise,
        digital,
        reactTeam,
        mobileTeam,
        apiTeam,
        dataTeam,
        businessDevTeam,
        socialMediaTeam,
        saasSales,
        growthTeam,
      },
      users: {
        ceo,
        hrManager,
        hrSpecialist1,
        hrSpecialist2,
        engineeringDirector,
        salesDirector,
        marketingDirector,
        digitalMarketingLead,
        frontendManager,
        backendManager,
        enterpriseManager,
        developer,
        salesRep,
        seniorDeveloper,
        juniorDeveloper,
        salesManager,
        salesAssociate,
        dataEngineer1,
        dataEngineer2,
        mobileDeveloper,
        socialMediaManager,
        socialMediaSpecialist,
        saasLead,
        growthManager,
        growthAnalyst,
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