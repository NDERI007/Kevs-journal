import { useEffect, useState } from 'react';
import { DB } from '../config/firebase';
import {
  collection,
  updateDoc,
  doc,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import { type User } from 'firebase/auth';
import { type TaskGroup, TaskGroupSchema } from '../schema/todoSchema'; // Had to redefine the structure again because,
//  TypeScript has no way of knowing what structure your Firestore documents have.
import AddTaskDialog from './addTask';
import { CheckCheck, LogOut } from 'lucide-react';
import { format } from 'date-fns';

type SidebarProps = {
  user: User;
  handleLogOut: () => void;
};

const Sidebar = ({ user, handleLogOut }: SidebarProps) => {
  const [groups, setGroups] = useState<TaskGroup[]>([]); //groups is iniialized as a state var with an empty array of TaskGroup type

  const today = format(new Date(), 'EEE, dd MMM');

  useEffect(() => {
    //useEffect here
    //the subscription is the Firestore listener.
    // The cleanup function (unsub) is crucial because it tells Firestore to stop listening when the component is removed. Without it, the subscription remains active unnecessarily.
    const unsub = onSnapshot(collection(DB, 'TODO'), (snapshot) => {
      // onSnapshot sets up a real-time listener, so any changes to the 'TODO' collection will trigger the callback.
      const data: TaskGroup[] = snapshot.docs //In the callback, snapshot.docs is an array of all the documents in the 'TODO' collection. They're mapping over each doc.
        .map((doc) => {
          const parsed = TaskGroupSchema.safeParse(doc.data()); //Safe parse is probably from Zod, which validates the data structure
          if (!parsed.success) {
            console.error(`Invalid taskGroup in Firestore:`, parsed.error);
            return null;
          }
          return { id: doc.id, ...parsed.data };
        })
        .filter((g): g is TaskGroup => g !== null); // type guard

      setGroups(data); //state is updated
    });

    return () => unsub();
  }, []); //The empty array [] ensures your Firestore listener is set up once (on mount) and cleaned up once (on unmount), making it perfect for persistent real-time subscriptions.
  // React component "mounts," refers to the moment it's first rendered and added to the DOM. This is a key lifecycle moment in React, and it's when the component becomes visible in the UI.

  const toggleTask = async (groupId: string, taskId: string) => {
    //Since it's an async function, it awaits the Firestore update.
    const groupRef = doc(DB, 'TODO', groupId);
    const group = groups.find((g) => g.id === groupId);

    // Safeguard
    if (!group) {
      console.error(`Group not found for ID: ${groupId}`);
      return;
    }

    const updatedTasks = group.tasks.map(
      (task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task, //We use the spread operator { ...task } to create a new object rather than modifying the original task directly
    );

    await updateDoc(groupRef, { tasks: updatedTasks });
  };

  return (
    <div className="h-screen w-64 overflow-y-auto bg-black p-4 text-white">
      <h1 className="mb-4 text-xl font-bold">
        Todos <CheckCheck />
      </h1>
      <div className="flex items-center gap-2">
        <AddTaskDialog
          groups={groups}
          onSubmit={async ({ title, description, dueDate, groupId }) => {
            // Call Firebase add logic here
            const groupRef = doc(DB, 'taskGroups', groupId);
            const newTask = {
              id: crypto.randomUUID(),
              title,
              description,
              dueDate,
              completed: false,
            };
            await updateDoc(groupRef, {
              tasks: arrayUnion(newTask),
            });
          }}
        />
        <button
          onClick={handleLogOut}
          className="flex cursor-pointer items-center gap-2"
        >
          <LogOut size={'20'} />
          Logout
        </button>
      </div>

      {/* EXTRA SECTION: Date + Add Task */}
      <div className="border-t border-gray-700 pt-4">
        <div className="mb-1 text-xs text-gray-400">Today</div>
        <div className="mb-3 text-sm font-medium">{today}</div>
      </div>

      {groups.map((group) => (
        <div
          key={group.id}
          className="mb-6 rounded-md bg-[#242424] text-slate-300"
        >
          <p className="text-md mb-2 px-2 text-fuchsia-300">{group.name}</p>
          <ul className="space-y-2 px-2 py-2">
            {group.tasks.map((task, i) => (
              <li key={i} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(group.id, task.id)}
                  className="h-4 w-4 appearance-none rounded-sm bg-gray-700 checked:border-transparent checked:bg-green-500 focus:outline-none"
                />
                <span className={task.completed ? 'text-gray-500' : ''}>
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
