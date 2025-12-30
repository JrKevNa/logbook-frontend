'use client'

import { Button, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlinePencilAlt, HiOutlineSearch, HiTrash } from "react-icons/hi";
import { User } from "../types/user";
import { getCookie } from "../utils/getCookie";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import MyPagination from "../components/MyPagination";
import AddUserModal from "./AddUserModal";

export function UserList() {
    const limit = 20;
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [loading, setLoading] = useState(true)
    
    const [users, setUsers] = useState<User[]>([]);

    const [openModal, setOpenModal] = useState(false)
    const [editUser, setUser] = useState(null);
    const [mode, setMode] = useState('')

    const handleAdd = () => {
        setUser(null)
        setMode('add')
        setOpenModal(true)
    }

    const handleEdit = (user: any) => {
        setUser(user)
        setMode('edit')
        setOpenModal(true)
    }

    const fetchUsers = async () => {
        setLoading(true);

        const queryParams = new URLSearchParams({
            search: debouncedSearchTerm,
            page: page.toString(),
            limit: limit.toString(),
        });

        try {
            const csrfToken = getCookie('csrfToken');
            
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/users?${queryParams}`, {
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

            console.log('the users', data.users)

            setUsers(data.users); // your logbook state variable
            setTotalPages(Math.max(1, data.totalPages));
            setLoading(false);
        } catch (err: any) {
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
        fetchUsers();
    }, [debouncedSearchTerm, page]);
    

    return (
        <div className="">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-full lg:w-5/6">
                    <TextInput
                        icon={HiOutlineSearch}
                        placeholder="Search user by name or email"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}
                    />
                </div>

                <div className="w-full lg:w-1/6">
                    <Button onClick={handleAdd} className='w-full'>Add New User</Button>
                </div>
            </div>

            <Table striped>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Username</TableHeadCell>
                        <TableHeadCell>NIK</TableHeadCell>
                        <TableHeadCell>Email</TableHeadCell>
                        <TableHeadCell>Role</TableHeadCell>
                        <TableHeadCell>Action</TableHeadCell>
                    </TableRow>
                </TableHead>

                <TableBody className="divide-y">
                    {users.map((user) => (
                        <TableRow
                            key={user.id}
                            className="bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                            <TableCell>
                                {user.username}
                            </TableCell>
                            <TableCell>
                                {user.nik}
                            </TableCell>
                            <TableCell>
                                {user.email}
                            </TableCell>
                            <TableCell>
                                {user.userRoles?.[0]?.role?.name}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Button color="green" onClick={() => handleEdit(user)}>
                                        <HiOutlinePencilAlt className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <MyPagination page={page} setPage={setPage} totalPages={totalPages} />

            <AddUserModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                mode={mode}
                user={editUser}
                onUserChange={fetchUsers}
            />
        </div>
    )
}