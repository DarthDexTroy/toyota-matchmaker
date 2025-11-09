import { cn } from "@/lib/utils";

interface CircularMatchScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export const CircularMatchScore = ({ score, size = "md" }: CircularMatchScoreProps) => {
  const radius = size === "sm" ? 28 : size === "md" ? 36 : 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  };

  return (
    <div className={cn("relative grid place-items-center rounded-full bg-black/40 backdrop-blur-md ring-1 ring-white/20", sizeClasses[size])}>
      <svg className="absolute inset-0 h-full w-full -rotate-90">
        <defs>
          <linearGradient id="toyotaStroke" x1="0" x2="1">
            <stop offset="0" stopColor="#EB0A1E" />
            <stop offset="1" stopColor="#A50000" />
          </linearGradient>
        </defs>
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="url(#toyotaStroke)"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="text-center">
        <div className={cn(
          "font-extrabold text-white leading-none",
          size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl"
        )}>
          {score}
        </div>
        <div className={cn(
          "font-semibold tracking-wide text-white/70",
          size === "sm" ? "text-[8px]" : size === "md" ? "text-[10px]" : "text-xs"
        )}>
          MATCH
        </div>
      </div>
    </div>
  );
};
