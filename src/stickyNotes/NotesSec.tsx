import { useState } from 'react';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { DB } from '../config/firebase';
import { type Note } from '@/schema/notes';
import { format } from 'date-fns/format';

// src/components/StickyNote.tsx
export default function StickyNote({ note }: { note: Note }) {
  const [title, setTitle] = useState(note.title || 'Untitled');
  const [editingContent, setEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content);
  const [currentColor, setCurrentColor] = useState(note.color);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [selectedDate, setSelectedDate] = useState(note.createdAt || null);

  const handleUpdate = async () => {
    if (!note.id) return;
    await updateDoc(doc(DB, 'Notes', note.id), {
      title,
      content: editedContent,
      color: currentColor,
      createdAt: new Date(selectedDate),
    });
    setIsEditingTitle(false);
    setEditingContent(false);
  };

  const handleDelete = async () => {
    if (note.id && confirm('Are you sure you want to delete this note?')) {
      await deleteDoc(doc(DB, 'Notes', note.id));
    }
  };

  return (
    <div
      className={`rounded-lg p-4 shadow-lg ${currentColor} relative transition-colors duration-300`}
    >
      <div className="mb-2 flex items-center justify-between">
        {/* Color options */}
        <div className="flex gap-2">
          {['bg-yellow-200', 'bg-blue-200', 'bg-green-200', 'bg-pink-200'].map(
            (color) => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`h-5 w-5 rounded-full ${color} border-2 ${
                  currentColor === color ? 'border-black' : 'border-transparent'
                }`}
              />
            ),
          )}
        </div>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700"
          title="Delete"
        >
          ×
        </button>
      </div>

      {/* Title Field */}
      {isEditingTitle ? (
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleUpdate}
          className="w-full bg-transparent text-lg font-semibold focus:outline-none"
          autoFocus
        />
      ) : (
        <h2
          className="cursor-pointer text-lg font-semibold"
          onClick={() => setIsEditingTitle(true)}
        >
          {title}
        </h2>
      )}

      {/* Content Field */}
      {editingContent && (
        <button
          onClick={handleUpdate}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Save
        </button>
      ) ? (
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          onBlur={handleUpdate}
          className="mt-2 max-h-40 w-full resize-none overflow-auto bg-transparent focus:outline-none"
          rows={4}
          autoFocus
        />
      ) : (
        <p
          className="mt-2 cursor-text whitespace-pre-wrap"
          onClick={() => setEditingContent(true)}
        >
          {editedContent}
        </p>
      )}

      {/* Timestamp */}

      <input
        type="date"
        onChange={(e) => setSelectedDate(new Date(e.target.value))}
        className="mb-2 w-full rounded border border-gray-300 p-1 text-sm text-gray-900"
      />
    </div>
  );
}
