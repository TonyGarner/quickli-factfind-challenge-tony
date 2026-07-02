import mongoose, { Schema, Document, Model } from 'mongoose';
import { FactFindConfig, FactFind as FactFindType } from '@/types';

export interface FactFindDocument extends Document, Omit<FactFindType, '_id'> {
  _id: mongoose.Types.ObjectId;
}

const FieldSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'number', 'email', 'date', 'select', 'textarea'], 
    required: true 
  },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
  placeholder: String,
  helpText: String,
}, { _id: false });

const SectionSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  fields: [FieldSchema],
}, { _id: false });

const FactFindConfigSchema = new Schema({
  sections: [SectionSchema],
}, { _id: false });

const FactFindSchema = new Schema<FactFindDocument>({
  brokerId: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  clientName: String,
  clientEmail: String,
  config: { type: FactFindConfigSchema, required: true },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for submission count (can be populated or calculated separately)
FactFindSchema.virtual('submissionCount', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'factFindId',
  count: true,
});

export const FactFind: Model<FactFindDocument> = 
  mongoose.models.FactFind || mongoose.model<FactFindDocument>('FactFind', FactFindSchema);
