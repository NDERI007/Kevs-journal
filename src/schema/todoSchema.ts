// schemas/todoSchema.ts
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// Define a task schema
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  description: z.string().optional(),
  DueDate: z.custom<Timestamp>((val) => val instanceof Timestamp), // Ensures it's a Firestore Timestamp
});

// Define a task group schema
export const TaskGroupSchema = z.object({
  name: z.string(),
  tasks: z.array(TaskSchema),
});

export type Task = z.infer<typeof TaskSchema>;
export type TaskGroup = z.infer<typeof TaskGroupSchema> & { id: string }; // Automatically creates the TypeScript type
