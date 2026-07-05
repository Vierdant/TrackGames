export function Skeleton({ className = "" }: Readonly<{ className?: string }>) {
	return <div className={`skeleton-wave overflow-hidden rounded bg-bg-secondary ${className}`} aria-hidden="true" />;
}
