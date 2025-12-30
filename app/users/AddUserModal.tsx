'use client'

import { Button, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import EntitySelector from "../components/EntitySelector";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { getCookie } from "../utils/getCookie";
import toast from "react-hot-toast";

type Role = {
    id: string;
    name: string;
};

type AddUserModalProps = {
    isOpen: boolean;
    onClose: () => void;
    mode: string;
    user?: any; // or your specific Logbook type if defined
    onUserChange: () => void;
};

export default function AddUserModal({
    isOpen,
    onClose,
    mode,
    user,
    onUserChange,
}: AddUserModalProps) {
    const [title, setTitle] = useState('')

    const [page, setPage] = useState(1);
    // const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true)
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const [id, setId] = useState('')
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [username, setUsername] = useState('')
    const [nik, setNik] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        setLoading(true)

        if (isOpen) {
            if (mode === 'add') {
                setTitle('Add')

                setUsername('')
                setNik('')
                setEmail('')
                setSelectedRole(null)
                setPassword('')
                setConfirmPassword('')
            } else if (mode === 'edit' && user) {
                setTitle('Edit')

                setId(user.id)
                setUsername(user.username)
                setNik(user.nik)
                setEmail(user.email)
                setSelectedRole(user.userRoles?.[0]?.role)
                setPassword('')
                setConfirmPassword('')
                // Optionally load data to edit
            }
            setLoading(false)
        }
    }, [isOpen, mode]) // ✅ Run when isOpen or mode changes

    // When roles or user change, find the matching role object from roles
    useEffect(() => {
        if (mode === 'edit' && user && roles.length > 0) {
            const userRole = user.userRoles?.[0]?.role;
            if (userRole) {
            // Find the same role object from the fetched list
            const matchedRole = roles.find(r => r.id === userRole.id);
                if (matchedRole) setSelectedRole(matchedRole);
            }
        }
    }, [roles, user, mode]);

    useEffect(() => {
        const loadRoles= async () => {
            try {
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Failed to fetch users');

                const data = await res.json();
                // console.log("raw data:", data);

                setRoles(data);
            } catch (err) {
                console.error('Error fetching users:', err);
            } finally {
                setLoading(false);
            }
        };

        loadRoles();
    }, []);

    if (!isOpen) return null

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        if (mode === 'add') {
            e.preventDefault()

            if (!username || !email || !nik || !selectedRole) {
                // console.log("username: ", username)
                // console.log("email: ", email)
                // console.log("role: ", selectedRole)
                return alert('Please fill in all fields')
            }
            
            if(password != confirmPassword) {
                return alert('Password not match')
            }

            try {
                setLoadingSubmit(true)

                const roleId = selectedRole!.id;

                const csrfToken = getCookie('csrfToken');
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-csrf-token': csrfToken || ''
                    },
                    credentials: 'include',
                    body: JSON.stringify({ username, nik, email, roleId, password }),
                })

                if (!res.ok) {
                    // Try to read the error message from the response
                    const data = await res.json().catch(() => ({}))
                    const message = data.message || 'Failed to create user'
                    return alert(message) // show the error to user
                }
                setLoadingSubmit(false)

                toast.success("User Created");
                // Success
                setUsername('')
                setEmail('')
                setPassword('')
                setConfirmPassword('')
                onClose()
                onUserChange()
            } catch (err: any) {
                // show error directly on client page
                setLoadingSubmit(false)
                toast.error(err.message);
            }
        }
        else if (mode === 'edit') {
            e.preventDefault()

            if (!username || !email || !nik || !selectedRole) {
                // console.log("username: ", username)
                // console.log("email: ", email)
                // console.log("role: ", selectedRole)
                return alert('Please fill in all fields')
            }
            
            if (password) {
                if(password != confirmPassword) {
                    return alert('Password not match')
                }
            }

            try {
                setLoadingSubmit(true)

                const roleId = selectedRole!.id;

                const csrfToken = getCookie('csrfToken');
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
                    method: 'PATCH',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-csrf-token': csrfToken || ''
                    },
                    credentials: 'include',
                    body: JSON.stringify({ username, nik, email, roleId, password }),
                })

                if (!res.ok) {
                    // Try to read the error message from the response
                    const data = await res.json().catch(() => ({}))
                    const message = data.message || 'Failed to update user'
                    return alert(message) // show the error to user
                }
                setLoadingSubmit(false)

                toast.success("User Updated");
                // Success
                setUsername('')
                setEmail('')
                setPassword('')
                setConfirmPassword('')
                onClose()
                onUserChange()
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

                            {/* Username */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="durationNumber">Username</Label>
                                </div>
                                <TextInput
                                    id="durationNumber"
                                    type="text"
                                    placeholder="Enter the username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            {/* NIK */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="nik">NIK</Label>
                                </div>
                                <TextInput
                                    id="nik"
                                    type="text"
                                    placeholder="Enter the nik"
                                    value={nik}
                                    onChange={(e) => setNik(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Role */}
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
                                    label="Role"
                                    items={roles}
                                    displayKey="name"
                                    onSelect={(item: any) => setSelectedRole(item)}
                                    selectedItem={selectedRole}
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="durationNumber">Email</Label>
                                </div>
                                <TextInput
                                    id="durationNumber"
                                    type="text"
                                    placeholder="Enter the email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="durationNumber">Password</Label>
                                </div>
                                <TextInput
                                    id="durationNumber"
                                    type="password"
                                    placeholder="Enter to change the password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="durationNumber">Confirm Password</Label>
                                </div>
                                <TextInput
                                    id="durationNumber"
                                    type="password"
                                    placeholder="Confirm your password change"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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