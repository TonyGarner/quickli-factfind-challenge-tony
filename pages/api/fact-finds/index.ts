import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { FactFind } from '@/models/FactFind';
import { Submission } from '@/models/Submission';
import { z } from 'zod';
import { customAlphabet } from 'nanoid';

// Simple nanoid for slugs (no extra dep if possible, but nanoid is clean. Add it).
const generateSlug = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

const createSchema = z.object({
  title: z.string().min(3),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
  config: z.object({
    sections: z.array(z.any()),
  }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  // Simple auth check for demo (in real use Better Auth session)
  // For now we allow all for demo speed. In production: const session = await getSession...
  const brokerId = 'demo-broker-001'; // hardcoded for seeded demo

  if (req.method === 'GET') {
    try {
      // We no longer use .lean() here because we need to attach submissionCount reliably.
      // Using .lean() would drop Mongoose virtuals.
      const factFinds = await FactFind.find({ brokerId, status: 'active' })
        .sort({ createdAt: -1 });

      // Manually attach accurate submission count for each fact find.
      // This fixes the bug where the dashboard always showed (0) even after submissions.
      const factFindsWithCount = await Promise.all(
        factFinds.map(async (ff) => {
          const count = await Submission.countDocuments({ factFindId: ff._id.toString() });
          const obj = ff.toObject();
          obj.submissionCount = count;
          return obj;
        })
      );

      return res.status(200).json(factFindsWithCount);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to fetch fact finds' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = createSchema.parse(req.body);
      const slug = `qf_${generateSlug()}`;

      const factFind = await FactFind.create({
        brokerId,
        slug,
        title: body.title,
        clientName: body.clientName,
        clientEmail: body.clientEmail,
        config: body.config,
      });

      return res.status(201).json(factFind);
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: e.errors });
      }
      return res.status(500).json({ error: 'Failed to create fact find' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}