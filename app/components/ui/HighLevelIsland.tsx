"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

export default function HighLevelIsland({ children, className = "" }: { children: ReactNode; className?: string }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className={`fixed inset-0 z-1000 pointer-events-none ${className}`}>
            {children}
        </div>,
        document.body,
    );
}
