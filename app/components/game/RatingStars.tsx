import { Star } from "lucide-react";

export default function RatingStars({ rating, size = 12 }: { rating?: number | null; size?: number }) {
    const value = rating ?? 0;

    return (
        <div className="flex flex-row gap-0.5" aria-label={rating != null ? `Rating ${rating} out of 5` : "No rating"}>
            {Array.from({ length: 5 }, (_, index) => {
                const fill = Math.min(1, Math.max(0, value - index)) * 100;

                return (
                    <span key={index} className="relative text-text-faint" style={{ width: size, height: size }}>
                        <Star size={size} aria-hidden="true" />
                        <span className="absolute inset-0 overflow-hidden text-primary" style={{ width: `${fill}%` }}>
                            <Star size={size} className="fill-primary" aria-hidden="true" />
                        </span>
                    </span>
                );
            })}
        </div>
    );
}
