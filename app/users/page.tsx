import { UserList } from "./UserList";

export default function Home() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Users</h1> 
            <UserList/>
        </div>
    )
}