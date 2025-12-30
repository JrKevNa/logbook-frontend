import { ToDoListTable } from "./ToDoListTable";

export default function Home() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">To Do List</h1> 
            <ToDoListTable/>
        </div>
    )
}