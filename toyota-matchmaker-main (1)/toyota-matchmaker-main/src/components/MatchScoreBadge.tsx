interface MatchScoreBadgeProps {
  score: number;
}

export const MatchScoreBadge = ({ score }: MatchScoreBadgeProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "bg-match-excellent";
    if (score >= 70) return "bg-match-good";
    if (score >= 50) return "bg-match-fair";
    return "bg-match-poor";
  };

  return (
    <div
      className={`${getScoreColor(
        score
      )} absolute right-4 top-4 rounded-full px-4 py-2 text-white shadow-lg backdrop-blur-sm`}
    >
      <div className="flex items-center gap-1">
        <span className="text-2xl font-bold">{score}</span>
        <span className="text-sm">%</span>
      </div>
      <div className="text-[10px] font-medium uppercase tracking-wide">Match</div>
    </div>
  );
};
