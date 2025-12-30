'use client'

import MyPagination from "@/app/components/MyPagination";
import { DetailProject } from "@/app/types/detail-project";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import { getCookie } from "@/app/utils/getCookie";
import { Button, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput } from "flowbite-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiCheck, HiCheckCircle, HiOutlineBookOpen, HiOutlinePencilAlt, HiOutlineSearch, HiTrash, HiXCircle } from "react-icons/hi";
import AddDetailProjectModal from "./AddDetailPorjectModal";

export function DetailProjectTable() {
    const { id } = useParams()
    const [project, setProject] = useState<any>(null);

    const limit = 20;
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [loading, setLoading] = useState(true)

    const [detailProjects, setDetailProjects] = useState<DetailProject[]>([]);

    const [openModal, setOpenModal] = useState(false)
    const [editDetailProject, setEditDetailProject] = useState(null);
    const [mode, setMode] = useState('')

    const fetchDetailProjects = async () => {
        setLoading(true);

        const queryParams = new URLSearchParams({
            search: debouncedSearchTerm,
            page: page.toString(),
            limit: limit.toString(),
        });

        try {
            const csrfToken = getCookie('csrfToken');
            
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/detail-projects/${project.id}?${queryParams}`, {
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

            setDetailProjects(data.detailProjects); // your logbook state variable
            setTotalPages(Math.max(1, data.totalPages));
            setLoading(false);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleAdd = () => {
        setEditDetailProject(null)
        setMode('add')
        setOpenModal(true)
    }

    const handleEdit = (detailProject: any) => {
        setEditDetailProject(detailProject)
        setMode('edit')
        setOpenModal(true)
    }

    function handleFinished(detailProject: any): void {
        setEditDetailProject(detailProject)
        setMode('finish')
        setOpenModal(true)
    }

    const handleDelete = async (detailProject: any) => {
        if (!window.confirm(`Are you sure you want to delete this detail project "${detailProject.activity}"?`)) {
            return; // cancel if inventoryUnit clicks Cancel
        }

        try {
            const csrfToken = getCookie('csrfToken');
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/detail-projects/${detailProject.id}`, {
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
            toast.success("Detail Project Deleted");
            fetchDetailProjects();
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
        if (!project) return;   
        fetchDetailProjects();
    }, [project, debouncedSearchTerm, page]);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`
                );

                if (!res.ok) throw new Error("Failed to fetch project");

                setProject(await res.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!project) return <div>Project not found</div>;

    return (
        <div className="">
            <h1 className="text-2xl font-bold mb-4">{project.name}</h1>
            
            <div className="flex items-center gap-2 mb-3">
                <div className="w-full lg:w-5/6">
                    <TextInput
                        icon={HiOutlineSearch}
                        placeholder="Search detail project activity"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}
                    />
                </div>

                <div className="w-full lg:w-1/6">
                    <Button onClick={handleAdd} className='w-full'>Add Detail Project</Button>
                </div>
            </div>

            <Table striped>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Is Done</TableHeadCell>
                        <TableHeadCell>Request Date</TableHeadCell>
                        <TableHeadCell>Activity</TableHeadCell>
                        <TableHeadCell>Requested By</TableHeadCell>
                        <TableHeadCell>Worked By</TableHeadCell>
                        <TableHeadCell>Action</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody className="divide-y">
                    {detailProjects.map((detailProject) => (
                        <TableRow
                            key={detailProject.id}
                            className="bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                            <TableCell>
                                {detailProject.isDone ? (
                                    <HiCheckCircle className="text-green-500 h-5 w-5" />
                                ) : (
                                    <HiXCircle className="text-red-500 h-5 w-5" />
                                )}
                            </TableCell>
                            <TableCell>
                                {new Date(detailProject.requestDate).toLocaleDateString("en-GB")}
                            </TableCell>
                            <TableCell>
                                {detailProject.activity}
                            </TableCell>
                            <TableCell>
                                {detailProject.requestedBy}
                            </TableCell>
                            <TableCell>
                                {detailProject.workedBy?.username}
                            </TableCell>
                            <TableCell>
                                {detailProject.isDone ? (
                                    <div className="flex items-center gap-2">
                                        <Button onClick={() => handleEdit(detailProject)}>
                                            <HiOutlinePencilAlt className="h-4 w-4" />
                                        </Button>
                                        <Button color="red" onClick={() => handleDelete(detailProject)}>
                                            <HiTrash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Button color="green" onClick={() => handleFinished(detailProject)}>
                                            <HiCheck className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={() => handleEdit(detailProject)}>
                                            <HiOutlinePencilAlt className="h-4 w-4" />
                                        </Button>
                                        <Button color="red" onClick={() => handleDelete(detailProject)}>
                                            <HiTrash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <MyPagination page={page} setPage={setPage} totalPages={totalPages} />

            <AddDetailProjectModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                mode={mode}
                projectId={project.id}
                detailProject={editDetailProject}
                onDetailProjectChange={fetchDetailProjects}
            />
        </div>
    )
}