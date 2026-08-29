import type { AnalysisDimension } from "../../contracts/analysis";

export function calculateOverallScore(dimensions: AnalysisDimension[]) {
  const activeDimensions = dimensions.filter((dimension) => dimension.weight > 0);
  const weightTotal = activeDimensions.reduce(
    (total, dimension) => total + dimension.weight,
    0,
  );

  if (weightTotal === 0) return 0;

  const weightedScore = activeDimensions.reduce(
    (total, dimension) => total + dimension.score * dimension.weight,
    0,
  );

  return Math.round(weightedScore / weightTotal);
}

export function getScoreLabel(score: number) {
  if (score >= 80) return "Aderência forte";
  if (score >= 65) return "Boa base";
  if (score >= 45) return "Aderência parcial";
  return "Poucas evidências";
}
