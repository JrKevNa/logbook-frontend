'use client';

import { Button, Label, Spinner, TextInput } from "flowbite-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../utils/fetchWithAuth";

export default function RegisterForm() {
    const router = useRouter();
    const [companyName, setCompanyName] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [nik, setNik] = useState('')
    // const [password, setPassword] = useState('')
    // const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', 
                body: JSON.stringify({
                    companyName: companyName,
                    nik: nik,
                    username: username,
                    email: email,
                    // password: password,
                }),
            });

            if (!res.ok) throw new Error('Invalid credentials');
            // handle successful login (redirect, store token, etc.)
            toast.success('User has been created');
            
            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <Label htmlFor="email">Company Name</Label>
                <TextInput id="email" type="text" placeholder="your company name" 
                    value = {companyName}
                    onChange = {(e) => {
                        setCompanyName(e.target.value)
                    }}
                required />
            </div>

            <hr/>

            <div>
                <Label htmlFor="email">NIK</Label>
                <TextInput id="email" type="text" placeholder="your nik" 
                    value = {nik}
                    onChange = {(e) => {
                        setNik(e.target.value)
                    }}
                required />
            </div>

            <div>
                <Label htmlFor="email">Username</Label>
                <TextInput id="email" type="text" placeholder="your username" 
                    value = {username}
                    onChange = {(e) => {
                        setUsername(e.target.value)
                    }}
                required />
            </div>

            <div>
                <Label htmlFor="email">Email</Label>
                <TextInput id="email" type="email" placeholder="name@example.com" 
                    value = {email}
                    onChange = {(e) => {
                        setEmail(e.target.value)
                    }}
                required />
            </div>

            {/* <div>
                <Label htmlFor="email">Password</Label>
                <TextInput id="email" type="password" placeholder="your password" 
                    value = {password}
                    onChange = {(e) => {
                        setPassword(e.target.value)
                    }}
                required />
            </div>

            <div>
                <Label htmlFor="email">Confirm Password</Label>
                <TextInput id="email" type="password" placeholder="confirm your password" 
                    value = {confirmPassword}
                    onChange = {(e) => {
                        setConfirmPassword(e.target.value)
                    }}
                required />
            </div> */}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <Button type="submit">
                {loading ? <Spinner aria-label="Spinner button example" size="md" light /> : 'Register'}
            </Button>

            <p className="text-sm text-gray-500 text-center">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                    Login
                </Link>
            </p>
        </form>
    );
}