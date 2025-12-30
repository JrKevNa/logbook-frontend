// components/UserProfileHeader.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Dropdown, DropdownHeader, DropdownItem, DropdownDivider, Avatar, Button } from 'flowbite-react';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { useUser } from '../context/UserContext';
import { HiUser } from 'react-icons/hi';
import Link from 'next/link';

export default function UserProfileHeader() {
    const { user, setUser, loading} = useUser();
    const router = useRouter();

    if (loading) return null; // avoids flicker

    const handleLogin = () => router.push('/login');

    const handleRegister = () => router.push('/register');

    const handleLogout = async () => {
        await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        setUser(null);

        router.push('/login');
    };

    if (user) {
        return (
            <Dropdown
                arrowIcon={false}
                inline
                // label={<Avatar alt="User" img="https://flowbite.com/docs/images/people/profile-picture-5.jpg" rounded />}
                label={
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200">
                        <HiUser className="w-6 h-6 text-gray-600" />
                    </div>
                }
            >
                <DropdownHeader>
                    <span className="block text-sm">{user.username}</span>
                    <span className="block text-sm">{user.email}</span>
                    <span className="block text-sm">{user.userRoles?.[0]?.role?.name}</span>
                </DropdownHeader>
                <DropdownItem as={Link} href="/profile">Profile</DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={handleLogout}>Sign out</DropdownItem>
            </Dropdown>
        );
    }

    return (
        <div className="flex gap-2">
            <Button size="sm" onClick={handleRegister} color="purple">Register</Button>
            <Button size="sm" onClick={handleLogin}>Login</Button>
        </div>
    );
}
