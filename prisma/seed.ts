import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'AudienceHub Demo',
      slug: 'audiencehub-demo',
      description: 'Demo organization for testing',
      website: 'https://audiencehub.com',
      tier: 'pro',
      brandPrimaryColor: '#2563eb',
      brandSecondaryColor: '#1e40af',
    },
  });
  console.log('✓ Organization created:', org.id);

  // Create Departments
  const hrDept = await prisma.department.create({
    data: {
      organizationId: org.id,
      name: 'HR',
      color: '#ef4444',
    },
  });

  const engDept = await prisma.department.create({
    data: {
      organizationId: org.id,
      name: 'Engineering',
      color: '#3b82f6',
    },
  });

  const mktgDept = await prisma.department.create({
    data: {
      organizationId: org.id,
      name: 'Marketing',
      color: '#8b5cf6',
    },
  });
  console.log('✓ Departments created');

  // Create Roles
  const orgAdminRole = await prisma.role.create({
    data: {
      organizationId: org.id,
      name: 'ORG_ADMIN',
      description: 'Organization Administrator',
      isSystem: true,
    },
  });

  const hostRole = await prisma.role.create({
    data: {
      organizationId: org.id,
      name: 'HOST',
      description: 'Event Host',
      isSystem: true,
    },
  });

  const participantRole = await prisma.role.create({
    data: {
      organizationId: org.id,
      name: 'PARTICIPANT',
      description: 'Event Participant',
      isSystem: true,
    },
  });
  console.log('✓ Roles created');

  // Create Permissions
  await prisma.permission.createMany({
    data: [
      {
        organizationId: org.id,
        name: 'event:create',
        resource: 'event',
        action: 'create',
        isSystem: true,
      },
      {
        organizationId: org.id,
        name: 'event:read',
        resource: 'event',
        action: 'read',
        isSystem: true,
      },
      {
        organizationId: org.id,
        name: 'event:update',
        resource: 'event',
        action: 'update',
        isSystem: true,
      },
      {
        organizationId: org.id,
        name: 'event:delete',
        resource: 'event',
        action: 'delete',
        isSystem: true,
      },
      {
        organizationId: org.id,
        name: 'poll:create',
        resource: 'poll',
        action: 'create',
        isSystem: true,
      },
      {
        organizationId: org.id,
        name: 'question:moderate',
        resource: 'question',
        action: 'moderate',
        isSystem: true,
      },
    ],
  });
  console.log('✓ Permissions created');

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'admin@audiencehub.demo',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36szarVe', // password123
      isEmailVerified: true,
      isActive: true,
      departmentId: engDept.id,
      designation: 'Product Lead',
    },
  });

  // Assign admin role
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: orgAdminRole.id,
      organizationId: org.id,
    },
  });
  console.log('✓ Admin user created');

  // Create Host User
  const hostUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'host@audiencehub.demo',
      firstName: 'Host',
      lastName: 'User',
      passwordHash: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36szarVe',
      isEmailVerified: true,
      isActive: true,
      departmentId: mktgDept.id,
      designation: 'Event Manager',
    },
  });

  await prisma.userRole.create({
    data: {
      userId: hostUser.id,
      roleId: hostRole.id,
      organizationId: org.id,
    },
  });
  console.log('✓ Host user created');

  // Create Participant Users
  const viewer = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'viewer@audiencehub.demo',
      firstName: 'Viewer',
      lastName: 'User',
      passwordHash: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36szarVe',
      isEmailVerified: true,
      isActive: true,
      departmentId: hrDept.id,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: viewer.id,
      roleId: participantRole.id,
      organizationId: org.id,
    },
  });
  console.log('✓ Participant user created');

  // Create Event
  const event = await prisma.event.create({
    data: {
      organizationId: org.id,
      hostId: hostUser.id,
      title: 'Q3 Company Town Hall',
      description: 'Quarterly company updates and announcements',
      status: 'draft',
      eventType: 'meeting',
      joinCode: 'DEMO1234',
      joinUrl: 'https://audiencehub.com/join/demo1234',
      isPublic: true,
      allowAnonymous: true,
      maxParticipants: 500,
      presentationMode: 'mixed',
    },
  });
  console.log('✓ Event created:', event.id);

  // Create Poll
  const poll = await prisma.poll.create({
    data: {
      eventId: event.id,
      title: 'How would you rate this event?',
      type: 'RATING',
      status: 'draft',
      isAnonymous: true,
      showResults: true,
      options: {
        create: [
          { text: '⭐ Excellent', order: 1, isCorrect: false },
          { text: '⭐⭐ Good', order: 2, isCorrect: false },
          { text: '⭐⭐⭐ Average', order: 3, isCorrect: false },
          { text: '⭐⭐⭐⭐ Poor', order: 4, isCorrect: false },
        ],
      },
    },
  });
  console.log('✓ Poll created:', poll.id);

  // Create Participants
  for (let i = 0; i < 5; i++) {
    await prisma.participant.create({
      data: {
        eventId: event.id,
        userId: i === 0 ? viewer.id : undefined,
        name: `Participant ${i + 1}`,
        email: `participant${i + 1}@example.com`,
        departmentId: [engDept.id, hrDept.id, mktgDept.id][i % 3],
        isAnonymous: i > 2,
        joinMethod: 'url',
      },
    });
  }
  console.log('✓ Participants created');

  // Create Attendance
  const participants = await prisma.participant.findMany({
    where: { eventId: event.id },
  });

  for (const participant of participants) {
    await prisma.attendance.create({
      data: {
        eventId: event.id,
        participantId: participant.id,
        joinTime: new Date(),
        totalDuration: Math.floor(Math.random() * 3600),
        isPresent: true,
      },
    });
  }
  console.log('✓ Attendance records created');

  // Create Questions
  for (let i = 0; i < 3; i++) {
    await prisma.question.create({
      data: {
        eventId: event.id,
        participantId: participants[i].id,
        text: `Question ${i + 1}: What is your feedback?`,
        status: 'pending',
        isAnonymous: true,
        upvoteCount: Math.floor(Math.random() * 10),
      },
    });
  }
  console.log('✓ Questions created');

  // Create Word Entries
  const words = ['engagement', 'fantastic', 'informative', 'well-organized', 'valuable'];
  for (const word of words) {
    await prisma.wordEntry.create({
      data: {
        eventId: event.id,
        word,
        count: Math.floor(Math.random() * 20) + 1,
        sentiment: ['positive', 'neutral'][Math.floor(Math.random() * 2)],
      },
    });
  }
  console.log('✓ Word entries created');

  // Create Analytics
  await prisma.analytics.create({
    data: {
      eventId: event.id,
      totalParticipants: 5,
      peakParticipants: 5,
      averageSessionDuration: 1800,
      attendanceRate: 100,
      engagementRate: 0.85,
      pollResponseRate: 0.8,
      qaActivityRate: 0.6,
      wordCloudActivityRate: 0.4,
      sentimentScore: 0.75,
    },
  });
  console.log('✓ Analytics created');

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
