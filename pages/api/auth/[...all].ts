import { getAuth } from '@/lib/auth';
import { toNodeHandler } from 'better-auth/node';

export default async function handler(req: any, res: any) {
  const auth = await getAuth();
  const handler = toNodeHandler(auth);
  return handler(req, res);
}

export const config = {
  api: {
    bodyParser: false, // Better Auth handles its own body parsing
  },
};
