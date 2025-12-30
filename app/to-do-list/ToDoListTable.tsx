"use client";

import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeadCell,
    TableRow,
    TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import {
    HiCheck,
    HiCheckCircle,
    HiOutlinePencilAlt,
    HiOutlineSearch,
    HiTrash,
    HiXCircle,
} from "react-icons/hi";
import { getCookie } from "../utils/getCookie";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import toast from "react-hot-toast";
import { ToDoList } from "../types/to-do-list";
import MyPagination from "../components/MyPagination";
import AddToDoModal from "./AddToDoModal";

export function ToDoListTable() {
    const limit = 20;
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const [toDoList, setToDoList] = useState<ToDoList[]>([]);

    const [openModal, setOpenModal] = useState(false);
    const [editToDo, setEditToDo] = useState(null);
    const [mode, setMode] = useState("");

    const fetchToDoList = async () => {
        setLoading(true);

        const queryParams = new URLSearchParams({
            search: debouncedSearchTerm,
            page: page.toString(),
            limit: limit.toString(),
        });

        try {
            const csrfToken = getCookie("csrfToken");

            const res = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/to-do-list?${queryParams}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "x-csrf-token": csrfToken || "",
                    },
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(
                    data?.message || data?.error || `HTTP error ${res.status}`
                );
                return;
            }

            setToDoList(data.toDoList); // your logbook state variable
            setTotalPages(Math.max(1, data.totalPages));
            setLoading(false);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleAdd = () => {
        setEditToDo(null);
        setMode("add");
        setOpenModal(true);
    };

    const handleEdit = (toDo: any) => {
        setEditToDo(toDo);
        setMode("edit");
        setOpenModal(true);
    };

    const handleFinished = (toDo: any) => {
        setEditToDo(toDo);
        setMode("finish");
        setOpenModal(true);
    };

    const handleDelete = async (toDo: any) => {
        if (
            !window.confirm(
                `Are you sure you want to delete this to do "${toDo.activity}"?`
            )
        ) {
            return; // cancel if inventoryUnit clicks Cancel
        }

        try {
            const csrfToken = getCookie("csrfToken");
            const res = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/to-do-list/${toDo.id}`,
                {
                    method: "DELETE",
                    headers: {
                        "x-csrf-token": csrfToken || "",
                    },
                    credentials: "include",
                }
            );

            if (!res.ok) {
                const data = await res.json().catch(() => ({})); // optional, in case response isn't JSON
                // throw new Error(data?.message || data?.error || `HTTP error ${res.status}`);

                toast.error(
                    data?.message || data?.error || `HTTP error ${res.status}`
                );
                return;
            }

            // After deletion, refresh inventoryUnit list
            toast.success("To Do Deleted");
            fetchToDoList();
        } catch (err: any) {
            // show error directly on client page
            toast.error(err.message);
        }
    };

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
        fetchToDoList();
    }, [debouncedSearchTerm, page]);

    return (
        <div className="">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-full lg:w-5/6">
                    <TextInput
                        icon={HiOutlineSearch}
                        placeholder="Search to do activity"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}
                    />
                </div>

                <div className="w-full lg:w-1/6">
                    <Button onClick={handleAdd} className="w-full">
                        Add Log book
                    </Button>
                </div>
            </div>

            <Table striped>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Is Done</TableHeadCell>
                        <TableHeadCell>Created Date</TableHeadCell>
                        <TableHeadCell>Activity</TableHeadCell>
                        <TableHeadCell>Action</TableHeadCell>
                    </TableRow>
                </TableHead>

                <TableBody className="divide-y">
                    {toDoList.map((toDo) => (
                        <TableRow
                            key={toDo.id}
                            className="bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                            <TableCell>
                                {toDo.isDone ? (
                                    <HiCheckCircle className="text-green-500 h-5 w-5" />
                                ) : (
                                    <HiXCircle className="text-red-500 h-5 w-5" />
                                )}
                            </TableCell>
                            <TableCell>
                                {new Date(toDo.createDate).toLocaleDateString(
                                    "en-GB"
                                )}
                            </TableCell>
                            <TableCell>{toDo.activity}</TableCell>
                            <TableCell>
                                {toDo.isDone ? (
                                    <span className="text-green-600 font-semibold">Done</span>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Button color="green" onClick={() => handleFinished(toDo)}>
                                            <HiCheck className="h-4 w-4" />
                                        </Button>

                                        <Button onClick={() => handleEdit(toDo)}>
                                            <HiOutlinePencilAlt className="h-4 w-4" />
                                        </Button>

                                        <Button color="red" onClick={() => handleDelete(toDo)}>
                                            <HiTrash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <MyPagination
                page={page}
                setPage={setPage}
                totalPages={totalPages}
            />

            <AddToDoModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                mode={mode}
                toDo={editToDo}
                onToDoChange={fetchToDoList}
            />
        </div>
    );
}
