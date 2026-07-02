import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { FactFind } from '@/models/FactFind';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  await connectToDatabase();

  const { slug } = req.query;

  try {
    const factFind = await FactFind.findOne({ slug, status: 'active' }).lean();
    if (!factFind) {
      return res.status(404).json({ error: 'Fact find not found or no longer active' });
    }

    // Return only safe public fields (no brokerId etc)
    const publicData = {
      _id: factFind._id,
      slug: factFind.slug,
      title: factFind.title,
      clientName: factFind.clientName,
      config: factFind.config,
      createdAt: factFind.createdAt,
    };

    return res.status(200).json(publicData);
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
