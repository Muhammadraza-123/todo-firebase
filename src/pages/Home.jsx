import Navbar from "../components/Navbar";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../firebase/FirebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
} from "firebase/firestore";
import {
  addTask,
  editTask,
  removeTask,
  removeAllTasks,
  setEditing,
  loadTasks,
} from "../redux/todo/taskSlice.js";

function Home() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const dispatch = useDispatch();
  const { tasks, isEditing, editIndex } = useSelector((state) => state.tasks);

  useEffect(() => {
    const fetchTasks = async () => {
      const tasksCollection = query(collection(db, "tasks"));
      const taskSnapshot = await getDocs(tasksCollection);
      const tasksList = taskSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      dispatch(loadTasks(tasksList));
    };

    fetchTasks();
  }, [dispatch]);

  const addOrEditTask = async () => {
    if (title.length >= 1 && desc.length >= 1) {
      if (isEditing) {
        const taskDocRef = doc(db, "tasks", tasks[editIndex].id);
        await updateDoc(taskDocRef, { title, desc });

        const updatedTasks = tasks.map((task, index) =>
          index === editIndex ? { ...task, title, desc } : task
        );
        dispatch(editTask({ index: editIndex, task: { title, desc } }));
        dispatch(setEditing({ isEditing: false, editIndex: null }));
      } else {
        const docRef = await addDoc(collection(db, "tasks"), { title, desc });
        const newTask = { id: docRef.id, title, desc };
        dispatch(addTask(newTask));
      }
      setTitle("");
      setDesc("");
    }
  };

  const editTaskHandler = (index) => {
    const task = tasks[index];
    setTitle(task.title);
    setDesc(task.desc);
    dispatch(setEditing({ isEditing: true, editIndex: index }));
  };

  const removeTaskHandler = async (index) => {
    const taskDocRef = doc(db, "tasks", tasks[index].id);
    await deleteDoc(taskDocRef);

    const updatedTasks = tasks.filter((_, i) => i !== index);
    dispatch(removeTask(index));
  };

  const removeAllHandler = async () => {
    const tasksCollection = collection(db, "tasks");
    const taskSnapshot = await getDocs(tasksCollection);
    const deletePromises = taskSnapshot.docs.map((taskDoc) =>
      deleteDoc(taskDoc.ref)
    );
    await Promise.all(deletePromises);

    dispatch(removeAllTasks());
  };

  return (
    <>
      <div>
        <Navbar />
      </div>

      <form
        className="flex justify-evenly my-5"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="text"
          placeholder="Enter Title Here"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-lime-300 border-2 border-black px-3 py-3 mx-3"
        />

        <input
          type="text"
          placeholder="Enter Description Here"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="bg-lime-300 border-2 border-black px-3 py-3 mx-3"
        />

        <button
          className="bg-red-400 border-2 border-black px-3 py-3 rounded font-bold mx-3"
          onClick={addOrEditTask}
        >
          {isEditing ? "Update" : "Add"}
        </button>
      </form>

      <ul className="text-center bg-slate-300 my-5 w-full">
        {tasks.length > 0 ? (
          tasks.map((item, index) => (
            <li className="grid grid-cols-[5fr,1fr] gap-x-1 my-5" key={item.id}>
              <div className="grid grid-cols-[1fr,1fr,1fr] gap-x-3 w-full">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-20">
                    <span className="text-sm">({index + 1})</span>
                    <input type="checkbox" className="w-6 h-6" />
                  </div>
                  <div className="w-auto h-auto">
                    <select id="priority" className="text-sm p-1 w-full">
                      <option defaultValue>Choose priority</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="break-words w-full min-w-0">
                  <h2>{item.title}</h2>
                </div>

                <div className="break-words w-full min-w-0">
                  <h2>{item.desc}</h2>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="bg-white border-2 border-black px-1 mx-3 w-10 h-10 rounded"
                  onClick={() => editTaskHandler(index)}
                >
                  Edit
                </button>
                {isEditing === false && (
                  <button
                    className="bg-white border-2 border-black px-1 w-15 h-10 rounded mx-3"
                    onClick={() => removeTaskHandler(index)}
                  >
                    Delete
                  </button>
                )}
              </div>
              <hr />
            </li>
          ))
        ) : (
          <div>No Task Available</div>
        )}
      </ul>

      <div className="flex justify-center items-center h-full my-10">
        {isEditing === false && tasks.length > 0 && (
          <button
            onClick={removeAllHandler}
            className="bg-green-900 border-2 border-black px-3 py-3 rounded font-bold"
          >
            Remove all
          </button>
        )}
      </div>
    </>
  );
}

export default Home;
