import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
	const refreshToken = req.cookies.get('refreshToken')?.value;
	if (!refreshToken) return NextResponse.redirect(new URL('/login', req.url));

	try {
        // console.log('refreshToken:', refreshToken);
		// Step 1: refresh access token
        const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        const text = await refreshRes.text();
        console.log('Refresh response raw:', text);

        if (!refreshRes.ok) throw new Error(`Refresh failed: ${refreshRes.status}`);

        let json;
        try {
            json = JSON.parse(text);
        } catch {
            throw new Error('Response not JSON: ' + text);
        }

        const { accessToken } = json;
        // console.log('Access token:', accessToken);
		// Step 2: verify identity
		const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		if (!meRes.ok) throw new Error('Unauthorized');

		const data = await meRes.json();
		const role = data.user?.userRoles?.[0]?.role?.name;

		if (role !== 'admin') {
			return NextResponse.redirect(new URL('/dashboard-page', req.url));
		}

		return NextResponse.next();
	} catch (err) {
		// console.error('Middleware auth failed:', err);
		return NextResponse.redirect(new URL('/dashboard-page', req.url));
        // const message = err instanceof Error ? err.message : String(err);
        // return new NextResponse(`Middleware failed: ${message}`, { status: 500 });
	}
}

export const config = {
	matcher: ['/users/:path*'],
};