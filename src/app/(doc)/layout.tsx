import { type ReactNode } from "react";
import DocNav from "@/components/doc/DocNav";
import Container from "@/components/layout/Container";

export default function DocLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<main className="flex-1 bg-bg py-8 text-text">
			<Container className="grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
				<DocNav />
				<div className="min-w-0">{children}</div>
			</Container>
		</main>
	);
}
