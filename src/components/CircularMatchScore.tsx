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

  const getScoreColor = () => {
    if (score >= 85) return "hsl(var(--match-excellent))";
    if (score >= 70) return "hsl(var(--match-good))";
    if (score >= 50) return "hsl(var(--match-fair))";
    return "hsl(var(--match-poor))";
  };

  return (
    <div className={cn("relative", sizeClasses[size])}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke={getScoreColor()}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(
          "font-bold text-foreground",
          size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl"
        )}>
          {score}
        </span>
        <span className={cn(
          "text-muted-foreground uppercase",
          size === "sm" ? "text-[8px]" : size === "md" ? "text-[10px]" : "text-xs"
        )}>
          Match
        </span>
      </div>
    </div>
  );
};
