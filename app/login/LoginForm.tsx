'use client';

import { useState } from 'react';
import { Button, Label, Spinner, TextInput } from 'flowbite-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { useUser } from '../context/UserContext';

export default function LoginForm() {
    const { setUser } = useUser();
    const router = useRouter();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', 
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const message = data?.message || data?.error || `HTTP ${res.status}: ${res.statusText}`;
                throw new Error(message);
            }

            // ✅ Refresh user info from backend
            const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                credentials: 'include',
            });
            const meData = await meRes.json();
            setUser(meData.user); // updates context so Header re-renders

            router.push('/dashboard-page');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // async function handleSubmit(e: React.FormEvent) {
    //     e.preventDefault();
    //     setError('');
    //     setLoading(true);

    //     try {
    //         await new Promise((resolve) => setTimeout(resolve, 3000));

    //         const fakeSuccess = Math.random() > 0.5;
    //         if (!fakeSuccess) throw new Error('Invalid credentials');

    //         console.log('Login successful!');

    //         router.push('/home');
    //     } catch (err: any) {
    //         setError(err.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <Label htmlFor="email">Email</Label>
                <TextInput id="email" type="email" placeholder="name@example.com" 
                    value = {email}
                    onChange = {(e) => {
                        setEmail(e.target.value)
                    }}
                required />
            </div>

            <div>
                <Label htmlFor="email">Password</Label>
                <TextInput id="email" type="password" placeholder="your password" 
                    value = {password}
                    onChange = {(e) => {
                        setPassword(e.target.value)
                    }}
                required />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <Button type="submit">
                {loading ? <Spinner aria-label="Spinner button example" size="md" light /> : 'Sign In'}
            </Button>

            <p className="text-sm text-gray-500 text-center">
                Don’t have an account?{' '}
                <Link href="/register" className="text-blue-600 hover:underline">
                    Register
                </Link>
            </p>
        </form>
    );
}