import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import { db, auth } from "../firebase/FirebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import {
  addTask,
  editTask,
  removeTask,
  removeAllTasks,
  setEditing,
  loadTasks,
} from "../redux/todo/taskSlice.js";
import { onAuthStateChanged } from "firebase/auth";

function Home() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const dispatch = useDispatch();
  const { tasks, isEditing, editIndex } = useSelector((state) => state.tasks);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchTasks = async () => {
          const tasksCollectionRef = collection(db, "tasks");
          const q = query(tasksCollectionRef, where("userId", "==", user.uid));
          const data = await getDocs(q);
          const tasksList = data.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          dispatch(loadTasks(tasksList));
        };
        fetchTasks();
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const addOrEditTask = async () => {
    if (title.length >= 1 && desc.length >= 1) {
      if (isEditing) {
        const taskDoc = doc(db, "tasks", tasks[editIndex].id);
        await updateDoc(taskDoc, { title, desc });
        dispatch(
          editTask({
            index: editIndex,
            task: { title, desc, id: tasks[editIndex].id },
          })
        );
        dispatch(setEditing({ isEditing: false, editIndex: null }));
      } else {
        const tasksCollectionRef = collection(db, "tasks");
        const newTask = await addDoc(tasksCollectionRef, {
          title,
          desc,
          userId: auth.currentUser.uid, // Store the user ID with the task
        });
        const newTaskData = { title, desc, id: newTask.id };
        dispatch(addTask(newTaskData));
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
    const taskDoc = doc(db, "tasks", tasks[index].id);
    await deleteDoc(taskDoc);
    dispatch(removeTask(index));
  };

  const removeAllHandler = async () => {
    for (let task of tasks) {
      const taskDoc = doc(db, "tasks", task.id);
      await deleteDoc(taskDoc);
    }
    dispatch(removeAllTasks());
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <form
          className="flex flex-col sm:flex-row justify-between items-center bg-white shadow-md rounded-lg p-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="text"
            placeholder="Enter Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-grow bg-lime-300 border-2 border-black px-3 py-2 rounded-md mb-2 sm:mb-0 sm:mr-3"
          />

          <input
            type="text"
            placeholder="Enter Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="flex-grow bg-lime-300 border-2 border-black px-3 py-2 rounded-md mb-2 sm:mb-0 sm:mr-3"
          />

          <button
            className="bg-red-400 border-2 border-black px-4 py-2 rounded-md font-bold text-white"
            onClick={addOrEditTask}
          >
            {isEditing ? "Update" : "Add"}
          </button>
        </form>

        <ul className="mt-5 space-y-4">
          {tasks.length > 0 ? (
            tasks.map((item, index) => (
              <li
                key={index}
                className="bg-slate-300 p-4 rounded-lg shadow flex flex-col items-center"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 w-full">
                  <div className="flex-1 text-center mb-2 sm:mb-0 flex-shrink-0">
                    <div className="bg-white p-2 rounded-lg shadow-md overflow-x-auto whitespace-nowrap">
                      <h3 className="font-bold text-lg">{item.title}</h3>
                    </div>
                  </div>
                  <div className="flex-1 text-center flex-shrink-0">
                    <div className="bg-white p-2 rounded-lg shadow-md overflow-x-auto whitespace-nowrap">
                      <p className="text-gray-700">{item.desc}</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded-md"
                    onClick={() => editTaskHandler(index)}
                  >
                    Edit
                  </button>
                  {!isEditing && (
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded-md"
                      onClick={() => removeTaskHandler(index)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))
          ) : (
            <div className="text-center">No Task Available</div>
          )}
        </ul>

        {isEditing === false && tasks.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={removeAllHandler}
              className="bg-green-600 text-white px-4 py-2 rounded-md font-bold"
            >
              Remove All
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
