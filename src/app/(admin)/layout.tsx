import { type ReactNode } from "react";
import Container from "@/components/layout/Container";

export const metadata = {
	title: "Admin",
	robots: { index: false, follow: false },
};

// Intentionally does not guard here — the gate and locked pages live under this layout and
// must stay reachable. Enforcement lives in `requireAdmin()`, called by every real admin page.
export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<main className="flex-1 bg-bg py-8 text-text">
			<Container>{children}</Container>
		</main>
	);
}
