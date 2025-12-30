'use client'

import Link from 'next/link'
import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import { Dropdown, DropdownItem, } from "flowbite-react";
import UserProfileHeader from './UserProfileHeader';
import UserMenuHeader from './UserMenuHeader';

export default function Header() {
    return (
		<Navbar fluid className="dark:bg-gray-200">
			<NavbarBrand>
				<img src="/vercel.svg" className="mr-3 h-6 sm:h-9" alt="Flowbite React Logo" />
				<span className="self-center whitespace-nowrap text-xl font-semibold">Log Book</span>
			</NavbarBrand>

			<div className="flex md:order-2">
				<UserProfileHeader />
					
				<NavbarToggle/>
			</div>

			<NavbarCollapse>
				<NavbarLink as={Link} href="/dashboard-page">
					Dashboard
				</NavbarLink>
				<NavbarLink as={Link} href="/projects">
					Project
				</NavbarLink>
				<NavbarLink as={Link} href="/to-do-list">
					To Do List
				</NavbarLink>
				<NavbarLink as={Link} href="/logbook">
					My Logbook
				</NavbarLink>
					{/* <Dropdown label="Calculator" inline>
						<DropdownItem href="/calculator/basic">Basic</DropdownItem>
						<DropdownItem href="/calculator/interest">Interest</DropdownItem>
					</Dropdown> */}

                <UserMenuHeader />
			</NavbarCollapse>
			
		</Navbar>
    )
};