import { useEffect, useState } from 'react';
import { DB } from '../config/firebase';
import { collection, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { type TaskGroup, TaskGroupSchema } from '../schema/todoSchema'; // Had to redefine the structure again because,
//  TypeScript has no way of knowing what structure your Firestore documents have.

const Sidebar = () => {
  const [groups, setGroups] = useState<TaskGroup[]>([]);
  const [newTasks, setNewTasks] = useState<Record<string, string>>({});

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

  const addTask = async ({ groupId }: { groupId: string }) => {
    const group = groups.find((g) => g.id === groupId);

    // Safeguard: If the group isn't found, exit early
    if (!group) {
      console.error(`No group found for ID: ${groupId}`);
      return;
    }

    const taskTitle = newTasks[groupId];

    // Safeguard: If there's no title, don't add an empty task
    if (!taskTitle || taskTitle.trim() === '') {
      console.warn(`Empty task title for group ${groupId}`);
      return;
    }

    const updatedTasks = [
      ...group.tasks,
      { title: taskTitle.trim(), completed: false },
    ];

    try {
      const groupRef = doc(DB, 'TODO', groupId);
      await updateDoc(groupRef, { tasks: updatedTasks });

      // Clear the input for that group
      setNewTasks((prev) => ({ ...prev, [groupId]: '' }));
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const toggleTask = async (
    { groupId }: { groupId: string },
    { taskIndex }: { taskIndex: number },
  ) => {
    const groupRef = doc(DB, 'TODO', groupId);
    const group = groups.find((g) => g.id === groupId);
    // Safeguard: If the group isn't found, exit early
    if (!group) {
      console.error(`No group found for ID: ${groupId}`);
      return;
    }
    const updatedTasks = group.tasks.map((task, i) =>
      i === taskIndex ? { ...task, completed: !task.completed } : task,
    );
    await updateDoc(groupRef, { tasks: updatedTasks });
  };

  return (
    <div className="h-screen w-64 overflow-y-auto bg-black p-4 text-white">
      <h1 className="mb-4 text-xl font-bold">Todos</h1>

      {groups.map((group) => (
        <div key={group.id} className="mb-6">
          <p className="text-md mb-2 text-fuchsia-300">{group.name}</p>
          <ul className="space-y-2">
            {group.tasks.map((task, i) => (
              <li key={i} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() =>
                    toggleTask({ groupId: group.id }, { taskIndex: i })
                  }
                  className="h-4 w-4 appearance-none rounded-sm bg-gray-700 checked:border-transparent checked:bg-green-500 focus:outline-none"
                />
                <span className={task.completed ? 'text-gray-500' : ''}>
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-2">
            <input
              className="w-full rounded bg-gray-800 px-2 py-1 text-sm"
              placeholder="Add task..."
              value={newTasks[group.id] || ''}
              onChange={(e) =>
                setNewTasks({ ...newTasks, [group.id]: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') addTask({ groupId: group.id });
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
