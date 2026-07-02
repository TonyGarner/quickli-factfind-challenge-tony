import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { Submission } from '@/models/Submission';
import { FactFind } from '@/models/FactFind';
import { z } from 'zod';
import { buildZodSchema } from '@/lib/buildZodSchema';

const createSubmissionSchema = z.object({
  slug: z.string(),
  answers: z.record(z.any()),
  applicantName: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const { factFindId, slug } = req.query;

    let query: any = {};

    if (factFindId) {
      query.factFindId = String(factFindId);
    } else if (slug) {
      query.slug = String(slug);   // Support pre-fill by slug
    } else {
      return res.status(400).json({ error: 'factFindId or slug required' });
    }

    const submissions = await Submission.find(query)
      .sort({ submittedAt: -1 })
      .lean();

    return res.status(200).json(submissions);
  }

  if (req.method === 'POST') {
    try {
      const body = createSubmissionSchema.parse(req.body);

      // Find the fact find to validate against its config
      const factFind = await FactFind.findOne({ slug: body.slug }).lean();
      if (!factFind) {
        return res.status(404).json({ error: 'Fact find not found' });
      }

      // Validate answers against the exact config the broker set
      const zodSchema = buildZodSchema(factFind.config);
      const validatedAnswers = zodSchema.parse(body.answers);

      const submission = await Submission.create({
        factFindId: factFind._id.toString(),
        slug: body.slug,
        answers: validatedAnswers,
        applicantName: body.applicantName || validatedAnswers.full_name || validatedAnswers.fullName || 'Applicant',
      });

      return res.status(201).json(submission);
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: e.errors });
      }
      console.error(e);
      return res.status(500).json({ error: 'Failed to save submission' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
