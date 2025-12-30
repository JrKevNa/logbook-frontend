'use client'

import { useState } from "react";
import { LogbookTable } from "./LogbookTable";
import { Alert, Badge } from "flowbite-react";

export default function TotalBadgeAndTable() {
    const [totalMinutes, setTotalMinutes] = useState(0);

    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    const formatted = `${days}d ${hours}h ${minutes}m`;

    return (
        <>
            <div className="flex items-center justify-between gap-3 mb-4">
                <h1 className="text-2xl font-bold">My Logbook</h1>
                <Alert color="gray" className="text-lg font-bold">
                    Total duration in this page: {formatted}
                </Alert>
            </div>

            <LogbookTable onTotalDuration={setTotalMinutes} />
        </>
    );
}