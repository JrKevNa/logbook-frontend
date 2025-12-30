'use client'

import { Alert, Card, Datepicker, Label, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import EntitySelector from "../components/EntitySelector";
import { HiInformationCircle } from "react-icons/hi";

export function DailyReportSection() {

    interface LogEntry {
        id: string;
        logDate: string;
        durationNumber: number;
        durationUnit: string;
        activity: string;
        createdBy: {
            id: string;
            username: string;
            email: string;
        };
    }

    interface DayGroup {
        date: string;
        entries: LogEntry[];
    }

    interface Props {
        groupedLogs: DayGroup[];
    }

    const getMonthStart = () => {
        const now = new Date();
        return new Date();
    };

    const getMonthEnd = () => {
        const now = new Date();
        return new Date(); // last day of month
    };

    const [startDate, setStartDate] = useState<Date | null>(getMonthStart());
    const [endDate, setEndDate] = useState<Date | null>(getMonthEnd());
    const [users, setUsers] = useState([]);
    // const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState('')
    
    const [loading, setLoading] = useState(true);

    const [groupedLogs, setGroupedLogs] = useState<any[]>([]);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/users/all`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Failed to fetch users');

                const data = await res.json();
                console.log("raw data:", data);

                setUsers(data);
            } catch (err) {
                console.error('Error fetching users:', err);
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, []);

    useEffect(() => {
        if (!startDate || !endDate) return;

        const fetchGroupedLogs = async () => {
            try {
                const query = new URLSearchParams({
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                });

                if (selectedUser) {
                    query.set('userId', selectedUser);
                }

                console.log(`${process.env.NEXT_PUBLIC_API_URL}/logbook/daily?${query}`)
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/logbook/daily?${query}`);
                if (!res.ok) throw new Error('Failed to fetch grouped logs');

                const data = await res.json();
                setGroupedLogs(data);
                console.log('Grouped Datas:', data);
            } catch (err) {
                console.error('Error:', err);
            }
        };

        fetchGroupedLogs();
    }, [startDate, endDate, selectedUser]);

    if (loading) return <Spinner />;
    
    return (
        <div className="">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-full lg:w-2/6">
                    <div className="mb-2 block">
                        <Label htmlFor="logDate">Start Date</Label>
                    </div>
                    <Datepicker
                        labelTodayButton="Today"
                        labelClearButton="Clear"
                        value={startDate} 
                        onChange={(date) => setStartDate(date)}
                        required
                    />
                </div>
                <div className="w-full lg:w-2/6">
                    <div className="mb-2 block">
                        <Label htmlFor="logDate">End Date</Label>
                    </div>
                    <Datepicker
                        labelTodayButton="Today"
                        labelClearButton="Clear"
                        value={endDate} 
                        onChange={(date) => setEndDate(date)}
                        required
                    />
                </div>
                <div className="w-full lg:w-2/6">
                    <EntitySelector
                        label="User"
                        items={users}
                        displayKey="username"
                        onSelect={(item: any) => setSelectedUser(item.id)}
                    />
                </div>
            </div>

            <div className="flex gap-2 mb-3">
                <button
                    className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
                    onClick={() => {
                        const prevDay = new Date(startDate || new Date());
                        prevDay.setDate(prevDay.getDate() - 1);
                        setStartDate(prevDay);
                        setEndDate(prevDay);
                    }}
                >
                    Previous Day
                </button>
                <button
                    className="flex-1 bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
                    onClick={() => {
                        const nextDay = new Date(startDate || new Date());
                        nextDay.setDate(nextDay.getDate() + 1);
                        setStartDate(nextDay);
                        setEndDate(nextDay);
                    }}
                >
                    Next Day
                </button>
            </div>

            {groupedLogs.length === 0 ? (
                <Alert color="info" className="mb-3" icon={HiInformationCircle}>
                    <span className="font-medium">Info alert!</span> No data found
                </Alert>
            ) : (
                groupedLogs.map((day) => {
                    // calculate per-day total minutes
                    const dayTotalMinutes = day.entries.reduce((sum: any, entry: { durationUnit: string; durationNumber: number; }) => {
                        const minutes =
                            entry.durationUnit === "hours"
                                ? entry.durationNumber * 60
                                : entry.durationNumber;
                        return sum + minutes;
                    }, 0);

                    const d = Math.floor(dayTotalMinutes / (60 * 24));
                    const h = Math.floor((dayTotalMinutes % (60 * 24)) / 60);
                    const m = dayTotalMinutes % 60;

                    const perDayFormatted = `${d}d ${h}h ${m}m`;

                    return (
                        <Card key={day.date} className="mb-3">
                            {/* header with date + badge/alert */}
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold">
                                    {new Date(day.date).toLocaleDateString("en-GB")}
                                </h3>

                                <Alert color="gray" className="text-sm font-semibold py-1 px-3">
                                    {perDayFormatted}
                                </Alert>
                            </div>

                            <div className="space-y-2">
                                <Table striped>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeadCell>User</TableHeadCell>
                                            <TableHeadCell>Activity</TableHeadCell>
                                            <TableHeadCell>Duration</TableHeadCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody className="divide-y">
                                        {day.entries.map((entry: any) => (
                                            <TableRow
                                                key={entry.id}
                                                className="bg-white dark:border-gray-700 dark:bg-gray-800"
                                            >
                                                <TableCell>
                                                    {entry.createdBy ? entry.createdBy.username : 'Unknown'}
                                                </TableCell>
                                                <TableCell>{entry.activity}</TableCell>
                                                <TableCell>
                                                    {entry.durationNumber} {entry.durationUnit}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    );
                })
            )}
        </div>
    )
}