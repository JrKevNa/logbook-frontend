import { DailyReportSection } from "./DailyReportSection";

export default function Home() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Daily Report</h1> 
            <DailyReportSection/>
        </div>
    )
}