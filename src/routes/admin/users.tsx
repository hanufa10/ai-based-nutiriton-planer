import { createFileRoute } from "@tanstack/react-router";
import { getUsers, deleteUser } from "@/lib/admin-api";
import { useEffect, useState } from "react";

export const Route = createFileRoute("src/routes/admin/users.tsx")({
  component: UsersPage,
});

function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const handleDelete = async (id: number) => {
    await deleteUser(id);
    setUsers((prev) => prev.filter((u: any) => u.id !== id));
  };

  return (
    <div>
      <h1>Users</h1>

      {users.map((u: any) => (
        <div key={u.id}>
          {u.username} - {u.role}
          <button onClick={() => handleDelete(u.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}