import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui-bits";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface WeekChartDay {
  dateKey: string;
  label: string;
  calories: number;
  protein: number;
  weight?: number | null;
  calorieGoal?: number;
}

export interface WeekProgressChartProps {
  days: WeekChartDay[];
  proteinGoal?: number;
  title?: string;
  description?: string;
  emptyMessage?: string;
}

const chartConfig = {
  calories: {
    label: "Calories",
    color: "oklch(0.72 0.17 145)",
  },
  calorieGoal: {
    label: "Calorie goal",
    color: "oklch(0.65 0.04 130)",
  },
  protein: {
    label: "Protein",
    color: "oklch(0.78 0.16 70)",
  },
  weight: {
    label: "Weight",
    color: "oklch(0.72 0.16 350)",
  },
} satisfies ChartConfig;

type ChartRow = {
  label: string;
  calories: number | null;
  calorieGoal: number | null;
  protein: number | null;
  weight: number | null;
};

export function WeekProgressChart({
  days,
  proteinGoal = 128,
  title = "Weekly progress",
  description = "Lines: daily calories & protein · dashed: calorie goal · berry: weight (kg)",
  emptyMessage = "No data for this week yet. Log meals to see your progress.",
}: WeekProgressChartProps) {
  const chartData = useMemo<ChartRow[]>(
    () =>
      days.map((day) => ({
        label: day.label,
        calories: day.calories > 0 ? day.calories : null,
        calorieGoal:
          day.calorieGoal != null && day.calorieGoal > 0 ? day.calorieGoal : null,
        protein: day.protein > 0 ? day.protein : null,
        weight: day.weight != null && day.weight > 0 ? day.weight : null,
      })),
    [days],
  );

  const hasCalories = chartData.some((d) => d.calories != null);
  const hasProtein = chartData.some((d) => d.protein != null);
  const hasWeight = chartData.some((d) => d.weight != null);
  const hasGoal = chartData.some((d) => d.calorieGoal != null);

  const calDomainMax = useMemo(() => {
    const values = chartData.flatMap((d) =>
      [d.calories, d.calorieGoal].filter((v): v is number => v != null),
    );
    return Math.max(2200, ...values, 1);
  }, [chartData]);

  const proteinDomainMax = useMemo(
    () =>
      Math.max(
        proteinGoal,
        140,
        ...chartData.map((d) => d.protein ?? 0),
      ),
    [chartData, proteinGoal],
  );

  const weightDomain = useMemo(() => {
    const weights = chartData
      .map((d) => d.weight)
      .filter((w): w is number => w != null);
    if (!weights.length) return [0, 100] as [number, number];
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const pad = max === min ? 2 : (max - min) * 0.15;
    return [min - pad, max + pad] as [number, number];
  }, [chartData]);

  return (
    <Card>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-[var(--color-calories)]" /> Calories
          </span>
          {hasGoal && (
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded border border-dashed border-[var(--color-calorieGoal)] bg-transparent" />{" "}
              Goal
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-[var(--color-protein)]" /> Protein
          </span>
          {hasWeight && (
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded border border-dashed border-[var(--color-weight)] bg-transparent" />{" "}
              Weight
            </span>
          )}
        </div>
      </div>

      {!hasCalories && !hasWeight && !hasProtein ? (
        <p className="mt-12 py-16 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ChartContainer config={chartConfig} className="mt-8 aspect-auto h-56 w-full">
          <LineChart
            data={chartData}
            margin={{
              top: 8,
              right: hasWeight && hasProtein ? 52 : hasWeight || hasProtein ? 40 : 8,
              left: 4,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border/50" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-[11px]"
            />
            <YAxis
              yAxisId="cal"
              orientation="left"
              tickLine={false}
              axisLine={false}
              width={44}
              domain={[0, calDomainMax]}
              tickFormatter={(v) => `${v}`}
              className="text-[10px]"
            />
            {hasProtein && (
              <YAxis
                yAxisId="protein"
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={36}
                domain={[0, proteinDomainMax]}
                tickFormatter={(v) => `${v}g`}
                className="text-[10px]"
              />
            )}
            {hasWeight && (
              <YAxis
                yAxisId="weight"
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={40}
                domain={weightDomain}
                tickFormatter={(v) => `${Number(v).toFixed(1)}`}
                className="text-[10px]"
              />
            )}
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            {hasCalories && (
              <Line
                yAxisId="cal"
                type="monotone"
                dataKey="calories"
                name="calories"
                stroke="var(--color-calories)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--color-calories)", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            )}
            {hasGoal && (
              <Line
                yAxisId="cal"
                type="monotone"
                dataKey="calorieGoal"
                name="calorieGoal"
                stroke="var(--color-calorieGoal)"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                dot={false}
                connectNulls
              />
            )}
            {hasProtein && (
              <Line
                yAxisId="protein"
                type="monotone"
                dataKey="protein"
                name="protein"
                stroke="var(--color-protein)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--color-protein)", strokeWidth: 0 }}
                connectNulls={false}
              />
            )}
            {hasWeight && (
              <Line
                yAxisId="weight"
                type="monotone"
                dataKey="weight"
                name="weight"
                stroke="var(--color-weight)"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={{ r: 3, fill: "var(--color-weight)", strokeWidth: 0 }}
                connectNulls={false}
              />
            )}
          </LineChart>
        </ChartContainer>
      )}
    </Card>
  );
}
