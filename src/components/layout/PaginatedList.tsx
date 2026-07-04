"use client";

import { Children, type ReactNode, useState } from "react";
import PaginationControls from "@/components/layout/PaginationControls";

type PaginatedListProps = Readonly<{ children: ReactNode; pageSize: number; className?: string }>;

export default function PaginatedList({ children, pageSize, className }: PaginatedListProps) {
	const [page, setPage] = useState(1);
	const items = Children.toArray(children);
	const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
	const start = (page - 1) * pageSize;
	const pageItems = items.slice(start, start + pageSize);

	function goToPage(value: number) {
		setPage(Math.min(pageCount, Math.max(1, value)));
	}

	return (
		<div className="flex w-full flex-col gap-5">
			<div className={className}>{pageItems}</div>
			{pageCount > 1 && <PaginationControls page={page} pageCount={pageCount} onPageChange={goToPage} />}
		</div>
	);
}
