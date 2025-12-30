// userContext.tsx
'use client'

// context/UserContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Role = {
    id: string;
    name: string;
};

type UserRole = {
    id: string;
    role: Role;
    assignedAt?: string;
};

type User = {
    id: string;
    email: string;
    username: string;
    companyId: string;
    company?: {
        id: string;
        name: string;
    };
    userRoles: UserRole[];
} | null;

interface UserContextType {
    user: User;
    setUser: (user: User) => void;
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ 
    children, 
    initialUser 
}: { 
    children: ReactNode; 
    initialUser: User; 
}) => {
    const [user, setUser] = useState<User>(initialUser);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true); // <-- start loading before anything

            try {
                let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                    credentials: 'include',
                });

                if (res.status === 401) {
                    // try refresh
                    const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                    });

                    if (refreshRes.ok) {
                        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                            credentials: 'include',
                        });
                    } else {
                        setUser(null);
                        return;
                    }
                }

                if (res.ok) {
                    const data = await res.json();
                    // console.log(data)
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false); // <-- end loading after all done
            }
        };

        fetchUser();
    }, []);

    return <UserContext.Provider value={{ user, setUser, loading }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be inside UserProvider');
    return ctx;
};
