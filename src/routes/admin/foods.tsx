import { createFileRoute } from "@tanstack/react-router";
import { getFoods, deleteFood } from "@/lib/admin-api";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin/foods")({
  component: FoodsPage,
});

function FoodsPage() {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    getFoods().then(setFoods);
  }, []);

  const handleDelete = async (id: number) => {
    await deleteFood(id);
    setFoods((prev) => prev.filter((f: any) => f.id !== id));
  };

  return (
    <div>
      <h1>Foods</h1>

      {foods.map((f: any) => (
        <div key={f.id}>
          {f.foodName} - {f.foodCalories} kcal
          <button onClick={() => handleDelete(f.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}