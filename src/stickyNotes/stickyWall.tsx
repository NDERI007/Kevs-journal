import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { DB } from '../config/firebase';
import type { Note } from '../schema/notes';
import StickyNote from './NotesSec';

export default function StickyWall() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(DB, 'Notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Note[];
      setNotes(notesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createNote = async () => {
    await addDoc(collection(DB, 'Notes'), {
      title: '',
      content: 'Start typing...',
      color: 'bg-yellow-200',
      createdAt: serverTimestamp(),
    });
  };

  return (
    <div className="min-h-screen bg-[#242424] p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Sticky Notes</h1>
        <button
          onClick={createNote}
          className="rounded-full bg-fuchsia-500 px-4 py-2 text-white shadow-lg transition-colors hover:bg-fuchsia-400"
        >
          + New Note
        </button>
      </div>

      {loading ? (
        <p className="text-center text-white">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-center text-white">No notes yet. Add one!</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.map((note) => (
            <StickyNote key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
