import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { notesAPI } from '../services/api';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: number;
}

interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  deleteLoading: Record<number, boolean>;
  updateLoading: Record<number, boolean>;
}

interface CreateNoteData {
  title: string;
  content: string;
}

interface UpdateNoteData {
  id: number;
  title?: string;
  content?: string;
}

const initialState: NotesState = {
  notes: [],
  loading: false,
  error: null,
  createLoading: false,
  deleteLoading: {},
  updateLoading: {},
};

// Get all notes
export const getNotes = createAsyncThunk(
  'notes/getNotes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notesAPI.getNotes();
      return response.data.data.notes;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch notes'
      );
    }
  }
);

// Create a new note
export const createNote = createAsyncThunk(
  'notes/createNote',
  async (noteData: CreateNoteData, { rejectWithValue }) => {
    try {
      const response = await notesAPI.createNote(noteData);
      return response.data.data.note;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create note'
      );
    }
  }
);

// Update a note
export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async (updateData: UpdateNoteData, { rejectWithValue }) => {
    try {
      const { id, ...data } = updateData;
      const response = await notesAPI.updateNote(id, data);
      return response.data.data.note;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update note'
      );
    }
  }
);

// Delete a note
export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (noteId: number, { rejectWithValue }) => {
    try {
      await notesAPI.deleteNote(noteId);
      return noteId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete note'
      );
    }
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearNotes: (state) => {
      state.notes = [];
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get notes
      .addCase(getNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotes.fulfilled, (state, action: PayloadAction<Note[]>) => {
        state.loading = false;
        state.notes = action.payload;
        state.error = null;
      })
      .addCase(getNotes.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create note
      .addCase(createNote.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action: PayloadAction<Note>) => {
        state.createLoading = false;
        state.notes.unshift(action.payload); // Add new note to the beginning
        state.error = null;
      })
      .addCase(createNote.rejected, (state, action: PayloadAction<any>) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // Update note
      .addCase(updateNote.pending, (state, action) => {
        const noteId = action.meta.arg.id;
        state.updateLoading[noteId] = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action: PayloadAction<Note>) => {
        const noteId = action.payload.id;
        state.updateLoading[noteId] = false;
        const index = state.notes.findIndex(note => note.id === noteId);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateNote.rejected, (state, action) => {
        const noteId = action.meta.arg.id;
        state.updateLoading[noteId] = false;
        state.error = action.payload as string;
      })

      // Delete note
      .addCase(deleteNote.pending, (state, action) => {
        const noteId = action.meta.arg;
        state.deleteLoading[noteId] = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action: PayloadAction<number>) => {
        const noteId = action.payload;
        state.deleteLoading[noteId] = false;
        state.notes = state.notes.filter(note => note.id !== noteId);
        state.error = null;
      })
      .addCase(deleteNote.rejected, (state, action) => {
        const noteId = action.meta.arg;
        state.deleteLoading[noteId] = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearNotes, setError } = notesSlice.actions;
export default notesSlice.reducer;