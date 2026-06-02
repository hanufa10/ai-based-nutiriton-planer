import { createFileRoute } from "@tanstack/react-router";
import { getFoods, deleteFood } from "@/lib/admin-api";
import { useEffect, useState } from "react";
interface FoodItem {
  foodId: number;
  foodName: string;
  foodCalories: number;
  foodProtein: number;
  carbs: number;
  fat: number;
  category: string;
  foodType: string | null;
}
export const Route = createFileRoute("/admin/foods")({
  component: FoodsPage,
});

function FoodsPage() {
  const [foods, setFoods] = useState<FoodItem[]>([]);


useEffect(() => {
  getFoods().then((data) => setFoods(data as FoodItem[]));
}, []);
  const handleDelete = async (foodId: number) => {
    await deleteFood(foodId);
    setFoods((prev) => prev.filter((f) => f.foodId !== foodId));
  };

  return (
    <div>
      <h1>Foods</h1>

      {foods.map((f) => (
        <div key={f.foodId}>
          {f.foodName} - {f.foodCalories} kcal
          <button onClick={() => handleDelete(f.foodId)}>Delete</button>
        </div>
      ))}
    </div>
  );
}