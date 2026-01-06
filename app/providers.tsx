// app/providers.tsx
"use client";

import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import { UserProvider } from "./context/UserContext";
import { ThemeInit } from "../.flowbite-react/init";

export function Providers({
	children,
	user,
}: {
	children: React.ReactNode;
	user: any;
}) {
	return (
		<>
			<ThemeInit />
			<UserProvider initialUser={user}>
				<Header />
				<Toaster position="top-right" />
				{children}
			</UserProvider>
		</>
	);
}