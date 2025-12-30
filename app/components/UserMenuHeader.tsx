// components/UserProfileHeader.tsx
'use client';

import { Dropdown, DropdownItem, NavbarLink, Spinner } from 'flowbite-react';
import { useUser } from '../context/UserContext';
import Link from 'next/link';

export default function UserProfileHeader() {
    const { user, loading } = useUser();

    if (loading) return <Spinner aria-label="Default status example" />;
    if (!user) return null;

    const isAdmin = user.userRoles?.some((ur) => ur.role?.name === 'admin');

    return (
        <>
            <Dropdown label="Report" inline>
                {/* All users can see this */}
                <DropdownItem as={Link} href="/daily-report">Daily Report</DropdownItem>

                <DropdownItem as={Link} href="/user-report">User Report</DropdownItem>
            </Dropdown>

            {/* Admin-only */}
            {isAdmin && (
                <NavbarLink as={Link} href="/users">Users</NavbarLink>
            )}
        </>
    );
}