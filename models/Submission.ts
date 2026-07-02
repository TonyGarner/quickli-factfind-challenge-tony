import mongoose, { Schema, Document, Model } from 'mongoose';
import { Submission as SubmissionType } from '@/types';

export interface SubmissionDocument extends Document, Omit<SubmissionType, '_id'> {
  _id: mongoose.Types.ObjectId;
}

const SubmissionSchema = new Schema<SubmissionDocument>({
  factFindId: { type: String, required: true, index: true }, // store as string for simplicity
  slug: { type: String, required: true, index: true },
  answers: { type: Schema.Types.Mixed, required: true }, // flexible but validated at API
  applicantName: String,
  submittedAt: { type: Date, default: Date.now },
  reviewed: { type: Boolean, default: false },
  reviewedAt: Date,
  brokerNotes: String,
}, {
  timestamps: true,
});

export const Submission: Model<SubmissionDocument> = 
  mongoose.models.Submission || mongoose.model<SubmissionDocument>('Submission', SubmissionSchema);
