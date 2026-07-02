import { connectToDatabase } from '../lib/mongodb';
import { getAuth } from '../lib/auth';

async function seed() {
  console.log('Seeding demo broker user...');
  await connectToDatabase();
  const auth = await getAuth();

  try {
    // Better Auth way to create user (demo)
    await auth.api.createUser({
      body: {
        email: 'demo@quickli.dev',
        password: 'demo1234',
        name: 'Demo Broker',
      },
    });
    console.log('✅ Demo user created: demo@quickli.dev / demo1234');
  } catch (e: any) {
    if (e.message?.includes('already exists')) {
      console.log('Demo user already exists.');
    } else {
      console.error('Seed error:', e);
    }
  }
  process.exit(0);
}

seed();
