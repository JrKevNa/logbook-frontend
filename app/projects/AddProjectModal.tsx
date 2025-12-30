'use client'

import { useEffect, useState } from "react";
import { User } from "../types/user";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { Button, Datepicker, Label, Modal, ModalBody, ModalFooter, ModalHeader, Select, Spinner, Textarea, TextInput } from "flowbite-react";
import EntitySelector from "../components/EntitySelector";
import { getCookie } from "../utils/getCookie";
import toast from "react-hot-toast";

type AddProjectModalProps = {
    isOpen: boolean;
    onClose: () => void;
    mode: string;
    project?: any; // or your specific Logbook type if defined
    onProjectChange: () => void;
};

export default function AddProjectModal({
    isOpen,
    onClose,
    mode,
    project,
    onProjectChange,
}: AddProjectModalProps) {

    const [title, setTitle] = useState('')

    const [loading, setLoading] = useState(true)
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const [id, setId] = useState('')
    const [name, setName] = useState('')
    // const [logDate, setLogDate] = useState<Date | undefined>(undefined);
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date());

    const [users, setUsers] = useState<User[]>([]);
    const [selectedWorkedBy, setSelectedWorkedBy] = useState<User | null>(null);
    const [requestedBy, setRequestedBy] = useState('')

    function parseDateWithDefaultTime(dateStr: string | Date | null): Date | null {
        if (!dateStr) return null;
        if (dateStr instanceof Date) return dateStr;

        // If the string has no "T", append midnight
        return dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00');
    }

    // const formatDate = (date: Date) => {
    //     const y = date.getFullYear();
    //     const m = String(date.getMonth() + 1).padStart(2, '0');
    //     const d = String(date.getDate()).padStart(2, '0');
    //     return `${y}-${m}-${d}`;
    // };

    const formatDate = (date: Date | null) => {
        if (!date) return null;

        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    useEffect(() => {
        setLoading(true)

        if (isOpen) {
            if (mode === 'add') {
                setTitle('Add')
                setName('')
                setStartDate(new Date())
                setEndDate(new Date())
                setSelectedWorkedBy(null)
                setRequestedBy('')
            } else if (mode === 'edit' && project) {
                setTitle('Edit')
                setId(project.id)
                setName(project.name)
                setStartDate(parseDateWithDefaultTime(project.startDate))
                setEndDate(parseDateWithDefaultTime(project.endDate))
                setSelectedWorkedBy(project.workedBy)
                setRequestedBy(project.requestedBy)
                // Optionally load data to edit
            } else if (mode === 'finish' && project) {
                setTitle('Finishing')
                setId(project.id)
                setName(project.name)
                setStartDate(parseDateWithDefaultTime(project.startDate))
                setEndDate(parseDateWithDefaultTime(project.endDate))
                setSelectedWorkedBy(project.workedBy)
                setRequestedBy(project.requestedBy)
                // Optionally load data to edit
            }
            setLoading(false)
        }
    }, [isOpen, mode]) // ✅ Run when isOpen or mode changes

    // When roles or user change, find the matching role object from roles
    useEffect(() => {
        if (mode === 'edit' && project && users.length > 0) {
            const workedBy = project.workedBy;
            
            setSelectedWorkedBy(workedBy);
        }
    }, [users, project, mode]);

    useEffect(() => {
        const loadRoles= async () => {
            try {
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/users/all`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Failed to fetch users');

                const data = await res.json();
                // console.log("raw data:", data);

                setUsers(data);
            } catch (err) {
                console.error('Error fetching users:', err);
            } finally {
                setLoading(false);
            }
        };

        loadRoles();
    }, []);

    if (!isOpen) return null

    const validateForm = () => {
        return name && startDate && endDate && selectedWorkedBy && requestedBy;
    };

    const resetForm = () => {
        setName('');
        setStartDate(null);
        setEndDate(null);
        setSelectedWorkedBy(null);
        setRequestedBy('');
    };

    const createProject = (csrfToken: string | null) => {
        const workedById = selectedWorkedBy!.id;
        return fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': csrfToken || ''
            },
            credentials: 'include',
            body: JSON.stringify({
                name,
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
                workedById,
                requestedBy,
            }),
        });
    };

    const updateProject = (csrfToken: string | null) => {
        const workedById = selectedWorkedBy!.id;
        return fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': csrfToken || ''
            },
            credentials: 'include',
            body: JSON.stringify({
                name,
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
                workedById,
                requestedBy,
            }),
        });
    };

    const finishProject = (csrfToken: string | null) => {
        const workedById = selectedWorkedBy!.id;
        return fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/projects/finish/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': csrfToken || ''
            },
            credentials: 'include',
            body: JSON.stringify({
                name,
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
                workedById,
                requestedBy,
            }),
        });
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if (!validateForm()) return alert("Please fill in all fields");
        setLoadingSubmit(true);

        try {
            const csrfToken = getCookie("csrfToken");

            let res;
                if (mode === "add") res = await createProject(csrfToken);
                else if (mode === "edit") res = await updateProject(csrfToken);
                else if (mode === "finish") res = await finishProject(csrfToken);

            if (!res || !res.ok) {
                const data = await res?.json().catch(() => ({}));
                return alert(data?.message || "Error");
            }

            toast.success(`Project ${mode === "add" ? "Created" : mode === "edit" ? "Updated" : "Finished"}`);

            resetForm();
            onClose();
            onProjectChange();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoadingSubmit(false);
        }
    };

    // const handleSubmit = async (e: { preventDefault: () => void; }) => {
    //     if (mode === 'add') {
    //         e.preventDefault()

    //         if (!name || !startDate || !endDate || !selectedWorkedBy || !requestedBy) {
    //             // console.log("username: ", username)
    //             // console.log("email: ", email)
    //             // console.log("role: ", selectedRole)
    //             return alert('Please fill in all fields')
    //         }

    //         try {
    //             setLoadingSubmit(true)

    //             const workedById = selectedWorkedBy!.id;

    //             const csrfToken = getCookie('csrfToken');
    //             const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
    //                 method: 'POST',
    //                 headers: { 
    //                     'Content-Type': 'application/json',
    //                     'x-csrf-token': csrfToken || ''
    //                 },
    //                 credentials: 'include',
    //                 body: JSON.stringify({ 
    //                     name, 
    //                     startDate: startDate?.toISOString().split('T')[0], // "YYYY-MM-DD"
    //                     endDate: endDate?.toISOString().split('T')[0],
    //                     workedById, 
    //                     requestedBy,
    //                 }),
    //             })

    //             if (!res.ok) {
    //                 // Try to read the error message from the response
    //                 const data = await res.json().catch(() => ({}))
    //                 const message = data.message || 'Failed to create user'
    //                 return alert(message) // show the error to user
    //             }
    //             setLoadingSubmit(false)

    //             toast.success("Project Created");
    //             // Success
    //             setName('')
    //             setStartDate(null)
    //             setEndDate(null)
    //             setSelectedWorkedBy(null)
    //             setRequestedBy('')
    //             onClose()
    //             onProjectChange()
    //         } catch (err: any) {
    //             // show error directly on client page
    //             setLoadingSubmit(false)
    //             toast.error(err.message);
    //         }
    //     }
    //     else if (mode === 'edit') {
    //         e.preventDefault()

    //         if (!name || !startDate || !endDate || !selectedWorkedBy || !requestedBy) {
    //             // console.log("username: ", username)
    //             // console.log("email: ", email)
    //             // console.log("role: ", selectedRole)
    //             return alert('Please fill in all fields')
    //         }

    //         try {
    //             setLoadingSubmit(true)

    //             const workedById = selectedWorkedBy!.id;

    //             const csrfToken = getCookie('csrfToken');
    //             const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
    //                 method: 'PATCH',
    //                 headers: { 
    //                     'Content-Type': 'application/json',
    //                     'x-csrf-token': csrfToken || ''
    //                 },
    //                 credentials: 'include',
    //                 body: JSON.stringify({ 
    //                     name, 
    //                     startDate: formatDate(startDate), // "YYYY-MM-DD"
    //                     endDate: formatDate(endDate),
    //                     workedById, 
    //                     requestedBy, 
    //                 }),
    //             })

    //             if (!res.ok) {
    //                 // Try to read the error message from the response
    //                 const data = await res.json().catch(() => ({}))
    //                 const message = data.message || 'Failed to update project'
    //                 return alert(message) // show the error to user
    //             }
    //             setLoadingSubmit(false)

    //             toast.success("Project Updated");
    //             // Success
    //             setName('')
    //             setStartDate(null)
    //             setEndDate(null)
    //             setSelectedWorkedBy(null)
    //             setRequestedBy('')
    //             onClose()
    //             onProjectChange()
    //         } catch (err: any) {
    //             // show error directly on client page
    //             setLoadingSubmit(false)
    //             toast.error(err.message);
    //         }
    //     } else if (mode === 'finish') {
    //         e.preventDefault()

    //         if (!name || !startDate || !endDate || !selectedWorkedBy || !requestedBy ) {
    //             // console.log("username: ", username)
    //             // console.log("email: ", email)
    //             // console.log("role: ", selectedRole)
    //             return alert('Please fill in all fields')
    //         }

    //         try {
    //             setLoadingSubmit(true)

    //             const csrfToken = getCookie('csrfToken');
    //             const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/projects/finish/${id}`, {
    //                 method: 'PATCH',
    //                 headers: { 
    //                     'Content-Type': 'application/json',
    //                     'x-csrf-token': csrfToken || ''
    //                 },
    //                 credentials: 'include',
    //                 body: JSON.stringify({ 
    //                     name, 
    //                 }),
    //             })

    //             if (!res.ok) {
    //                 // Try to read the error message from the response
    //                 const data = await res.json().catch(() => ({}))
    //                 const message = data.message || 'Failed to finish project'
    //                 return alert(message) // show the error to user
    //             }
    //             setLoadingSubmit(false)

    //             toast.success("Project Finished");
    //             // Success
    //             setName('')
    //             setStartDate(null)
    //             setEndDate(null)
    //             setSelectedWorkedBy(null)
    //             setRequestedBy('')
    //             onClose()
    //             onProjectChange()
    //         } catch (err: any) {
    //             // show error directly on client page
    //             setLoadingSubmit(false)
    //             toast.error(err.message);
    //         }
    //     }
    // }

    return (
        <Modal show={isOpen} onClose={onClose}>
            <ModalHeader>{title}</ModalHeader>
            <ModalBody>
                {loading ? (
                    <Spinner aria-label="Loading projects..." />
                ) : (
                    <form className="flex flex-col gap-4 w-full">
                        <div className="space-y-6">

                            {/* Name */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="durationNumber">Program Name</Label>
                                </div>
                                <TextInput
                                    id="durationNumber"
                                    type="text"
                                    placeholder="Enter the program name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Worked By */}
                            <div>
                                {/* <TextInput
                                    id="activity"
                                    type="text"
                                    placeholder="Describe activity"
                                    value={activity}
                                    onChange={(e) => setActivity(e.target.value)}
                                    required
                                    
                                /> */}
                                <EntitySelector
                                    label="Worked By"
                                    items={users}
                                    displayKey="username"
                                    onSelect={(item: any) => setSelectedWorkedBy(item)}
                                    selectedItem={selectedWorkedBy}
                                />
                            </div>

                            {/* Requested By */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="requestedBy">Requested By</Label>
                                </div>
                                <TextInput
                                    id="requestedBy"
                                    type="text"
                                    placeholder="Who request it"
                                    value={requestedBy}
                                    onChange={(e) => setRequestedBy(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Start Date */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="logDate">Start Date</Label>
                                </div>
                                {/* <TextInput
                                    id="logDate"
                                    type="date"
                                    value={logDate}
                                    onChange={(e) => setLogDate(e.target.value)}
                                    required
                                /> */}
                                <Datepicker
                                    value={startDate}
                                    labelTodayButton="Today"
                                    labelClearButton="Clear"
                                    onChange={(date) => setStartDate(date)}
                                    required
                                />
                            </div>

                            {/* Start Date */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="logDate">End Date</Label>
                                </div>
                                {/* <TextInput
                                    id="logDate"
                                    type="date"
                                    value={logDate}
                                    onChange={(e) => setLogDate(e.target.value)}
                                    required
                                /> */}
                                <Datepicker
                                    value={endDate}
                                    labelTodayButton="Today"
                                    labelClearButton="Clear"
                                    onChange={(date) => setEndDate(date)}
                                    required
                                />
                            </div>
                        </div>
                    </form>
                )}
            </ModalBody>
            <ModalFooter>
                <Button onClick={handleSubmit}>
                    {loadingSubmit ? <Spinner aria-label="Spinner button example" size="md" light /> : 'Submit'}
                </Button>
                <Button color="red" onClick={onClose}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    )
}