import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../redux/store';
import { logout, getCurrentUser } from '../redux/authSlice';
import { getNotes, createNote, deleteNote, clearError } from '../redux/noteSlice';
import Trash from '../../public/delete.svg'
import HD from "../../public/HD.svg"
import Input from '../components/Input';
import Button from '../components/Button';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: number;
}

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { user, isAuthenticated, loading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const { notes, loading: notesLoading, createLoading, error: notesError } = useSelector(
    (state: RootState) => state.notes
  );

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: ''
  });
  const [formErrors, setFormErrors] = useState({
    title: '',
    content: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Fetch user info and notes when component mounts
    dispatch(getCurrentUser());
    dispatch(getNotes());
  }, [isAuthenticated, dispatch, navigate]);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const validateNoteForm = () => {
    const errors = {
      title: '',
      content: ''
    };

    if (!newNote.title.trim()) {
      errors.title = 'Title is required';
    } else if (newNote.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!newNote.content.trim()) {
      errors.content = 'Content is required';
    } else if (newNote.content.trim().length < 10) {
      errors.content = 'Content must be at least 10 characters';
    }

    setFormErrors(errors);
    return !errors.title && !errors.content;
  };

  const handleCreateNote = async () => {
    if (!validateNoteForm()) {
      return;
    }

    try {
      await dispatch(createNote({
        title: newNote.title.trim(),
        content: newNote.content.trim()
      })).unwrap();
      
      // Reset form and close modal
      setNewNote({ title: '', content: '' });
      setFormErrors({ title: '', content: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await dispatch(deleteNote(noteId)).unwrap();
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewNote(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear general error
    if (notesError) {
      dispatch(clearError());
    }
  };

  const openCreateForm = () => {
    setShowCreateForm(true);
    setNewNote({ title: '', content: '' });
    setFormErrors({ title: '', content: '' });
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setNewNote({ title: '', content: '' });
    setFormErrors({ title: '', content: '' });
    dispatch(clearError());
  };

  const openReadMore = (note: Note) => {
    setSelectedNote(note);
    setShowReadMore(true);
  };

  const closeReadMore = () => {
    setShowReadMore(false);
    setSelectedNote(null);
  };

  // Function to detect if content looks like code


  // Function to truncate content for preview
  const truncateContent = (content: string, maxLength: number = 100): { text: string; isTruncated: boolean } => {
    if (content.length <= maxLength) {
      return { text: content, isTruncated: false };
    }
    
    return { 
      text: content.substring(0, maxLength) + '...', 
      isTruncated: true 
    };
  };

  // Function to format content for display

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex justify-center px-4 py-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6">
              <img src={HD} alt="HD" />
            </div>
            <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Sign Out
          </button>
        </div>

        {/* Welcome card */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome, {user?.name ? (
              <>
                {user.name.split(' ')[0]} <span className="text-blue-600">{user.name.split(' ').slice(1).join(' ')}</span>
              </>
            ) : (
              'User'
            )} !
          </h2>
          <p className="text-sm text-gray-500 mt-1">Email: {user?.email || 'Loading...'}</p>
          {user?.dob && (
            <p className="text-sm text-gray-500">DOB: {user.dob}</p>
          )}
        </div>

        {/* Error message */}
        {notesError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{notesError}</p>
          </div>
        )}

        {/* Create note button */}
        <button
          onClick={openCreateForm}
          disabled={createLoading}
          className="w-full py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition mb-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {createLoading ? 'Creating...' : 'Create Note'}
        </button>

        {/* Notes list */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-3">Notes</h3>
          
          {notesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No notes yet. Create your first note!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => {
                const { text: truncatedContent, isTruncated } = truncateContent(note.content, 100);
                
                return (
                  <div
                    key={note.id}
                    className="bg-white shadow-sm rounded-md px-4 py-3 border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-700 mb-2 truncate">{note.title}</div>
                        <div className="mb-2">
                          {formatContent(truncatedContent)}
                        </div>
                        {isTruncated && (
                          <button
                            onClick={() => openReadMore(note)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            Read More
                          </button>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(note.created_at).toLocaleDateString()} {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={createLoading}
                        className="text-gray-500 hover:text-red-600 ml-3 flex-shrink-0 disabled:opacity-50"
                      >
                        <img src={Trash} alt="Delete" className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create note modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create New Note</h3>
                <button
                  onClick={closeCreateForm}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Title"
                  name="title"
                  type="text"
                  value={newNote.title}
                  onChange={handleInputChange}
                  error={formErrors.title}
                  placeholder="Enter note title"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    name="content"
                    value={newNote.content}
                    onChange={handleInputChange}
                    placeholder="Write your note content here..."
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
                      formErrors.content 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.content && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.content}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={closeCreateForm}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateNote}
                    disabled={createLoading || !newNote.title.trim() || !newNote.content.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {createLoading ? 'Creating...' : 'Create Note'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Read More Modal */}
      {showReadMore && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">{selectedNote.title}</h3>
                <button
                  onClick={closeReadMore}
                  className="text-gray-400 hover:text-gray-600 text-xl flex-shrink-0"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-3">
                  Created: {new Date(selectedNote.created_at).toLocaleDateString()} {new Date(selectedNote.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {selectedNote.updated_at !== selectedNote.created_at && (
                    <span className="ml-2">
                      • Updated: {new Date(selectedNote.updated_at).toLocaleDateString()} {new Date(selectedNote.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                  {formatContent(selectedNote.content, true)}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={closeReadMore}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to detect if content looks like code
  function isCodeContent(content: string): boolean {
    const codeIndicators = [
      /^[\s]*(?:function|const|let|var|class|import|export|if|for|while|return|def|public|private|protected)/m,
      /[\{\}\[\]();]/,
      /^[\s]*\/\/|^[\s]*\/\*|\*\/|^[\s]*#/m,
      /^[\s]*<[^>]+>/m, // HTML tags
      /^[\s]*\$|^[\s]*npm|^[\s]*git/m, // Shell commands
      /^[\s]*SELECT|^[\s]*INSERT|^[\s]*UPDATE|^[\s]*DELETE/im, // SQL
      /^[\s]*```/m, // Markdown code blocks
    ];
    
    return codeIndicators.some(pattern => pattern.test(content));
  }

  // Function to format content for display
  function formatContent(content: string, isInPopup: boolean = false) {
    const isCode = isCodeContent(content);
    
    if (isCode) {
      return (
        <pre className={`${isInPopup ? 'text-sm' : 'text-xs'} bg-gray-100 p-3 rounded border overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed`}>
          <code className="text-gray-800">{content}</code>
        </pre>
      );
    } else {
      // Handle regular text with proper line breaks and formatting
      return (
        <div className={`${isInPopup ? 'text-sm' : 'text-sm'} text-gray-600 whitespace-pre-wrap break-words leading-relaxed`}>
          {content}
        </div>
      );
    }
  }
};

export default Dashboard;