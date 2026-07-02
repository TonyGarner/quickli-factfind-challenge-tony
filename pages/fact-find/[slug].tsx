import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FactFindConfig } from '@/types';
import { FieldRenderer } from '@/components/FieldRenderer';
import { buildZodSchema, getDefaultValues } from '@/lib/buildZodSchema';
import { toast } from 'sonner';
import { CheckCircle, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ApplicantFactFind() {
  const router = useRouter();
  const { slug } = router.query as { slug: string };

  const [config, setConfig] = useState<FactFindConfig | null>(null);
  const [factFindMeta, setFactFindMeta] = useState<any>(null);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submissionRef, setSubmissionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: config ? zodResolver(buildZodSchema(config)) : undefined,
    defaultValues: {},
    mode: 'onBlur',
  });

  const { control, handleSubmit, formState: { errors, isValid }, reset } = form;

  // Load config + check for existing submission (pre-fill)
  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      try {
        // 1. Get fact find config
        const configRes = await fetch(`/api/fact-finds/${slug}`);
        if (!configRes.ok) throw new Error('Not found');
        const data = await configRes.json();
        setFactFindMeta(data);
        setConfig(data.config);

        // 2. Check if there's already a submission for this slug (resume/pre-fill)
        const subRes = await fetch(`/api/submissions?slug=${slug}`);
        if (subRes.ok) {
          const subs = await subRes.json();
          if (subs.length > 0) {
            const latest = subs[0];
            setExistingSubmission(latest);
            reset(latest.answers);   // Pre-fill the form
          } else {
            reset(getDefaultValues(data.config));
          }
        } else {
          reset(getDefaultValues(data.config));
        }
      } catch (e) {
        toast.error('This fact find link is invalid or has expired.');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, reset, router]);

  const onSubmit = async (data: any) => {
    if (!slug || !config) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          answers: data,
          applicantName: data.full_name || data.fullName,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Submission failed');
      }

      const result = await res.json();
      setSubmissionRef(result._id.toString().slice(-8).toUpperCase());
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ... (rest of the component remains the same - loading, submitted screen, form rendering)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quickli-light">
        <div className="text-quickli-muted">Loading your fact find...</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-quickli-light flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center card p-10"
        >
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-9 w-9 text-quickli-success" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Thank you — your fact find has been submitted</h1>
          <p className="text-quickli-muted mb-6">Your broker will review your information and be in touch shortly.</p>
          
          <div className="bg-quickli-light rounded-xl p-4 mb-8 text-left text-sm">
            <div className="text-quickli-muted">Reference number</div>
            <div className="font-mono text-xl tracking-[3px] text-quickli-primary mt-1">QF-{submissionRef}</div>
          </div>

          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-secondary w-full"
          >
            Submit another response (if needed)
          </button>
        </motion.div>
      </div>
    );
  }

  if (!config || !factFindMeta) {
    return <div className="p-8 text-center text-red-600">Unable to load fact find.</div>;
  }

  const totalFields = config.sections.reduce((acc, s) => acc + s.fields.length, 0);
  const filledCount = Object.entries(form.watch()).filter(([, v]) => {
    return v !== undefined && v !== '' && v !== null;
  }).length;
  const progress = totalFields > 0 ? Math.round((filledCount / totalFields) * 100) : 0;

  return (
    <>
      <Head>
        <title>{factFindMeta.title} • Quickli Fact Find</title>
      </Head>

      <div className="min-h-screen bg-quickli-light">
        {/* Header - same as before */}
        <div className="bg-white border-b">
          <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-quickli-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">Q</span>
              </div>
              <div>
                <div className="font-semibold tracking-tight">Quickli Fact Find</div>
                <div className="text-[10px] text-quickli-muted -mt-0.5">CONFIDENTIAL — FOR YOUR BROKER</div>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="text-quickli-muted">Prepared for</div>
              <div className="font-medium text-quickli-primary">{factFindMeta.clientName || 'Valued Client'}</div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-semibold tracking-tight text-quickli-primary">{factFindMeta.title}</h1>
              <div className="flex items-center gap-1.5 text-xs text-quickli-muted bg-white px-3 py-1 rounded-full border">
                <Clock className="h-3 w-3" /> ~5–8 min
              </div>
            </div>
            <p className="text-quickli-muted">Please complete all required fields. Your answers are sent securely to your broker.</p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-xs mb-1.5 text-quickli-muted">
              <span>Progress</span>
              <span>{progress}% complete</span>
            </div>
            <div className="progress">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {config.sections.map((section, idx) => (
              <div key={section.id} className="section-card">
                <div className="mb-5">
                  <div className="font-semibold text-xl tracking-tight text-quickli-primary">{section.title}</div>
                  {section.description && (
                    <p className="text-sm text-quickli-muted mt-1.5 leading-relaxed">{section.description}</p>
                  )}
                </div>

                <div>
                  {section.fields.map(field => (
                    <FieldRenderer 
                      key={field.id} 
                      field={field} 
                      control={control as any} 
                      errors={errors} 
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || !isValid}
                className="btn btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:bg-quickli-primary/70"
              >
                {submitting ? 'Submitting securely...' : 'Submit Fact Find to Broker'}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
              <p className="text-center text-[10px] text-quickli-muted mt-3">Your information is encrypted in transit and only visible to your broker.</p>
            </div>
          </form>
        </div>

        <footer className="text-center py-8 text-[10px] text-quickli-muted">
          Quickli Fact Find • Confidential client information collection
        </footer>
      </div>
    </>
  );
}