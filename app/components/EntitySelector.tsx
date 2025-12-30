'use client';

import { useState, useEffect, useRef } from 'react';
import { TextInput, Label, ListGroup, ListGroupItem } from 'flowbite-react';
import { HiOutlineSearch } from 'react-icons/hi';

interface EntitySelectorProps<T extends Record<string, any>> {
	label: string;
	items: T[];
	displayKey?: keyof T;      // which property to show (e.g. "name" or "username")
	idKey?: keyof T;           // which property is the id (default: "id")
	selectedItem?: T | null;
	disabled?: boolean;
	onSelect: (item: T) => void;
}

export default function EntitySelector<T extends Record<string, any>>({
	label,
	items,
	displayKey = 'name',
	idKey = 'id',
	selectedItem = null,
	disabled = false,
	onSelect,
}: EntitySelectorProps<T>) {
	const [query, setQuery] = useState('');
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setQuery(selectedItem ? String(selectedItem[displayKey] ?? '') : '');
	}, [selectedItem, displayKey]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

    const filteredItems = query.trim() === '' ? items : items.filter((item) =>
        String(item[displayKey] ?? '').toLowerCase().includes(query.toLowerCase())
    );

	return (
		<div ref={containerRef} className="relative w-full">
			<div className="mb-2 block">
				<Label htmlFor={label}>{label}</Label>
			</div>
			<TextInput
				id={label}
				icon={HiOutlineSearch}
				placeholder={`Search ${label.toLowerCase()}`}
				value={query}
				disabled={disabled}
                onFocus={() => {
                    if (!disabled) setOpen(true);
                }}
                onChange={(e) => {
                    setQuery(e.target.value);
                    if (!disabled) setOpen(true);
                }}
                onClick={() => {
                    // 👇 Ensure it opens even if you haven’t typed anything yet
                    if (!disabled) setOpen(true);
                }}
			/>

			{open && !disabled && filteredItems.length > 0 && (
				<div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
					<ListGroup>
						{filteredItems.map((item) => (
							<ListGroupItem
								key={String(item[idKey])}
								// className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
								className="cursor-pointer hover:bg-gray-100"
								onClick={() => {
									onSelect(item);
									setQuery(String(item[displayKey]));
									setOpen(false);
								}}
							>
								<span className="text-sm font-medium">
									{String(item[displayKey])}
								</span>
								<span className="ml-2 text-xs text-gray-500">
									({String(item[idKey])})
								</span>
							</ListGroupItem>
						))}
					</ListGroup>
				</div>
			)}

			{open && !disabled && filteredItems.length === 0 && (
				<div className="absolute z-10 w-full mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-lg dark:border-gray-700 dark:bg-gray-800">
					No results found
				</div>
			)}
		</div>
	);
}