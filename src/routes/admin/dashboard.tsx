import { createFileRoute } from "@tanstack/react-router";
import { getReports } from "@/lib/admin-api";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getReports().then(setData);
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}