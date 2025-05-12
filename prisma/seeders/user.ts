import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from "uuid";
import * as bcrypt from "bcrypt";


const prisma = new PrismaClient();

export default async function user() {
    const hashedPassword = await bcrypt.hash("1234567", 12);
  // Seed user
  await prisma.users.upsert({
    where: { user_id: uuid().toString() },
    update: {},
    create: {
      email: 'fauzi@gmail.com.com',
      username: 'fauzi',
      password: hashedPassword,
      profile_picture: '/profile_picture/fauzi.jpg',
      bio: 'fauzi bio',
    },
  });

  await prisma.users.upsert({
    where: { user_id: uuid().toString() },
    update: {},
    create: {
      email: 'herkal@gmail.com.com',
      username: 'herkal',
      password: hashedPassword,
      profile_picture: '/profile_picture/herkal.png',
      bio: 'herkal bio',
    },
  });

  await prisma.users.upsert({
    where: { user_id: uuid().toString() },
    update: {},
    create: {
      email: 'dafa@gmail.com.com',
      username: 'dafa',
      password: hashedPassword,
      profile_picture: '/profile_picture/dafa.png',
      bio: 'dafa bio',
    },
  });

  await prisma.users.upsert({
    where: { user_id: uuid().toString() },
    update: {},
    create: {
      email: 'fadli@gmail.com.com',
      username: 'fadli',
      password: hashedPassword,
      profile_picture: '/profile_picture/fadli.png',
      bio: 'fadli bio',
    },
  });

  console.log('Success seed user');
}

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
