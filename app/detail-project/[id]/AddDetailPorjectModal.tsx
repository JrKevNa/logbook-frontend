'use client'

import EntitySelector from "@/app/components/EntitySelector";
import { User } from "@/app/types/user";
import { fetchWithAuth } from "@/app/utils/fetchWithAuth";
import { getCookie } from "@/app/utils/getCookie";
import { Button, Datepicker, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, Textarea, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type AddDetailProjectModalProps = {
    isOpen: boolean;
    onClose: () => void;
    mode: string;
    projectId: string;
    detailProject?: any; // or your specific Logbook type if defined
    onDetailProjectChange: () => void;
};

export default function AddDetailProjectModal({
    isOpen,
    onClose,
    mode,
    projectId,
    detailProject,
    onDetailProjectChange,
}: AddDetailProjectModalProps) {
    const [title, setTitle] = useState('')

    const [loading, setLoading] = useState(true)
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const [id, setId] = useState('')
    const [activity, setActivity] = useState('')
    const [requestDate, setRequestDate] = useState<Date | null>(new Date());

    const [users, setUsers] = useState<User[]>([]);
    const [selectedWorkedBy, setSelectedWorkedBy] = useState<User | null>(null);
    const [requestedBy, setRequestedBy] = useState('')

    const [note, setNote] = useState('')

    function parseDateWithDefaultTime(dateStr: string | Date | null): Date | null {
        if (!dateStr) return null;
        if (dateStr instanceof Date) return dateStr;

        // If the string has no "T", append midnight
        return dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00');
    }

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
                setActivity('')
                setRequestDate(new Date())
                setSelectedWorkedBy(null)
                setRequestedBy('')
                setNote('')
            } else if (mode === 'edit' && detailProject) {
                setTitle('Edit')
                setId(detailProject.id)
                setActivity(detailProject.activity)
                setRequestDate(parseDateWithDefaultTime(detailProject.requestDate))
                setSelectedWorkedBy(detailProject.workedBy)
                setRequestedBy(detailProject.requestedBy)
                setNote(detailProject.note)
                // Optionally load data to edit

                console.log('detailProject: ', detailProject);
            } else if (mode === 'finish' && detailProject) {
                setTitle('Finishing')
                setId(detailProject.id)
                setActivity(detailProject.activity)
                setRequestDate(parseDateWithDefaultTime(detailProject.requestDate))
                setSelectedWorkedBy(detailProject.workedBy)
                setRequestedBy(detailProject.requestedBy)
                setNote(detailProject.note)
                // Optionally load data to edit
            }
            setLoading(false)
        }
    }, [isOpen, mode]) // ✅ Run when isOpen or mode changes

    useEffect(() => {
        if (mode === 'edit' && detailProject && users.length > 0) {
            const workedBy = detailProject.workedBy;
            
            setSelectedWorkedBy(workedBy);
        }
    }, [users, detailProject, mode]);

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
        return activity && requestDate && selectedWorkedBy && requestedBy;
    };

    const resetForm = () => {
        setActivity('');
        setRequestDate(null);
        setSelectedWorkedBy(null);
        setRequestedBy('');
        setNote('');
    };

    const createDetailProject = (csrfToken: string | null) => {
        const workedById = selectedWorkedBy!.id;
        return fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/detail-projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': csrfToken || ''
            },
            credentials: 'include',
            body: JSON.stringify({
                projectId,
                activity,
                requestDate: formatDate(requestDate),
                workedById,
                requestedBy,
                note,
            }),
        });
    };

    const updateDetailProject = (csrfToken: string | null) => {
        const workedById = selectedWorkedBy!.id;
        return fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/detail-projects/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': csrfToken || ''
            },
            credentials: 'include',
            body: JSON.stringify({
                projectId,
                activity,
                requestDate: formatDate(requestDate),
                workedById,
                requestedBy,
                note,
            }),
        });
    };

    const finishDetailProject = (csrfToken: string | null) => {
        const workedById = selectedWorkedBy!.id;
        return fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/detail-projects/finish/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': csrfToken || ''
            },
            credentials: 'include',
            body: JSON.stringify({
                projectId,
                activity,
                requestDate: formatDate(requestDate),
                workedById,
                requestedBy,
                note,
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
                if (mode === "add") res = await createDetailProject(csrfToken);
                else if (mode === "edit") res = await updateDetailProject(csrfToken);
                else if (mode === "finish") res = await finishDetailProject(csrfToken);

            if (!res || !res.ok) {
                const data = await res?.json().catch(() => ({}));
                return alert(data?.message || "Error");
            }

            toast.success(`Detail project ${mode === "add" ? "Created" : mode === "edit" ? "Updated" : "Finished"}`);

            resetForm();
            onClose();
            onDetailProjectChange();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <Modal show={isOpen} onClose={onClose}>
            <ModalHeader>{title}</ModalHeader>
            <ModalBody>
                {loading ? (
                    <Spinner aria-label="Loading projects..." />
                ) : (
                    <form className="flex flex-col gap-4 w-full">
                        <div className="space-y-6">

                            {/* Activity */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="durationNumber">Activity</Label>
                                </div>
                                <Textarea
                                    id="activity"
                                    placeholder="Describe your activity in detail..."
                                    rows={4}
                                    value={activity}
                                    onChange={(e) => setActivity(e.target.value)}
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

                            {/* Request Date */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="logDate">Request Date</Label>
                                </div>
                                {/* <TextInput
                                    id="logDate"
                                    type="date"
                                    value={logDate}
                                    onChange={(e) => setLogDate(e.target.value)}
                                    required
                                /> */}
                                <Datepicker
                                    value={requestDate}
                                    labelTodayButton="Today"
                                    labelClearButton="Clear"
                                    onChange={(date) => setRequestDate(date)}
                                    required
                                />
                            </div>

                            {/* Note */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="activity">Note</Label>
                                </div>
                                {/* <TextInput
                                    id="activity"
                                    type="text"
                                    placeholder="Describe activity"
                                    value={activity}
                                    onChange={(e) => setActivity(e.target.value)}
                                    required
                                    
                                /> */}
                                <Textarea
                                    id="activity"
                                    placeholder="Personal note..."
                                    rows={4}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
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