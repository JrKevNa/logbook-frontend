'use client';

import { useState } from 'react';
import { Button, Label, Spinner, TextInput } from 'flowbite-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { useUser } from '../context/UserContext';
import { FcGoogle } from 'react-icons/fc';
import { SiGoogle } from 'react-icons/si';

export default function LoginForm() {
    const { setUser } = useUser();
    const router = useRouter();
    // const [email, setEmail] = useState('')
    // const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // async function handleSubmit(e: React.FormEvent) {
    //     e.preventDefault();
    //     setError('');
    //     setLoading(true);

    //     try {
    //         const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             credentials: 'include', 
    //             body: JSON.stringify({
    //                 email: email,
    //                 password: password,
    //             }),
    //         });

    //         const data = await res.json().catch(() => ({}));

    //         if (!res.ok) {
    //             const message = data?.message || data?.error || `HTTP ${res.status}: ${res.statusText}`;
    //             throw new Error(message);
    //         }

    //         // ✅ Refresh user info from backend
    //         const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    //             credentials: 'include',
    //         });
    //         const meData = await meRes.json();
    //         setUser(meData.user); // updates context so Header re-renders

    //         router.push('/dashboard-page');
    //     } catch (err: any) {
    //         setError(err.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // }

    async function handleGoogleLogin() {
        setError('');
        setLoading(true);

        try {
            // Open popup for Google OAuth
            const popup = window.open(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`,
                'GoogleLogin',
                'width=500,height=600'
            );

            if (!popup) throw new Error('Failed to open popup');

            // Poll the popup URL until it closes
            const user = await new Promise<any>((resolve, reject) => {
                const timer = setInterval(() => {
                    try {
                        if (!popup || popup.closed) {
                            clearInterval(timer);
                            reject(new Error('Login cancelled'));
                        }

                        // // Only act if popup redirects back to frontend
                        // if (popup.location.href.startsWith(process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin)) {
                        //     clearInterval(timer);
                        //     popup.close();

                        //     // Fetch logged-in user from backend
                        //     fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { credentials: 'include' })
                        //         .then(r => r.json())
                        //         .then(data => {
                        //             if (data.user) resolve(data.user);
                        //             else reject(new Error('Login failed or user not registered'));
                        //         })
                        //         .catch(err => reject(err));
                        // }
                        const popupUrl = popup.location.href;
                        if (popupUrl.endsWith('/oauth-success')) {
                            clearInterval(timer);
                            popup.close();
                            fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { credentials: 'include' })
                                .then(r => r.json())
                                .then(data => {
                                    if (data.user) resolve(data.user);
                                    else reject(new Error('Login failed or user not registered'));
                                })
                                .catch(err => reject(err));
                        }

                        if (popupUrl.endsWith('/register')) {
                            clearInterval(timer);
                            popup.close();
                            reject(new Error('User not registered, please register first'));
                        }
                    } catch {
                        // Ignore cross-origin errors
                    }
                }, 500);
            });

            setUser(user); 
            router.push('/dashboard-page'); // only runs if user exists
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
        // <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <form className="flex flex-col gap-4">
            {/* <div>
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

            <Button type="submit">
                {loading ? <Spinner aria-label="Spinner button example" size="md" light /> : 'Sign In'}
            </Button> */}

            {/* <Button type="button" color="light" onClick={handleGoogleLogin}>
                {loading ? <Spinner size="sm" light /> : 'Sign in with Google'}
            </Button> */}
            
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <Button
                type="button"
                className="flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700"
                onClick={handleGoogleLogin}
                >
                {loading ? (
                    <Spinner size="sm" light />
                ) : (
                    <>
                    <SiGoogle className="w-5 h-5" />
                    Sign in with Google
                    </>
                )}
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