import { DetailProjectTable } from "./DetailProjectTable";

export default async function Home() {
    return (
        <div className="p-6">
            {/* <h1 className="text-2xl font-bold mb-4">{project.name}</h1> */}
            {/* Pass the id to the client component */}
            <DetailProjectTable />
        </div>
    );
}