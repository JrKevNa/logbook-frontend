'use client';

import { useEffect, useState } from "react";
import { Project } from "../types/project";
import { getCookie } from "../utils/getCookie";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import toast from "react-hot-toast";
import { Button, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput } from "flowbite-react";
import { HiCheck, HiCheckCircle, HiOutlineBookOpen, HiOutlinePencilAlt, HiOutlineSearch, HiTrash, HiXCircle } from "react-icons/hi";
import MyPagination from "../components/MyPagination";
import AddProjectModal from "./AddProjectModal";
import { useRouter } from 'next/navigation';

export function ProjectTable() {
    const router = useRouter();
    const limit = 20;
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [loading, setLoading] = useState(true)

    const [projects, setProjects] = useState<Project[]>([]);
    
    const [openModal, setOpenModal] = useState(false)
    const [editProject, setEditProject] = useState(null);
    const [mode, setMode] = useState('')

    const fetchProjects = async () => {
        setLoading(true);

        const queryParams = new URLSearchParams({
            search: debouncedSearchTerm,
            page: page.toString(),
            limit: limit.toString(),
        });

        try {
            const csrfToken = getCookie('csrfToken');
            
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/projects?${queryParams}`, {
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

            setProjects(data.projects); // your logbook state variable
            setTotalPages(Math.max(1, data.totalPages));
            setLoading(false);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleAdd = () => {
        setEditProject(null)
        setMode('add')
        setOpenModal(true)
    }

    const handleRedirect = (projectId: string) => {
        router.push(`/detail-project/${projectId}`);
    };
    
    const handleEdit = (project: any) => {
        setEditProject(project)
        setMode('edit')
        setOpenModal(true)
    }

    const handleFinished = (project: any) => {
        setEditProject(project)
        setMode('finish')
        setOpenModal(true)
    }

    const handleDelete= async (project: any) => {
        if (!window.confirm(`Are you sure you want to delete this project "${project.name}"?`)) {
            return; // cancel if inventoryUnit clicks Cancel
        }

        try {
            const csrfToken = getCookie('csrfToken');
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/projects/${project.id}`, {
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
            toast.success("Project Deleted");
            fetchProjects();
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
        fetchProjects();
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
                    <Button onClick={handleAdd} className='w-full'>Add Projects</Button>
                </div>
            </div>

            <Table striped>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Is Done</TableHeadCell>
                        <TableHeadCell>Name</TableHeadCell>
                        <TableHeadCell>Start Date</TableHeadCell>
                        <TableHeadCell>End Date</TableHeadCell>
                        <TableHeadCell>Worked By</TableHeadCell>
                        <TableHeadCell>Requested By</TableHeadCell>
                        <TableHeadCell>Action</TableHeadCell>
                    </TableRow>
                </TableHead>

                <TableBody className="divide-y">
                    {projects.map((project) => (
                        <TableRow
                            key={project.id}
                            className="bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                            <TableCell>
                                {project.isDone ? (
                                    <HiCheckCircle className="text-green-500 h-5 w-5" />
                                ) : (
                                    <HiXCircle className="text-red-500 h-5 w-5" />
                                )}
                            </TableCell>
                            <TableCell>
                                {project.name}
                            </TableCell>
                            <TableCell>
                                {new Date(project.startDate).toLocaleDateString("en-GB")}
                            </TableCell>
                            <TableCell>
                                {new Date(project.endDate).toLocaleDateString("en-GB")}
                            </TableCell>
                            <TableCell>
                                {project.workedBy?.username}
                            </TableCell>
                            <TableCell>
                                {project.requestedBy}
                            </TableCell>
                            <TableCell>
                                {project.isDone ? (
                                    <div className="flex items-center gap-2">
                                        <Button onClick={() => handleEdit(project)}>
                                            <HiOutlinePencilAlt className="h-4 w-4" />
                                        </Button>
                                        <Button color="red" onClick={() => handleDelete(project)}>
                                            <HiTrash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Button color="green" onClick={() => handleFinished(project)}>
                                            <HiCheck className="h-4 w-4" />
                                        </Button>
                                        <Button color="dark" onClick={() => handleRedirect(project.id)}>
                                            <HiOutlineBookOpen className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={() => handleEdit(project)}>
                                            <HiOutlinePencilAlt className="h-4 w-4" />
                                        </Button>
                                        <Button color="red" onClick={() => handleDelete(project)}>
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

            <AddProjectModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                mode={mode}
                project={editProject}
                onProjectChange={fetchProjects}
            />
        </div>
    );
}