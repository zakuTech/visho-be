import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export default async function post() {
  const users = await prisma.users.findMany();

  const sampleContents = [
    {
      content: 'Ini contoh postingan dengan video 1',
      media_url:
        'https://fdybouadfrhduknxbrma.supabase.co/storage/v1/object/public/visho-assets/posts/1747042009578-videoplayback.mp4',
      media_path: 'posts/1747042009578-videoplayback.mp4',
    },
    {
      content: 'Ini contoh postingan dengan burger',
      media_url:
        'https://fdybouadfrhduknxbrma.supabase.co/storage/v1/object/public/visho-assets/posts/1747042106100-burger.jpg',
      media_path: 'gambar burger.jpg',
    },
    {
      content: 'Ini contoh postingan dengan volley ball',
      media_url:
        'https://fdybouadfrhduknxbrma.supabase.co/storage/v1/object/public/visho-assets/posts/1747042424404-videoplayback2.mp4',
      media_path: 'gambar volley ball.jpg',
    },
    {
      content: 'Ini contoh postingan dengan taman bunga',
      media_url:
        'https://fdybouadfrhduknxbrma.supabase.co/storage/v1/object/public/visho-assets/posts/1747042142824-f2vpfpzasaacf-e.jpeg',
      media_path: 'gambar taman bunga.jpg',
    },
  ];

  const limit = Math.min(users.length, sampleContents.length);

  for (let i = 0; i < limit; i++) {
    await prisma.posts.create({
      data: {
        post_id: uuidv4(),
        content: sampleContents[i].content,
        media_url: sampleContents[i].media_url,
        media_path: sampleContents[i].media_path,
        user: {
          connect: { user_id: users[i].user_id }, // koneksi ke user by relasi
        },
      },
    });
  }

  console.log(`Success seed posts`);
}
