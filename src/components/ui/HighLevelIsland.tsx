"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { deferHook } from "@/lib/util/client/func";

type HighLevelIslandProps = Readonly<{ children: ReactNode; className?: string }>;

export default function HighLevelIsland({ children, className = "" }: HighLevelIslandProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		return deferHook(() => {
			setMounted(true);
		});
	}, []);

	if (!mounted) return null;

	return createPortal(<div className={`pointer-events-none fixed inset-0 z-modal ${className}`}>{children}</div>, document.body);
}
