import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { Submission } from '@/models/Submission';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  const { id } = req.query;

  if (req.method === 'PATCH') {
    try {
      const { reviewed } = req.body;
      const updated = await Submission.findByIdAndUpdate(
        id,
        {
          reviewed: !!reviewed,
          reviewedAt: reviewed ? new Date() : null,
        },
        { new: true }
      ).lean();

      if (!updated) return res.status(404).json({ error: 'Submission not found' });
      return res.status(200).json(updated);
    } catch (e) {
      return res.status(500).json({ error: 'Update failed' });
    }
  }

  res.setHeader('Allow', ['PATCH']);
  res.status(405).end();
}
