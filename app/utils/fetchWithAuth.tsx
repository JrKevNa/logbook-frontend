import { getCookie } from './getCookie'; // make sure this is a 'use client' function

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const opts: RequestInit = {
        ...options,
        credentials: 'include',
    };

    // Add CSRF header if it exists
    const csrfToken = getCookie('csrfToken');
    if (csrfToken) {
        opts.headers = {
            ...(opts.headers || {}),
            'x-csrf-token': csrfToken,
        };
    }

    let res = await fetch(url, opts);

    if (res.status === 401) {
        // try refresh
        const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        });

        if (refreshRes.ok) {
            // grab the new CSRF token from the cookie after refresh
            const newCsrfToken = getCookie('csrfToken');

            // retry original request with updated CSRF
            const retryOpts: RequestInit = {
                ...opts,
                headers: {
                    ...(opts.headers || {}),
                    'x-csrf-token': newCsrfToken || '',
                },
            };

            res = await fetch(url, retryOpts);
        } else {
            // refresh failed, redirect to login
            window.location.href = '/login';
            throw new Error('Refresh failed, redirecting to login');
        }
    }

    return res;
}

// let refreshPromise: Promise<boolean> | null = null;

// export async function fetchWithAuth(url: string, options: RequestInit = {}) {
//     const opts: RequestInit = {
//         ...options,
//         credentials: 'include',
//     };

//     const csrfToken = getCookie('csrfToken');
//     if (csrfToken) {
//         opts.headers = {
//             ...(opts.headers || {}),
//             'x-csrf-token': csrfToken,
//         };
//     }

//     let res = await fetch(url, opts);

//     if (res.status !== 401) {
//         return res;
//     }

//     // 🔒 SINGLE FLIGHT REFRESH
//     if (!refreshPromise) {
//         refreshPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
//             method: 'POST',
//             credentials: 'include',
//             headers: { 'Content-Type': 'application/json' },
//         })
//         .then(r => r.ok)
//         .finally(() => {
//             refreshPromise = null;
//         });
//     }

//     const refreshed = await refreshPromise;

//     if (!refreshed) {
//         window.location.href = '/login';
//         throw new Error('Refresh failed');
//     }

//     // retry original request
//     const newCsrfToken = getCookie('csrfToken');

//     const retryOpts: RequestInit = {
//         ...opts,
//         headers: {
//             ...(opts.headers || {}),
//             'x-csrf-token': newCsrfToken || '',
//         },
//     };

//     return fetch(url, retryOpts);
// }
