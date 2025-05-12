import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export default async function post() {
  const users = await prisma.users.findMany();

  const sampleContents = [
    {
      content: 'Ini contoh postingan dengan gambar 1',
      media_url: 'postingan/post_fauzi.jpeg',
    },
    {
      content: 'Ini contoh postingan dengan gambar 2',
      media_url: 'postingan/post_herkal.jpeg',
    },
    {
      content: 'Ini contoh postingan dengan gambar 3',
      media_url: 'postingan/post_dafa.jpg',
    },
    {
      content: 'Ini contoh postingan dengan gambar 4',
      media_url: 'postingan/post_fadli.jpeg',
    },
  ];

  const limit = Math.min(users.length, sampleContents.length);

  for (let i = 0; i < limit; i++) {
    await prisma.posts.create({
      data: {
        post_id: uuidv4(),
        user_id: users[i].user_id, // ⬅️ user_id yang valid dari DB
        content: sampleContents[i].content,
        media_url: sampleContents[i].media_url,
      },
    });
  }

  console.log(`Success seed posts`);
}
