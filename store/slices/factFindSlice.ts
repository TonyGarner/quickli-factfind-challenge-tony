import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FactFind, Submission, FactFindState } from '@/types';

const initialState: FactFindState = {
  factFinds: [],
  submissions: [],
  selectedFactFind: null,
  selectedSubmission: null,
  isLoading: false,
  error: null,
  createModalOpen: false,
  submissionsModalOpen: false,
};

// Async thunks
export const fetchFactFinds = createAsyncThunk('factFind/fetchAll', async () => {
  const res = await fetch('/api/fact-finds');
  if (!res.ok) throw new Error('Failed to fetch fact finds');
  return res.json();
});

export const createFactFind = createAsyncThunk(
  'factFind/create',
  async (payload: { title: string; clientName?: string; clientEmail?: string; config: any }) => {
    const res = await fetch('/api/fact-finds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create fact find');
    return res.json();
  }
);

export const fetchSubmissions = createAsyncThunk(
  'factFind/fetchSubmissions',
  async (factFindId: string) => {
    const res = await fetch(`/api/submissions?factFindId=${factFindId}`);
    if (!res.ok) throw new Error('Failed to fetch submissions');
    return res.json();
  }
);

export const markSubmissionReviewed = createAsyncThunk(
  'factFind/markReviewed',
  async ({ submissionId, reviewed }: { submissionId: string; reviewed: boolean }) => {
    const res = await fetch(`/api/submissions/${submissionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewed }),
    });
    if (!res.ok) throw new Error('Failed to update submission');
    return res.json();
  }
);

const factFindSlice = createSlice({
  name: 'factFind',
  initialState,
  reducers: {
    setCreateModalOpen: (state, action: PayloadAction<boolean>) => {
      state.createModalOpen = action.payload;
    },
    setSubmissionsModalOpen: (state, action: PayloadAction<boolean>) => {
      state.submissionsModalOpen = action.payload;
    },
    setSelectedFactFind: (state, action: PayloadAction<FactFind | null>) => {
      state.selectedFactFind = action.payload;
      state.submissions = []; // reset when changing
    },
    setSelectedSubmission: (state, action: PayloadAction<Submission | null>) => {
      state.selectedSubmission = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch fact finds
      .addCase(fetchFactFinds.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFactFinds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.factFinds = action.payload;
      })
      .addCase(fetchFactFinds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load fact finds';
      })
      // Create
      .addCase(createFactFind.fulfilled, (state, action) => {
        state.factFinds.unshift(action.payload);
        state.createModalOpen = false;
      })
      // Submissions
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.submissions = action.payload;
      })
      .addCase(markSubmissionReviewed.fulfilled, (state, action) => {
        const updated = action.payload;
        state.submissions = state.submissions.map(s =>
          s._id === updated._id ? updated : s
        );
        if (state.selectedSubmission?._id === updated._id) {
          state.selectedSubmission = updated;
        }
      });
  },
});

export const {
  setCreateModalOpen,
  setSubmissionsModalOpen,
  setSelectedFactFind,
  setSelectedSubmission,
  clearError,
} = factFindSlice.actions;

export default factFindSlice.reducer;
