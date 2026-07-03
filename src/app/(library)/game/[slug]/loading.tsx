import Container from "@/components/layout/Container";
import { Block } from "@/components/Skeleton";

export default function Loading() {
	return (
		<div className="">
			<section className="relative min-h-136 w-full md:min-h-152">
				<div className="pointer-events-none absolute inset-0 bg-bg-secondary" />
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-linear-to-t from-bg via-bg/95 via-50% to-transparent md:via-30%" />

				<Container className="relative z-1 flex min-h-136 flex-row items-end justify-center gap-10 pt-20 pb-8 md:min-h-152 md:justify-start">
					<div className="flex min-h-max max-w-full min-w-0 flex-col items-center gap-3 text-text md:flex-row md:items-end md:gap-6">
						<Block className="hidden h-78 w-52 md:block" />
						<Block className="h-67 w-45 md:hidden" />
					</div>
				</Container>
			</section>

			<section className="mt-5 w-full">
				<Container className="flex flex-col justify-between gap-10 lg:flex-row">
					<div className="min-w-0 flex-1">
						<section className="flex min-w-0 flex-col gap-10 md:flex-row">
							<div className="grid w-full min-w-0 grid-cols-1 items-start gap-x-10 gap-y-2 border-border pb-5 md:grid-cols-[auto_minmax(0,1fr)] md:gap-y-5 md:border-b md:pb-1.5">
								<p className="text-md border-b border-border p-1 text-start font-body md:border-none md:bg-bg md:p-0">Genres</p>
								<div className="flex min-w-0 flex-row flex-wrap gap-2">
									<Block className="h-4 w-full" />
								</div>

								<p className="text-md border-b border-border p-1 text-start font-body md:border-none md:bg-bg md:p-0">Platforms</p>
								<div className="flex min-w-0 flex-row flex-wrap gap-2">
									<Block className="h-4 w-full" />
								</div>
							</div>
						</section>

						<section className="mt-4 flex flex-col">
							<div className="w-full min-w-0 overflow-hidden">
								<Block className="aspect-video w-full" />
							</div>
						</section>

						<section className="mt-4 flex flex-col pb-4">
							<div className="mb-5 flex min-w-0 flex-row flex-wrap items-center justify-between gap-2">
								<h2 className="text-xl font-bold text-text md:text-2xl">Summary</h2>
								<span className="min-w-8 flex-1 border-t border-border" aria-hidden="true" />
							</div>
							<div className="flex flex-col gap-2">
								<Block className="h-4 w-full" />
							</div>
						</section>
					</div>

					<div className="flex max-w-full min-w-0 shrink-0 flex-col gap-5 lg:w-80">
						<div className="hidden lg:block">
							<section className="rounded">
								<div className="flex flex-row items-center gap-5 lg:flex-col lg:items-stretch">
									<div className="min-w-0 flex-1">
										<div className="flex h-18 min-w-36 items-end gap-1"></div>
										<div className="mt-2 h-4 border-t border-border" aria-hidden="true" />
									</div>
								</div>
							</section>
						</div>

						<Block className="flex h-18 min-w-0 flex-row items-start justify-start gap-2 rounded bg-bg-secondary p-4" />
						<Block className="flex h-25 min-w-0 flex-row items-start justify-start gap-2 rounded bg-bg-secondary p-4" />
						<Block className="flex h-18 min-w-0 flex-row items-start justify-start gap-2 rounded bg-bg-secondary p-4" />

						<section className="grid min-w-0 grid-cols-3 gap-3">
							<Block className="h-24 border-2 border-primary/30 bg-primary/10" />
							<Block className="h-24 border-2 border-primary/30 bg-primary/10" />
							<Block className="h-24 border-2 border-primary/30 bg-primary/10" />
						</section>
					</div>
				</Container>
			</section>

			<section className="mt-20 mb-10 w-full">
				<Container>
					<div className="flex flex-col gap-5">
						<div className="flex flex-row gap-2">
							<Block className="h-10 w-68" />
						</div>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
							<Block className="aspect-3/4 w-full" />
							<Block className="aspect-3/4 w-full" />
							<Block className="aspect-3/4 w-full" />
							<Block className="hidden aspect-3/4 w-full md:block" />
							<Block className="hidden aspect-3/4 w-full lg:block" />
						</div>
						<Block className="mt-5 h-36 w-full" />
					</div>
				</Container>
			</section>
		</div>
	);
}
