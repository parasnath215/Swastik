import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const usersToSeed = [
    { email: 'admin@sriswastik.com', name: 'Super Admin', role: 'SUPER_ADMIN', password: 'admin123' },
    { email: 'manager@sriswastik.com', name: 'Plant Manager', role: 'ADMIN', password: 'password123' },
    { email: 'sales@sriswastik.com', name: 'Sales Representative', role: 'SALES', password: 'password123' },
    { email: 'operator@sriswastik.com', name: 'Machine Operator', role: 'OPERATOR', password: 'password123' },
  ];

  for (const user of usersToSeed) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role,
        },
      });
      console.log(`Created ${user.name}: ${user.email} / ${user.password}`);
    } else {
      console.log(`${user.name} already exists.`);
    }
  }
  // Create default machines, processes, and materials
  const machine = await prisma.machine.findFirst({ where: { name: 'CNC Router' } });
  if(!machine) {
    await prisma.machine.create({ data: { name: 'CNC Router', description: 'Main cutting machine' } });
    await prisma.machine.create({ data: { name: 'Laser Cutter', description: 'Precision cutting' } });
    await prisma.process.create({ data: { name: 'Cutting', description: 'Raw material cutting' } });
    await prisma.process.create({ data: { name: 'Polishing', description: 'Surface finishing' } });
    await prisma.material.create({ data: { name: 'Plywood', description: 'Standard wood' } });
    await prisma.material.create({ data: { name: 'Acrylic', description: 'Plastic sheets' } });
    console.log('Created default machines, processes, and materials');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
