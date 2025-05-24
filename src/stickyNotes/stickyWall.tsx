import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { DB } from '../config/firebase';
import type { Note } from '../schema/notes';
import StickyNote from './NotesSec';

export default function StickyWall() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(DB, 'Notes'), (snapshot) => {
      const notesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Note[];
      setNotes(notesData);
    });

    return () => unsubscribe();
  }, []);

  const createNote = async () => {
    await addDoc(collection(DB, 'Notes'), {
      title: 'New Note',
      content: 'Start typing...',
      category: 'Social Media',
      createdAt: new Date(),
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <button
        onClick={createNote}
        className="fixed right-8 bottom-8 rounded-full bg-blue-500 p-4 text-white shadow-lg hover:bg-blue-600"
      >
        Add Note +
      </button>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {notes.map((note) => (
          <StickyNote key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
