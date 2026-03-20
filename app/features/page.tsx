// app/features/page.tsx
import modelData from "@/data/model.json";
import type { ModelData } from "@/lib/types";
import FeatureChart from "@/components/FeatureChart";

export default function FeaturesPage() {
  const model = modelData as ModelData;

  // Top 5 by absolute coefficient
  const top5 = model.features
    .map((f, i) => ({
      feature: f,
      label: model.labels[f] || f,
      coefficient: model.coefficients[i],
      absCoefficient: Math.abs(model.coefficients[i]),
    }))
    .sort((a, b) => b.absCoefficient - a.absCoefficient)
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-bold">Feature Importance</h1>
      <p className="text-gray-400 text-sm mt-1">
        How much weight does each stat carry in the model&apos;s predictions?
      </p>

      <div className="mt-8">
        <FeatureChart model={model} />
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h2 className="text-xl font-semibold mb-2">How to Read This Chart</h2>
        <p className="text-gray-400 text-sm">
          Each bar represents a stat the model uses to predict winners.
          Longer bars = more influence.{" "}
          <span className="text-teal-400">Teal (right)</span> = higher value
          favors winning.{" "}
          <span className="text-violet-400">Purple (left)</span> = higher value
          correlates with losing.
        </p>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h2 className="text-xl font-semibold mb-4">Top 5 Predictors</h2>
        <div className="space-y-4">
          {top5.map((entry) => (
            <div key={entry.feature}>
              <p className="font-medium">
                {entry.label}{" "}
                <span className="text-xs text-gray-500 font-mono">
                  (weight: {entry.absCoefficient.toFixed(3)})
                </span>
              </p>
              <p className="text-sm text-gray-400">
                {model.explanations[entry.label] || ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
