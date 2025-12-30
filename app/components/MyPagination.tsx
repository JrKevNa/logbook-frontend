import { Pagination } from "flowbite-react";

type MyPaginationProps = {
    page: number;
    setPage: (page: number) => void;
    totalPages: number;
};

export default function MyPagination({ page, setPage, totalPages }: MyPaginationProps) {
    const onPageChange = (newPage: number) => setPage(newPage);

    return (
        <div className="flex overflow-x-auto sm:justify-center">
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
                showIcons
            />
        </div>
    );
}