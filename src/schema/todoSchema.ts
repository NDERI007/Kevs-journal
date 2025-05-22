// schemas/todoSchema.ts
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export const TodoSchema = z.object({
  Title: z.string(), //required
  Description: z.string().optional(), //not-required
  completed: z.boolean().optional(),
  id: z.string(), // You manually add this from doc.id
  DueDate: z.custom<Timestamp>((val) => val instanceof Timestamp), // Ensures it's a Firestore Timestamp
});

export type Todo = z.infer<typeof TodoSchema>; // Automatically creates the TypeScript type
