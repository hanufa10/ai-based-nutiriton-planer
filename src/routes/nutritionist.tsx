import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { adminApi } from '../lib/api/admin';

export const Route = createFileRoute('/nutritionist')({
  component: NutritionistDashboard,
});
function NutritionistDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'manage' | 'profile'>('manage');
  const [allFoods, setAllFoods] = useState<any[]>([]);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [editingFood, setEditingFood] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState({ username: '', email: '', password: '' });
  const [newFood, setNewFood] = useState({ foodName: "", foodCalories: 0, foodProtein: 0, carbs: 0, fat: 0, category: "", foodType: "" });

  const loadData = async () => {
    try {
      const data = await adminApi.getFoods();
      setAllFoods(data);
      setPendingItems([...data].slice(-5));
    } catch (err) {
      console.error("Failed to fetch foods", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };
  const handleLogout = () => {
    localStorage.removeItem("user_profile"); // Adjust key based on your storage
    navigate({ to: "/login" });
  };
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminApi.createFood(newFood);
    triggerSuccess("Food added successfully.");
    setIsAdding(false);
    setNewFood({ foodName: "", foodCalories: 0, foodProtein: 0, carbs: 0, fat: 0, category: "", foodType: "" });
    loadData();
  };
  const handleDecision = async (foodId: number, action: 'approve' | 'reject') => {
    const updatedPending = pendingItems.filter(item => item.foodId !== foodId);
    setPendingItems(updatedPending);
    if (action === 'reject') {
      await adminApi.deleteFood(foodId);
      triggerSuccess("Food rejected and removed.");
    } else {
      triggerSuccess("Food approved.");
    }
    loadData();
  };

  const handleDelete = async (foodId: number) => {
    if (window.confirm("Are you sure you want to delete this food item?")) {
      await adminApi.deleteFood(foodId);
      triggerSuccess("Food deleted successfully.");
      loadData();
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminApi.updateFood(editingFood.foodId, editingFood);
    triggerSuccess("Food updated successfully.");
    setEditingFood(null);
    loadData();
  };
  const updateProfileApi = async (userId: string, data: any) => {
    const token = localStorage.getItem("token"); // OR localStorage.getItem("auth_token")
    const response = await fetch(`https://nutiplanner-api-2.onrender.com/user/${userId}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update profile");
    return response.json();
  };
  useEffect(() => {
    loadData();
    const storedUser = localStorage.getItem("user_profile");
    if (storedUser) {
      setProfile(JSON.parse(storedUser));
    }
  }, []);
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const storedUser = JSON.parse(localStorage.getItem("user_profile") || "{}");
      
      const payload = {
        username: profile.username,
        email: profile.email,
        role: storedUser.role || "nutritionist", // Keep existing role
        password: profile.password // If empty, handle on backend or add check
      };

      await updateProfileApi(storedUser.userId, payload);
      
      // Update local storage
      localStorage.setItem("user_profile", JSON.stringify({ ...storedUser, ...payload }));
      triggerSuccess("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
     <aside className="w-64 bg-[#142314] text-white p-6 flex flex-col h-screen sticky top-0">
          <div className="flex items-center gap-2 mb-10">
          <img src="/fav.png" alt="Logo" className="h-8 w-8" />
          <h1 className="font-bold text-lg">NutriSmart</h1>
        </div>
        <nav className="space-y-4">
          <button 
            onClick={() => setActiveTab('manage')}
            className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'manage' ? 'bg-emerald-600' : 'hover:bg-emerald-900'}`}
          >
            Manage Food DB
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'profile' ? 'bg-emerald-600' : 'hover:bg-emerald-900'}`}
          >
            Edit Profile
          </button>
        </nav>
        <button 
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 mt-auto text-red-300 hover:text-red-100 border-t border-emerald-900 pt-4"
        >
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
        {success && <div className="mb-4 p-3 bg-emerald-100 text-emerald-800 rounded font-bold">{success}</div>}

        {activeTab === 'manage' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Food Inventory</h2>
              <button onClick={() => setIsAdding(true)} className="bg-emerald-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-emerald-700">
                + Add New Food
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 uppercase text-xs">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Cal</th>
                    <th className="p-4">Protein</th>
                    <th className="p-4">Carbs</th>
                    <th className="p-4">Fat</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allFoods.map((food) => (
                    <tr key={food.foodId}>
                      <td className="p-4">{food.foodName}</td>
                      <td className="p-4">{food.foodCalories}</td>
                      <td className="p-4">{food.foodProtein}</td>
                      <td className="p-4">{food.carbs}</td>
                      <td className="p-4">{food.fat}</td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => setEditingFood(food)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(food.foodId)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {isAdding && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-lg w-full max-w-md space-y-3">
              <h3 className="font-bold text-lg">Add New Food</h3>
              <input className="w-full border p-2 rounded" placeholder="Name" onChange={e => setNewFood({...newFood, foodName: e.target.value})} />
              <input className="w-full border p-2 rounded" type="number" placeholder="Calories" onChange={e => setNewFood({...newFood, foodCalories: Number(e.target.value)})} />
              <input className="w-full border p-2 rounded" type="number" placeholder="Protein" onChange={e => setNewFood({...newFood, foodProtein: Number(e.target.value)})} />
              <input className="w-full border p-2 rounded" type="number" placeholder="Carbs" onChange={e => setNewFood({...newFood, carbs: Number(e.target.value)})} />
              <input className="w-full border p-2 rounded" type="number" placeholder="Fat" onChange={e => setNewFood({...newFood, fat: Number(e.target.value)})} />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded">Create Food</button>
                <button type="button" onClick={() => setIsAdding(false)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        )}
        {activeTab === 'profile' && (
  <div className="max-w-md bg-white p-6 rounded-lg shadow-sm border">
    <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
    <form onSubmit={handleProfileSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <input 
          className="w-full border p-2 rounded mt-1" 
          value={profile.username}
          onChange={e => setProfile({...profile, username: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input 
          className="w-full border p-2 rounded mt-1" 
          type="email"
          value={profile.email}
          onChange={e => setProfile({...profile, email: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">New Password</label>
        <input 
          className="w-full border p-2 rounded mt-1" 
          type="password" 
          placeholder="Leave blank to keep current"
          onChange={e => setProfile({...profile, password: e.target.value})}
        />
      </div>
      <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded font-bold hover:bg-emerald-700">
        Save Profile Changes
      </button>
    </form>
  </div>
)}

        {/* EDIT MODAL */}
        {editingFood && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <form onSubmit={handleEditSubmit} className="bg-white p-6 rounded-lg w-full max-w-md space-y-3">
              <h3 className="font-bold text-lg">Edit Food</h3>
              <input className="w-full border p-2 rounded" placeholder="Name" value={editingFood.foodName} onChange={e => setEditingFood({...editingFood, foodName: e.target.value})} />
              <input className="w-full border p-2 rounded" type="number" placeholder="Calories" value={editingFood.foodCalories} onChange={e => setEditingFood({...editingFood, foodCalories: Number(e.target.value)})} />
              <input className="w-full border p-2 rounded" type="number" placeholder="Protein" value={editingFood.foodProtein} onChange={e => setEditingFood({...editingFood, foodProtein: Number(e.target.value)})} />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded">Save Changes</button>
                <button type="button" onClick={() => setEditingFood(null)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}