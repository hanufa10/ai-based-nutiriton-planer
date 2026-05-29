export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodItem {
  foodId: number;
  foodName: string;
  foodCalories: number;
  foodProtein?: number;
  carbs?: number;
  fat?: number;
  category?: string | null;
  foodType?: string | null;
}

export interface MealPlanItem {
  mealPlanItemId: number;
  mealPlanId?: number;
  mealType: MealType;
  foodId: number;
  quantity: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string | null;
  food?: FoodItem;
}

export interface MealPlan {
  mealPlanId: number;
  userId: number;
  planDate: string;
  calorieGoal: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatGoal?: number;
  generatedBy?: string | null;
  items: MealPlanItem[];
}

export interface NutritionTargets {
  bmi: number;
  bmr: number;
  tdee: number;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  activityMultiplier?: number;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface GenerateMealPlanResponse {
  targets: NutritionTargets;
  totals: NutritionTotals;
  mealPlan: MealPlan;
  excludedFoods?: string[];
}

export interface MealLogItem {
  foodId: number;
  quantity: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  food?: FoodItem;
}

export interface MealLog {
  mealLogId: number;
  userId: number;
  logDate: string;
  mealType: MealType;
  caloriesConsumed: number;
  proteinConsumed?: number;
  carbsConsumed?: number;
  fatConsumed?: number;
  items: MealLogItem[];
}

export interface ProgressEntry {
  progressId: number;
  userId: number;
  weight?: number | null;
  BMI?: number | null;
  date: string;
}

export interface ProgressSummary {
  date: string;
  totalMeals: number;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  calorieGoal: number;
  adherencePct: number | null;
  trends: {
    weight: { date: string; value: number }[];
    bmi: { date: string; value: number }[];
  };
}
