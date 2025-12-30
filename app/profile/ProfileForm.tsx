'use client'

import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { useUser } from "../context/UserContext";
import { getCookie } from "../utils/getCookie";

export function ProfileForm() {

    const { user, setUser } = useUser();
    
    const [id, setId] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [roleName, setRoleName] = useState('')
    const [companyName, setCompanyName] = useState('')   
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log(user)
        if (user) {
            setId(user.id || '');
            setUsername(user.username || '');
            setEmail(user.email || '');
            setRoleName(user.userRoles?.[0]?.role?.name || '');
            setCompanyName(user.company?.name || '');
        }
    }, [user]);
    
    const handleUpdate = async () => {
        if (!username) {
            toast.error("Username cannot be empty");
            return;
        }

        try {
            const csrfToken = getCookie('csrfToken');
            
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/users/${id || ''}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    'x-csrf-token': csrfToken || ''
                },
                credentials: "include",
                body: JSON.stringify({ username }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to update user");
            }

            toast.success("User updated");
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <div className="">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-full lg:w-3/6">
                    <div className="mb-2 block">
                        <Label htmlFor="durationNumber">Username</Label>
                    </div>
                    <TextInput
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                        }}
                    />
                </div>

                <div className="w-full lg:w-3/6">
                    <div className="mb-2 block">
                        <Label htmlFor="durationNumber">Email</Label>
                    </div>
                    <TextInput
                        value={email}
                        disabled
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
                <div className="w-full lg:w-3/6">
                    <div className="mb-2 block">
                        <Label htmlFor="durationNumber">Role</Label>
                    </div>
                    <TextInput
                        placeholder="Enter your username"
                        value={roleName}
                        disabled
                    />
                </div>

                <div className="w-full lg:w-3/6">
                    <div className="mb-2 block">
                        <Label htmlFor="durationNumber">Company Name</Label>
                    </div>
                    <TextInput
                        value={companyName}
                        disabled
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
                <div className="w-full lg:w-6/6">
                    <Button onClick={handleUpdate} className='w-full'>
                        {loading ? <Spinner aria-label="Spinner button example" size="md" light /> : 'Update Profile'}
                    </Button>
                </div>
            </div>

        </div>
    )
}