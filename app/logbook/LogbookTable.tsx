'use client';

import { Badge, Button, ButtonGroup, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { HiAdjustments, HiCloudDownload, HiOutlinePencilAlt, HiOutlineSearch, HiTrash, HiUserCircle } from "react-icons/hi";
import { getCookie } from "../utils/getCookie";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import toast from 'react-hot-toast';
import { Logbook } from "../types/logbook";
import AddLogbookModal from "./AddLogbookModal";
import MyPagination from "../components/MyPagination";

interface LogbookTableProps {
    onTotalDuration?: (minutes: number) => void;
}

export function LogbookTable({ onTotalDuration }: LogbookTableProps) {
    const limit = 10;
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [loading, setLoading] = useState(true)

    const [logbooks, setLogbooks] = useState<Logbook[]>([]);
    
    const [openModal, setOpenModal] = useState(false)
    const [editLogbook, setEditLogbook] = useState(null);
    const [mode, setMode] = useState('')

    const totalMinutes = logbooks.reduce((sum, log) => {
        let minutes = 0;

        if (log.durationUnit === "hours") {
            minutes = log.durationNumber * 60;
        } else if (log.durationUnit === "minutes") {
            minutes = log.durationNumber;
        }

        return sum + minutes;
    }, 0);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    const formatted = `${days}d ${hours}h ${minutes}m`;  // Notify parent when logbooks change
    useEffect(() => {
        onTotalDuration?.(totalMinutes);
    }, [totalMinutes]);

    const fetchLogbooks = async () => {
        setLoading(true);

        const queryParams = new URLSearchParams({
            search: debouncedSearchTerm,
            page: page.toString(),
            limit: limit.toString(),
        });

        try {
            const csrfToken = getCookie('csrfToken');
            
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/logbook?${queryParams}`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken || ''
                },
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data?.message || data?.error || `HTTP error ${res.status}`);
                return;
            }

            setLogbooks(data.logbooks); // your logbook state variable
            setTotalPages(Math.max(1, data.totalPages));
            setLoading(false);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleAdd = () => {
        setEditLogbook(null)
        setMode('add')
        setOpenModal(true)
    }

    const handleEdit = (log: any) => {
        setEditLogbook(log)
        setMode('edit')
        setOpenModal(true)
    }

    const handleDelete= async (log: any) => {
        if (!window.confirm(`Are you sure you want to delete this log book "${log.activity}"?`)) {
            return; // cancel if inventoryUnit clicks Cancel
        }

        try {
            const csrfToken = getCookie('csrfToken');
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/logbook/${log.id}`, {
                method: 'DELETE',
                headers: { 
                    'x-csrf-token': csrfToken || ''
                },
                credentials: 'include',
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({})); // optional, in case response isn't JSON
                // throw new Error(data?.message || data?.error || `HTTP error ${res.status}`);

                toast.error(data?.message || data?.error || `HTTP error ${res.status}`);
                return;
            }

            // After deletion, refresh inventoryUnit list
            toast.success("Logbook Deleted");
            fetchLogbooks();
        } catch (err: any) {
            // show error directly on client page
            toast.error(err.message);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay

        return () => clearTimeout(timer); // Clear timer if user types again before 300ms
    }, [searchTerm]);

    useEffect(() => {
        setPage(1); // Reset to first page when search term changes
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchLogbooks();
    }, [debouncedSearchTerm, page]);

    return (
        <div className="">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-full lg:w-5/6">
                    <TextInput
                        icon={HiOutlineSearch}
                        placeholder="Search log book activity"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}
                    />
                </div>

                <div className="w-full lg:w-1/6">
                    <Button onClick={handleAdd} className='w-full'>Add Log book</Button>
                </div>
            </div>

            <Table striped>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Log Date</TableHeadCell>
                        <TableHeadCell>User</TableHeadCell>
                        <TableHeadCell>Activity</TableHeadCell>
                        <TableHeadCell>Duration</TableHeadCell>
                        <TableHeadCell>Action</TableHeadCell>
                    </TableRow>
                </TableHead>

                <TableBody className="divide-y">
                    {logbooks.map((log) => (
                        <TableRow
                            key={log.id}
                            className="bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                            <TableCell>
                                {new Date(log.logDate).toLocaleDateString("en-GB")}
                            </TableCell>
                            <TableCell>
                                {log.createdBy ? log.createdBy.username : 'Unknown'}
                            </TableCell>
                            <TableCell>
                                {log.activity}
                            </TableCell>
                            <TableCell>
                                {log.durationNumber} {log.durationUnit}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Button onClick={() => handleEdit(log)}>
                                        <HiOutlinePencilAlt className="h-4 w-4" />
                                    </Button>
                                    <Button color="red" onClick={() => handleDelete(log)}>
                                        <HiTrash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <MyPagination page={page} setPage={setPage} totalPages={totalPages} />

            <AddLogbookModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                mode={mode}
                logbook={editLogbook}
                onLogbookChange={fetchLogbooks}
            />
        </div>
    );
}
