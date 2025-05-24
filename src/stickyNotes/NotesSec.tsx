// src/components/StickyNote.tsx
import { useState } from 'react';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { DB } from '../config/firebase';
import type { Note } from '@/schema/notes';

export default function StickyNote({ note }: { note: Note }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content);
  const [currentColor, setCurrentColor] = useState(note.color);

  const handleUpdate = async () => {
    if (note.id) {
      await updateDoc(doc(DB, 'Notes', note.id), {
        content: editedContent,
        color: currentColor,
      });
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (note.id) {
      await deleteDoc(doc(DB, 'Notes', note.id));
    }
  };

  return (
    <div className={`rounded-lg p-6 shadow-lg ${currentColor} relative`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {['bg-yellow-200', 'bg-blue-200', 'bg-green-200', 'bg-pink-200'].map(
            (color) => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`h-6 w-6 rounded-full ${color} border-2 ${
                  currentColor === color ? 'border-black' : 'border-transparent'
                }`}
              />
            ),
          )}
        </div>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700"
        >
          ×
        </button>
      </div>

      {isEditing ? (
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          onBlur={handleUpdate}
          className="w-full resize-none bg-transparent focus:outline-none"
          autoFocus
        />
      ) : (
        <p
          onClick={() => setIsEditing(true)}
          className="cursor-text whitespace-pre-wrap"
        >
          {note.content}
        </p>
      )}
    </div>
  );
}
