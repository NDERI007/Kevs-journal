import { useEffect, useState } from 'react';
import { DB } from '../config/firebase';
import {
  collection,
  updateDoc,
  doc,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import { type TaskGroup, TaskGroupSchema } from '../schema/todoSchema'; // Had to redefine the structure again because,
//  TypeScript has no way of knowing what structure your Firestore documents have.
import AddTaskDialog from './addTask';
import { CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

const Sidebar = () => {
  const [groups, setGroups] = useState<TaskGroup[]>([]);

  const today = format(new Date(), 'EEE, dd MMM');

  useEffect(() => {
    const unsub = onSnapshot(collection(DB, 'TODO'), (snapshot) => {
      const data: TaskGroup[] = snapshot.docs
        .map((doc) => {
          const parsed = TaskGroupSchema.safeParse(doc.data());
          if (!parsed.success) {
            console.error(`Invalid taskGroup in Firestore:`, parsed.error);
            return null;
          }
          return { id: doc.id, ...parsed.data };
        })
        .filter((g): g is TaskGroup => g !== null); // type guard

      setGroups(data);
    });

    return () => unsub();
  }, []);

  const toggleTask = async (groupId: string, taskId: string) => {
    const groupRef = doc(DB, 'TODO', groupId);
    const group = groups.find((g) => g.id === groupId);

    // Safeguard
    if (!group) {
      console.error(`Group not found for ID: ${groupId}`);
      return;
    }

    const updatedTasks = group.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );

    await updateDoc(groupRef, { tasks: updatedTasks });
  };

  return (
    <div className="h-screen w-64 overflow-y-auto bg-black p-4 text-white">
      <h1 className="mb-4 text-xl font-bold">
        Todos <CheckCheck />
      </h1>

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
    </div>
  );
};

export default Sidebar;
