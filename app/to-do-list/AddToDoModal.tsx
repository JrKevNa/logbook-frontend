'use client'

import { Button, Datepicker, Label, Modal, ModalBody, ModalFooter, ModalHeader, Select, Spinner, Textarea, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { getCookie } from "../utils/getCookie";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import toast from "react-hot-toast";

type AddToDoModalProps = {
    isOpen: boolean;
    onClose: () => void;
    mode: string;
    toDo?: any; // or your specific Logbook type if defined
    onToDoChange: () => void;
};

export default function AddLogbookModal({
    isOpen,
    onClose,
    mode,
    toDo,
    onToDoChange,
}: AddToDoModalProps) {
    const [title, setTitle] = useState('')

    // const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true)
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const [id, setId] = useState('')
    // const [logDate, setLogDate] = useState<Date | undefined>(undefined);
    const [activity, setActivity] = useState('')

    useEffect(() => {
        setLoading(true)

        if (isOpen) {
            if (mode === 'add') {
                setTitle('Add')
                setActivity('')
            } else if (mode === 'edit' && toDo) {
                setTitle('Edit')
                setId(toDo.id)
                setActivity(toDo.activity)
                // Optionally load data to edit
            }  else if (mode === 'finish' && toDo) {
                setTitle('Finishing')
                setId(toDo.id)
                setActivity(toDo.activity)
                // Optionally load data to edit
            }
            setLoading(false)
        }
    }, [isOpen, mode]) // ✅ Run when isOpen or mode changes

    if (!isOpen) return null

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        if (mode === 'add') {
            e.preventDefault()

            // console.log(logDate)

            if (!activity) return alert('Please fill in all fields')
            
            try {
                setLoadingSubmit(true)
                // Add item to backend
                const csrfToken = getCookie('csrfToken');
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/to-do-list`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-csrf-token': csrfToken || ''
                    },
                    credentials: 'include',
                    body: JSON.stringify({ activity }),
                })

                if (!res.ok) {
                    const data = await res.json().catch(() => ({})); // optional, in case response isn't JSON
                    // throw new Error(data?.message || data?.error || `HTTP error ${res.status}`);

                    toast.error(data?.message || data?.error || `HTTP error ${res.status}`);
                    return;
                }

                setLoadingSubmit(false)

                toast.success("To Do Created");

                setActivity('')
                onClose()
                onToDoChange()
            } catch (err: any) {
                // show error directly on client page
                setLoadingSubmit(false)
                toast.error(err.message);
            }
        }
        else if (mode === 'edit') {
            e.preventDefault()

            if (!activity) return alert('Please fill in all fields')
            
            try {
                setLoadingSubmit(true)
                const csrfToken = getCookie('csrfToken');
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/to-do-list/${id}`, {
                    method: 'PATCH',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-csrf-token': csrfToken || ''
                    },
                    credentials: 'include',
                    body: JSON.stringify({ activity }),
                })

                if (!res.ok) {
                    // Try to read the error message from the response
                    const data = await res.json().catch(() => ({}))
                    const message = data.message || 'Failed to update to do'
                    return alert(message) // show the error to user
                }
                setLoadingSubmit(false)

                toast.success("To Do Updated");
                // Success
                setActivity('')
                onClose()
                onToDoChange()
            } catch (err: any) {
                // show error directly on client page
                setLoadingSubmit(false)
                toast.error(err.message);
            }
        }
        else if (mode === 'finish') {
            e.preventDefault()

            if (!activity) return alert('Please fill in all fields')
            
            try {
                setLoadingSubmit(true)
                const csrfToken = getCookie('csrfToken');
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/to-do-list/finish/${id}`, {
                    method: 'PATCH',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-csrf-token': csrfToken || ''
                    },
                    credentials: 'include',
                    body: JSON.stringify({ activity }),
                })

                if (!res.ok) {
                    // Try to read the error message from the response
                    const data = await res.json().catch(() => ({}))
                    const message = data.message || 'Failed to update to do'
                    return alert(message) // show the error to user
                }
                setLoadingSubmit(false)

                toast.success("To Do Finished");
                // Success
                setActivity('')
                onClose()
                onToDoChange()
            } catch (err: any) {
                // show error directly on client page
                setLoadingSubmit(false)
                toast.error(err.message);
            }            
        }
    }

    return (
        <Modal show={isOpen} onClose={onClose}>
            <ModalHeader>{title}</ModalHeader>
            <ModalBody>
                {loading ? (
                    <Spinner aria-label="Loading logbook..." />
                ) : (
                    <form className="flex flex-col gap-4 w-full">
                        <div className="space-y-6">

                            {/* Activity */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="activity">Activity</Label>
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
                                    placeholder="Describe your activity in detail..."
                                    rows={4}
                                    value={activity}
                                    onChange={(e) => setActivity(e.target.value)}
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