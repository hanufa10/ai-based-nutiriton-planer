import { createFileRoute } from "@tanstack/react-router";
import { getUsers, deleteUser } from "@/lib/admin-api";
import { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
}
export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

useEffect(() => {
  getUsers().then((data) => setUsers(data as User[]));
}, []);

const handleDelete = async (id: number) => {
  try {
    await deleteUser(id);

    setUsers((prev) => prev.filter((u) => u.id !== id));
  } catch (err) {
    console.error(err);
  }
};
  return (
    <div>
      <h1>Users</h1>

      {users.map((u: User) => (
        <div key={u.id}>
          {u.username} - {u.role}
          <button onClick={() => handleDelete(u.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}