'use client'

import { Button, Datepicker, Label, Modal, ModalBody, ModalFooter, ModalHeader, Select, Spinner, Textarea, TextInput } from "flowbite-react";
import { SetStateAction, useEffect, useState } from "react";
import { getCookie } from "../utils/getCookie";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import toast from "react-hot-toast";

type AddLogbookModalProps = {
    isOpen: boolean;
    onClose: () => void;
    mode: string;
    logbook?: any; // or your specific Logbook type if defined
    onLogbookChange: () => void;
};

export default function AddLogbookModal({
    isOpen,
    onClose,
    mode,
    logbook,
    onLogbookChange,
}: AddLogbookModalProps) {
    const [title, setTitle] = useState('')

    const [loading, setLoading] = useState(true)
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const [id, setId] = useState('')
    // const [logDate, setLogDate] = useState<Date | undefined>(undefined);
    const [logDate, setLogDate] = useState<Date | null>(new Date());
    const [activity, setActivity] = useState('')
    const [durationNumber, setDurationNumber] = useState('')
    const [durationUnit, setDurationUnit] = useState('')

    function parseDateWithDefaultTime(dateStr: string | Date | null): Date | null {
        if (!dateStr) return null;
        if (dateStr instanceof Date) return dateStr;

        // If the string has no "T", append midnight
        return dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00');
    }

    const formatDate = (date: Date) => {
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
                setLogDate(new Date())
                setActivity('')
                setDurationNumber('')
                setDurationUnit('')
            } else if (mode === 'edit' && logbook) {
                setTitle('Edit')
                setId(logbook.id)
                setLogDate(parseDateWithDefaultTime(logbook.logDate))
                setActivity(logbook.activity)
                setDurationNumber(logbook.durationNumber)
                setDurationUnit(logbook.durationUnit)
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

            if (!logDate || !activity || !durationNumber || !durationUnit) return alert('Please fill in all fields')
            
            try {
                setLoadingSubmit(true)
                // Add item to backend
                const csrfToken = getCookie('csrfToken');
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/logbook`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-csrf-token': csrfToken || ''
                    },
                    credentials: 'include',
                    body: JSON.stringify({ 
                        activity, 
                        logDate: formatDate(logDate), 
                        durationNumber, 
                        durationUnit 
                    }),
                })

                if (!res.ok) {
                    const data = await res.json().catch(() => ({})); // optional, in case response isn't JSON
                    // throw new Error(data?.message || data?.error || `HTTP error ${res.status}`);

                    toast.error(data?.message || data?.error || `HTTP error ${res.status}`);
                    return;
                }

                setLoadingSubmit(false)

                toast.success("Logbook Created");

                setActivity('')
                setLogDate(null)
                setDurationNumber('')
                setDurationUnit('')
                onClose()
                onLogbookChange()
            } catch (err: any) {
                // show error directly on client page
                setLoadingSubmit(false)
                toast.error(err.message);
            }
        }
        else if (mode === 'edit') {
            e.preventDefault()

            if (!logDate || !activity || !durationNumber || !durationUnit) return alert('Please fill in all fields')
            
            try {
                setLoadingSubmit(true)
                
                const csrfToken = getCookie('csrfToken');
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/logbook/${id}`, {
                    method: 'PATCH',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-csrf-token': csrfToken || ''
                    },
                    credentials: 'include',
                    body: JSON.stringify({ 
                        activity, 
                        logDate: formatDate(logDate),
                        durationNumber, 
                        durationUnit 
                    }),
                })

                if (!res.ok) {
                    // Try to read the error message from the response
                    const data = await res.json().catch(() => ({}))
                    const message = data.message || 'Failed to update inventory unit'
                    return alert(message) // show the error to user
                }
                setLoadingSubmit(false)

                toast.success("Logbook Updated");
                // Success
                setActivity('')
                setLogDate(null)
                setDurationNumber('')
                setDurationUnit('')
                onClose()
                onLogbookChange()
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

                            {/* Log Date */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="logDate">Log Date</Label>
                                </div>
                                {/* <TextInput
                                    id="logDate"
                                    type="date"
                                    value={logDate}
                                    onChange={(e) => setLogDate(e.target.value)}
                                    required
                                /> */}
                                <Datepicker
                                    value={logDate}
                                    labelTodayButton="Today"
                                    labelClearButton="Clear"
                                    onChange={(date) => setLogDate(date)}
                                    required
                                />
                            </div>

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

                            {/* Duration Number */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="durationNumber">Duration</Label>
                                </div>
                                <TextInput
                                    id="durationNumber"
                                    type="number"
                                    placeholder="Enter duration"
                                    value={durationNumber}
                                    onChange={(e) => setDurationNumber(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Duration Unit */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="durationUnit">Duration Unit</Label>
                                </div>
                                <Select
                                    id="durationUnit"
                                    value={durationUnit}
                                    onChange={(e) => setDurationUnit(e.target.value)}
                                    required
                                >
                                    <option value="">Select unit</option>
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                    <option value="days">Days</option>
                                </Select>
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