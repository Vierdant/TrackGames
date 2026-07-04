"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { deferHook } from "@/app/_util/func";

export default function HighLevelIsland({ children, className = "" }: Readonly<{ children: ReactNode; className?: string }>) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		return deferHook(() => {
			setMounted(true);
		});
	}, []);

	if (!mounted) return null;

	return createPortal(<div className={`pointer-events-none fixed inset-0 z-1000 ${className}`}>{children}</div>, document.body);
}
