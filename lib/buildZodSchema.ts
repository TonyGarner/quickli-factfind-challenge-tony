import { z } from 'zod';
import { FactFindConfig, Field } from '@/types';

export function buildZodSchema(config: FactFindConfig) {
  const shape: Record<string, z.ZodTypeAny> = {};

  config.sections.forEach(section => {
    section.fields.forEach(field => {
      // Changed to 'any' to satisfy TypeScript for .min() calls across different Zod types
      // (ZodTypeAny is too strict for dynamic chaining in this builder)
      let schema: any;

      switch (field.type) {
        case 'text':
        case 'textarea':
          schema = z.string().trim();
          if (field.required) {
            schema = schema.min(1, `${field.label} is required`);
          }
          break;

        case 'email':
          schema = z.string().email('Please enter a valid email address');
          if (!field.required) {
            schema = schema.optional().or(z.literal(''));
          }
          break;

        case 'number':
          schema = z.coerce.number({
            invalid_type_error: `${field.label} must be a number`,
          });
          if (field.required) {
            schema = schema.min(0, `${field.label} must be 0 or greater`);
          } else {
            schema = schema.optional();
          }
          break;

        case 'date':
          if (field.required) {
            schema = z.string()
              .min(1, `${field.label} is required`)
              .refine((val) => !isNaN(Date.parse(val)), {
                message: 'Please enter a valid date',
              });
          } else {
            schema = z.string()
              .optional()
              .or(z.literal(''))
              .refine((val) => !val || !isNaN(Date.parse(val)), {
                message: 'Please enter a valid date',
              });
          }
          break;

        case 'select':
          if (field.options && field.options.length > 0) {
            schema = z.enum(field.options as [string, ...string[]]);
          } else {
            schema = z.string();
          }
          if (field.required) {
            schema = schema.refine((val: string | any[]) => val && val.length > 0, {
              message: `${field.label} is required`,
            });
          } else {
            schema = schema.optional();
          }
          break;

        default:
          schema = z.any();
      }

      shape[field.id] = schema;
    });
  });

  return z.object(shape);
}

export function getDefaultValues(config: FactFindConfig): Record<string, any> {
  const defaults: Record<string, any> = {};
  config.sections.forEach(section => {
    section.fields.forEach(field => {
      defaults[field.id] = '';
    });
  });
  return defaults;
}