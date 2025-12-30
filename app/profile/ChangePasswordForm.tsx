'use client'

import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { getCookie } from "../utils/getCookie";
import { fetchWithAuth } from "../utils/fetchWithAuth";

export function ChangePasswordForm() {

    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        // 1. basic validation
        if (!oldPassword || !newPassword) {
            toast.error("Please fill all fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const csrfToken = getCookie('csrfToken');

            // 2. call backend API
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'x-csrf-token': csrfToken || ''
                },
                credentials: "include", // include cookies if you use JWT in cookies
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to update password");
            }

            // 3. success message
            toast.success("Password updated successfully");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-full lg:w-3/6">
                    <div className="mb-2 block">
                        <Label htmlFor="durationNumber">Old Password</Label>
                    </div>
                    <TextInput type="password"
                        placeholder="Enter your old Password"
                        onChange={(e) => {
                            setOldPassword(e.target.value);
                        }}
                    />
                </div>

                <div className="w-full lg:w-3/6">
                </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
                <div className="w-full lg:w-3/6">
                    <div className="mb-2 block">
                        <Label htmlFor="durationNumber">New Password</Label>
                    </div>
                    <TextInput type="password"
                        placeholder="Enter your new password"
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                        }}
                    />
                </div>

                <div className="w-full lg:w-3/6">
                    <div className="mb-2 block">
                        <Label htmlFor="durationNumber">Confirm New Password</Label>
                    </div>
                    <TextInput type="password"
                        placeholder="Confirm your new password"
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                        }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
                <div className="w-full lg:w-6/6">
                    <Button onClick={handleUpdate} className='w-full'>
                        {loading ? <Spinner aria-label="Spinner button example" size="md" light /> : 'Update Password'}
                    </Button>
                </div>
            </div>

        </div>
    )
}