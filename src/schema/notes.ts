// src/types.ts
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export const NoteSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  color: z.string().default('bg-yellow-200'),
  createdAt: z
    .union([z.instanceof(Date), z.instanceof(Timestamp)])
    .transform((val) => (val instanceof Timestamp ? val.toDate() : val)), // Ensures it's a Firestore Timestamp
});

export type Note = z.infer<typeof NoteSchema>;
