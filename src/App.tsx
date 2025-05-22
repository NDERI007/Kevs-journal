import './index.css';
import { useEffect, useState } from 'react';
import { DB } from './config/firebase.ts';
import { getDocs, collection } from 'firebase/firestore';
import { TodoSchema, type Todo } from './schema/todoSchema.ts'; // Had to redefine the structure again because,
//  TypeScript has no way of knowing what structure your Firestore documents have.

function App() {
  const [todoList, setTodoList] = useState<Todo[]>([]); // <-- This fixes the type error

  const todoListcollectionref = collection(DB, 'TODO');
  useEffect(() => {
    const getTodoList = async () => {
      //READ THE DATA
      //SET TODOLIST STATE TO BE EQUAL TO THAT DATA
      try {
        const data = await getDocs(todoListcollectionref);
        const filteredData: Todo[] = [];

        data.docs.forEach((doc) => {
          const rawData = { ...doc.data(), id: doc.id };
          const parseResult = TodoSchema.safeParse(rawData);
          if (parseResult.success) {
            filteredData.push(parseResult.data);
          } else {
            console.warn('Invalid todo document:', parseResult.error);
          }
        });

        setTodoList(filteredData);
        console.log(filteredData);
      } catch (error) {
        console.error(error);
      }
    };
    getTodoList();
  }, []);
  return (
    <>
      <div>
        {todoList.map((todo) => (
          <div key={todo.id}>
            <h3>{todo.Title}</h3>
            <p>{todo.Description}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
