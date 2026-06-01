import { createFileRoute } from "@tanstack/react-router";
import { getFoods, deleteFood } from "@/lib/admin-api";
import { useEffect, useState } from "react";
interface FoodItem {
  id: number;
  foodName: string;
  foodCalories: number;
  foodProtein: number;
  carbs: number;
  fat: number;
  category: string;
  foodType: string;
}
export const Route = createFileRoute("/admin/foods")({
  component: FoodsPage,
});

function FoodsPage() {
  const [foods, setFoods] = useState<FoodItem[]>([]);


useEffect(() => {
  getFoods().then((data) => setFoods(data as FoodItem[]));
}, []);
  const handleDelete = async (id: number) => {
    await deleteFood(id);
    setFoods((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div>
      <h1>Foods</h1>

      {foods.map((f) => (
        <div key={f.id}>
          {f.foodName} - {f.foodCalories} kcal
          <button onClick={() => handleDelete(f.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}