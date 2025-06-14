import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default async function user() {
  const hashedPassword = await bcrypt.hash('1234567', 12);
  // Seed user
  await prisma.users.upsert({
    where: { email: 'fauzi@gmail.com' },
    update: {},
    create: {
      user_id: uuid().toString(),
      email: 'fauzi@gmail.com',
      username: 'fauzi',
      password: hashedPassword,
      bio: 'fauzi bio',
    },
  });

  await prisma.users.upsert({
    where: {
      email: 'herkal@gmail.com',
    },
    update: {},
    create: {
      user_id: uuid().toString(),
      email: 'herkal@gmail.com',
      username: 'herkal',
      password: hashedPassword,
      bio: 'herkal bio',
    },
  });

  await prisma.users.upsert({
    where: { email: 'dafa@gmail.com' },
    update: {},
    create: {
      user_id: uuid().toString(),
      email: 'dafa@gmail.com',
      username: 'dafa',
      password: hashedPassword,
      bio: 'dafa bio',
    },
  });

  await prisma.users.upsert({
    where: {
      email: 'fadli@gmail.com',
    },
    update: {},
    create: {
      user_id: uuid().toString(),
      email: 'fadli@gmail.com',
      username: 'fadli',
      password: hashedPassword,
      bio: 'fadli bio',
    },
  });

  console.log('Success seed user');
}
