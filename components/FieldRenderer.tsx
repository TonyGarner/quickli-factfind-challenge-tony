import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Field } from '@/types';
import { Calendar, HelpCircle } from 'lucide-react';

interface FieldRendererProps {
  field: Field;
  control: Control<any>;
  errors: FieldErrors<any>;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({ field, control, errors }) => {
  const error = errors[field.id]?.message as string | undefined;

  const commonInputClasses = `input ${error ? 'border-red-500 focus:ring-red-200' : ''}`;

  const renderInput = () => {
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value, ...rest } }) => (
              <input
                type={field.type === 'email' ? 'email' : 'text'}
                className={commonInputClasses}
                placeholder={field.placeholder || field.label}
                value={value || ''}
                onChange={onChange}
                {...rest}
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value, ...rest } }) => (
              <input
                type="number"
                className={commonInputClasses}
                placeholder={field.placeholder || '0'}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                {...rest}
              />
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value, ...rest } }) => (
              <div className="relative">
                <input
                  type="date"
                  className={`${commonInputClasses} pr-10`}
                  value={value || ''}
                  onChange={onChange}
                  {...rest}
                />
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-quickli-muted pointer-events-none" />
              </div>
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value, ...rest } }) => (
              <textarea
                className={`${commonInputClasses} min-h-[100px] resize-y`}
                placeholder={field.placeholder || field.label}
                value={value || ''}
                onChange={onChange}
                {...rest}
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value, ...rest } }) => (
              <select
                className={commonInputClasses}
                value={value || ''}
                onChange={onChange}
                {...rest}
              >
                <option value="">Select an option...</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          />
        );

      default:
        return <div className="text-red-500 text-sm">Unsupported field type: {field.type}</div>;
    }
  };

  return (
    <div className="mb-5 last:mb-0">
      <label className="label flex items-center gap-1.5">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
        {field.helpText && (
          <span title={field.helpText} className="cursor-help">
            <HelpCircle className="h-3.5 w-3.5 text-quickli-muted" />
          </span>
        )}
      </label>

      {renderInput()}

      {error && (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};
