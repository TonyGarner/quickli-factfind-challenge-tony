import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  fetchFactFinds,
  createFactFind,
  setCreateModalOpen,
  setSubmissionsModalOpen,
  setSelectedFactFind,
  fetchSubmissions,
  setSelectedSubmission,
  markSubmissionReviewed,
} from '@/store/slices/factFindSlice';
import { FactFindConfig, Section, Field } from '@/types';
import { toast } from 'sonner';
import { Plus, Copy, Eye, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Simple Create Fact Find Modal with config controls
function CreateFactFindModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const [title, setTitle] = useState('Client Fact Find');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [includePersonal, setIncludePersonal] = useState(true);
  const [includeEmployment, setIncludeEmployment] = useState(true);
  const [customQuestions, setCustomQuestions] = useState<Array<{ label: string; type: 'text' | 'number' | 'select' }>>([]);
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [newCustomType, setNewCustomType] = useState<'text' | 'number' | 'select'>('text');
  const [loading, setLoading] = useState(false);

  const addCustomQuestion = () => {
    if (!newCustomLabel.trim() || customQuestions.length >= 3) return;
    setCustomQuestions([...customQuestions, { label: newCustomLabel.trim(), type: newCustomType }]);
    setNewCustomLabel('');
  };

  const removeCustom = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const buildConfig = (): FactFindConfig => {
    const sections: Section[] = [];

    if (includePersonal) {
      sections.push({
        id: 'personal',
        title: 'Personal Details',
        description: 'Basic information we need to identify you and contact you about your application.',
        fields: [
          { id: 'full_name', label: 'Full Legal Name', type: 'text', required: true, placeholder: 'Jane Elizabeth Smith' },
          { id: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
          { id: 'phone', label: 'Mobile Phone', type: 'text', required: true, placeholder: '0412 345 678' },
          { id: 'email', label: 'Email Address', type: 'email', required: true },
          { id: 'residential_address', label: 'Current Residential Address', type: 'text', required: true, placeholder: '123 Main St, Melbourne VIC 3000' },
        ],
      });
    }

    if (includeEmployment) {
      const employmentFields: Field[] = [
        {
          id: 'employment_status',
          label: 'Employment Status',
          type: 'select',
          required: true,
          options: ['Employed Full-time', 'Employed Part-time', 'Self-employed', 'Contractor', 'Unemployed', 'Retired']
        },
        { id: 'employer_name', label: 'Current Employer / Business Name', type: 'text', required: false, placeholder: 'Acme Corporation' },
        { id: 'position', label: 'Position / Job Title', type: 'text', required: false },
        { id: 'years_employed', label: 'Years in Current Role', type: 'number', required: false, placeholder: '3.5' },
        { id: 'annual_gross_income', label: 'Annual Gross Income (AUD)', type: 'number', required: true, placeholder: '125000' },
      ];

      // Add custom questions
      customQuestions.forEach((q, idx) => {
        employmentFields.push({
          id: `custom_${idx + 1}`,
          label: q.label,
          type: q.type === 'select' ? 'select' : q.type,
          required: false,
          options: q.type === 'select' ? ['Yes', 'No'] : undefined,
        });
      });

      sections.push({
        id: 'employment',
        title: 'Employment & Income',
        description: 'Information about your work and earnings. This helps us assess your borrowing capacity.',
        fields: employmentFields,
      });
    }

    return { sections };
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('Please give this fact find a title');
      return;
    }
    setLoading(true);

    const config = buildConfig();

    try {
      await dispatch(createFactFind({
        title: title.trim(),
        clientName: clientName.trim() || undefined,
        clientEmail: clientEmail.trim() || undefined,
        config,
      })).unwrap();

      toast.success('Fact find created! Link copied to clipboard.');
      // Copy link logic would happen after creation in real flow, but for demo we simulate here
      onClose();
      // Reset form
      setTitle('Client Fact Find');
      setClientName('');
      setClientEmail('');
      setCustomQuestions([]);
    } catch (err) {
      toast.error('Failed to create fact find');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <motion.div
        className="modal-content w-full max-w-5xl"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Create New Fact Find</h2>
          <p className="text-sm text-quickli-muted mt-1">Configure what information you need from the applicant</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Fact Find Title *</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Sarah Thompson - Purchase" />
            </div>
            <div>
              <label className="label">Client Name (optional)</label>
              <input className="input" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Sarah Thompson" />
            </div>
          </div>

          <div>
            <label className="label">Client Email (optional - for your records)</label>
            <input type="email" className="input" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
          </div>

          {/* Configuration */}
          <div>
            <h3 className="font-medium mb-3 text-quickli-primary">What do you want to collect?</h3>

            <div className="space-y-3">
              {/* Personal */}
              <label className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-quickli-light/50 transition-colors">
                <input
                  type="checkbox"
                  checked={includePersonal}
                  onChange={e => setIncludePersonal(e.target.checked)}
                  className="mt-1 accent-quickli-accent"
                />
                <div className="flex-1">
                  <div className="font-medium">Personal Details</div>
                  <div className="text-xs text-quickli-muted">Name, DOB, contact info, address — recommended for all applications</div>
                </div>
              </label>

              {/* Employment */}
              <label className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-quickli-light/50 transition-colors">
                <input
                  type="checkbox"
                  checked={includeEmployment}
                  onChange={e => setIncludeEmployment(e.target.checked)}
                  className="mt-1 accent-quickli-accent"
                />
                <div className="flex-1">
                  <div className="font-medium">Employment &amp; Income</div>
                  <div className="text-xs text-quickli-muted">Status, employer, income — critical for lending assessment</div>
                </div>
              </label>
            </div>
          </div>

          {/* Custom questions for Employment */}
          {includeEmployment && (
            <div className="border-l-4 border-quickli-accent pl-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium text-sm">Custom questions for Employment section</div>
                  <div className="text-xs text-quickli-muted">Add up to 3 extra questions specific to this client</div>
                </div>
                <span className="text-xs px-2 py-0.5 bg-quickli-light rounded text-quickli-muted">{customQuestions.length}/3</span>
              </div>

              {customQuestions.length > 0 && (
                <div className="space-y-2 mb-3">
                  {customQuestions.map((q, i) => (
                    <div key={i} className="flex items-center justify-between bg-quickli-light px-3 py-2 rounded-lg text-sm">
                      <span>{q.label} <span className="text-quickli-muted">({q.type})</span></span>
                      <button onClick={() => removeCustom(i)} className="text-red-500 hover:text-red-600">×</button>
                    </div>
                  ))}
                </div>
              )}

              {customQuestions.length < 3 && (
                <div className="flex gap-3 items-center">
                  <input
                    className="input flex-[3] text-sm py-1.5 min-w-[450px]"
                    placeholder="e.g. Do you receive any bonuses or overtime?"
                    value={newCustomLabel}
                    onChange={e => setNewCustomLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomQuestion()}
                  />
                  <select
                    className="input w-24 text-xs py-1.5"
                    value={newCustomType}
                    onChange={e => setNewCustomType(e.target.value as any)}
                  >
                    <option value="text">Short text</option>
                    <option value="number">Number</option>
                    <option value="select">Yes / No</option>
                  </select>
                  <button onClick={addCustomQuestion} className="btn btn-secondary text-sm px-5 whitespace-nowrap">Add</button>
                </div>
              )}
            </div>
          )}

          {/* Live preview hint */}
          <div className="text-xs text-quickli-muted bg-quickli-light p-3 rounded-lg">
            💡 The applicant will only see the sections and questions you have enabled above. Custom questions appear at the end of the Employment section.
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={loading || !includePersonal && !includeEmployment}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Fact Find & Copy Link'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Submissions detail modal
function SubmissionsModal() {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedFactFind, submissions, selectedSubmission, submissionsModalOpen } = useSelector((state: RootState) => state.factFind);

  const close = () => {
    dispatch(setSubmissionsModalOpen(false));
    dispatch(setSelectedSubmission(null));
  };

  const viewSubmission = (sub: any) => {
    dispatch(setSelectedSubmission(sub));
  };

  const toggleReviewed = async (sub: any) => {
    await dispatch(markSubmissionReviewed({
      submissionId: sub._id,
      reviewed: !sub.reviewed
    })).unwrap();
    toast.success(sub.reviewed ? 'Marked as needs review' : 'Marked as reviewed');
  };

  if (!submissionsModalOpen || !selectedFactFind) return null;

  return (
    <div className="modal" onClick={close}>
      <div
        className="modal-content w-full max-w-[1200px] min-w-[900px] max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <div className="font-semibold">Submissions for {selectedFactFind.title}</div>
            <div className="text-xs text-quickli-muted">{submissions.length} responses received</div>
          </div>
          <button onClick={close} className="text-quickli-muted hover:text-quickli-primary">Close</button>
        </div>

        <div className="flex-1 overflow-auto p-5 grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* List */}
          <div className="lg:col-span-2 border rounded-xl overflow-hidden">
            {submissions.length === 0 ? (
              <div className="p-8 text-center text-quickli-muted">No submissions yet.</div>
            ) : (
              submissions.map((sub: any) => (
                <div
                  key={sub._id}
                  onClick={() => viewSubmission(sub)}
                  className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-quickli-light/60 flex justify-between items-center ${selectedSubmission?._id === sub._id ? 'bg-quickli-accent/5' : ''}`}
                >
                  <div>
                    <div className="font-medium text-sm">{sub.applicantName || 'Anonymous Applicant'}</div>
                    <div className="text-xs text-quickli-muted">{new Date(sub.submittedAt).toLocaleDateString()} • {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.reviewed ? (
                      <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Reviewed</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detail view */}
          <div className="lg:col-span-3">
            {selectedSubmission ? (
              <div className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-semibold text-lg">{selectedSubmission.applicantName}</div>
                    <div className="text-xs text-quickli-muted">Submitted {new Date(selectedSubmission.submittedAt).toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => toggleReviewed(selectedSubmission)}
                    className={`btn text-xs px-3 py-1 ${selectedSubmission.reviewed ? 'btn-secondary' : 'btn-success'}`}
                  >
                    {selectedSubmission.reviewed ? 'Mark as Pending' : 'Mark as Reviewed'}
                  </button>
                </div>

                <div className="space-y-6">
                  {selectedFactFind.config.sections.map(section => (
                    <div key={section.id}>
                      <div className="font-medium text-quickli-primary mb-3 flex items-center gap-2">
                        {section.title}
                      </div>
                      <div className="divide-y">
                        {section.fields.map(field => {
                          const value = selectedSubmission.answers[field.id];
                          const displayValue = value === undefined || value === '' || value === null
                            ? <span className="text-quickli-muted italic">Not provided</span>
                            : String(value);
                          return (
                            <div key={field.id} className="answer-row">
                              <div className="answer-label">{field.label}</div>
                              <div className="answer-value">{displayValue}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedSubmission.brokerNotes && (
                  <div className="mt-6 p-3 bg-quickli-light rounded text-sm">
                    <strong className="text-quickli-muted">Your notes:</strong> {selectedSubmission.brokerNotes}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-quickli-muted border rounded-xl">
                Select a submission on the left to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { factFinds, isLoading, createModalOpen, submissionsModalOpen, selectedFactFind } = useSelector((state: RootState) => state.factFind);

  // Simple auth guard for demo
  useEffect(() => {
    const isAuthed = document.cookie.includes('demo-auth=true');
    if (!isAuthed) {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    dispatch(fetchFactFinds());
  }, [dispatch]);

  const openCreate = () => dispatch(setCreateModalOpen(true));
  const closeCreate = () => dispatch(setCreateModalOpen(false));

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/fact-find/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard', { description: url });
  };

  const openSubmissions = (ff: any) => {
    dispatch(setSelectedFactFind(ff));
    dispatch(fetchSubmissions(ff._id));
    dispatch(setSubmissionsModalOpen(true));
  };

  return (
    <>
      <Head>
        <title>Dashboard • Quickli Fact Find</title>
      </Head>

      <div className="min-h-screen bg-quickli-light">
        {/* Top nav */}
        <nav className="border-b bg-white">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-quickli-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">Q</span>
              </div>
              <div>
                <span className="font-semibold tracking-tight">Quickli</span>
                <span className="text-quickli-muted text-sm ml-1.5">Fact Find</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-quickli-muted">demo@quickli.dev</span>
              <button
                onClick={() => { document.cookie = 'demo-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; router.push('/login'); }}
                className="text-quickli-muted hover:text-quickli-primary"
              >
                Sign out
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-quickli-primary">Your Fact Finds</h1>
              <p className="text-quickli-muted mt-1">Create, share and review client information</p>
            </div>
            <button onClick={openCreate} className="btn btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Fact Find
            </button>
          </div>

          {isLoading && factFinds.length === 0 ? (
            <div className="text-center py-12 text-quickli-muted">Loading your fact finds...</div>
          ) : factFinds.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="mx-auto w-12 h-12 bg-quickli-light rounded-full flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-quickli-accent" />
              </div>
              <h3 className="font-medium mb-1">No fact finds yet</h3>
              <p className="text-sm text-quickli-muted mb-6 max-w-xs mx-auto">Create your first configurable fact find and share the link with a client.</p>
              <button onClick={openCreate} className="btn btn-accent">Create your first fact find</button>
            </div>
          ) : (
            <div className="grid gap-4">
              {factFinds.map((ff: any) => (
                <div key={ff._id} className="card p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between hover:shadow transition-shadow">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg truncate">{ff.title}</div>
                    <div className="text-sm text-quickli-muted flex items-center gap-2 mt-0.5">
                      {ff.clientName && <span>{ff.clientName}</span>}
                      {ff.clientEmail && <span>• {ff.clientEmail}</span>}
                      <span className="text-xs px-2 py-px bg-quickli-light rounded">Created {new Date(ff.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => copyLink(ff.slug)}
                      className="btn btn-secondary text-sm px-4 flex items-center gap-1.5"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy Link
                    </button>
                    <button
                      onClick={() => openSubmissions(ff)}
                      className="btn btn-accent text-sm px-4 flex items-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Submissions ({ff.submissionCount || 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateFactFindModal isOpen={createModalOpen} onClose={closeCreate} />
      <SubmissionsModal />
    </>
  );
}
