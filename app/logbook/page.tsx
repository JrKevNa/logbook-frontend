import TotalBadgeAndTable from "./TotalBadgeAndTable";

export default function Home() {
    // const [totalMinutes, setTotalMinutes] = useState(0);

    // const days = Math.floor(totalMinutes / (60 * 24));
    // const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    // const minutes = totalMinutes % 60;

    // const formatted = `${days}d ${hours}h ${minutes}m`;

    return (
        <div className="p-6">
            {/* <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold mb-4">My Logbook</h1>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-md">
                    {formatted}
                </span>
            </div>
            <LogbookTable onTotalDuration={setTotalMinutes}/> */}
            <TotalBadgeAndTable />
        </div>
    )
}