import React, { useEffect, useState } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { LayoutDashboard, Utensils, Users, MessageSquare, ShieldAlert, Plus, Trash2, RefreshCw } from 'lucide-react';
import { adminApi } from '../lib/api/admin';
import { LogOut } from "lucide-react";
import { ApiError } from '../lib/api';
export const Route = createLazyFileRoute('/admin/dashboard')({
  component: AdminDashboardPanel,
});

function AdminDashboardPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'foods' | 'users' | 'feedback'>('overview');
  const [reports, setReports] = useState<any>(null);
  const [foods, setFoods] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null); // Holds the user to be deleted
  const [message, setMessage] = useState<string | null>(null); // For "User deleted successfully"
  const [editTarget, setEditTarget] = useState<any>(null);

  // Form State for POST /admin/foods
  const [newFood, setNewFood] = useState({
    foodName: '', foodCalories: 0, foodProtein: 0, carbs: 0, fat: 0, category: 'Breakfast', foodType: 'local'
  });

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const reportData = await adminApi.getReport();
      setReports(reportData);

      if (activeTab === 'foods') setFoods(await adminApi.getFoods());
      if (activeTab === 'users') {
        const userData = await adminApi.getUsers();
        setUsers(userData);
      }
      if (activeTab === 'feedback') setFeedback(await adminApi.getFeedback());
    } catch (err) {
      console.error("Failed fetching data", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const profile = localStorage.getItem("user_profile");

    if (!profile) {
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(profile);

    if (user.role !== "admin") {
      window.location.href = "/dashboard";
    }
  }, []);
  useEffect(() => { loadDashboardData(); }, [activeTab]);

  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createFood(newFood);
      setNewFood({ foodName: '', foodCalories: 0, foodProtein: 0, carbs: 0, fat: 0, category: 'Breakfast', foodType: 'local' });
      setFoods(await adminApi.getFoods());
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("Server returned an error:", err.message);
        console.error("Full error body:", err.body); // <-- THIS IS THE KEY
        alert(`Error: ${err.message}`);
      } else {
        console.error("Unexpected error:", err);
      }
    }
  };

  const handleDeleteFood = async (id: number) => {
    if (confirm('Delete this item from dataset?')) {
      await adminApi.deleteFood(id);
      setFoods(await adminApi.getFoods());
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fbfcfb] text-gray-800">
      {message && (
        <div className="fixed top-20 right-8 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50">
          {message}
        </div>
      )}
      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90]">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h3 className="font-bold text-lg text-gray-900">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to permanently remove <strong>{deleteTarget.label}</strong>?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (deleteTarget.type === 'user') {
                    await adminApi.deleteUser(deleteTarget.userId);
                    setUsers(await adminApi.getUsers());
                    setMessage(`User ${deleteTarget.username} deleted successfully.`);
                  } else if (deleteTarget.type === 'feedback') {
                    await adminApi.deleteFeedback(deleteTarget.id);
                    setFeedback(await adminApi.getFeedback());
                    setMessage("Feedback entry successfully removed.");
                  }
                  setDeleteTarget(null);
                  setTimeout(() => setMessage(null), 3000);
                }}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h3 className="font-bold text-lg text-gray-900">Edit User Details</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              // Ensure your API can handle the updated object
              await adminApi.updateUser(editTarget.userId, editTarget);
              setUsers(await adminApi.getUsers());
              setEditTarget(null);
              setMessage(`User ${editTarget.username} updated successfully.`);
              setTimeout(() => setMessage(null), 3000);
            }} className="space-y-4 mt-4">

              {/* Username Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Username</label>
                <input
                  value={editTarget.username}
                  onChange={(e) => setEditTarget({ ...editTarget, username: e.target.value })}
                  className="w-full border p-2 rounded-lg text-sm"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editTarget.email}
                  onChange={(e) => setEditTarget({ ...editTarget, email: e.target.value })}
                  className="w-full border p-2 rounded-lg text-sm"
                />
              </div>

              {/* Role Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">System Role</label>
                <select
                  value={editTarget.role}
                  onChange={(e) => setEditTarget({ ...editTarget, role: e.target.value })}
                  className="w-full border p-2 rounded-lg text-sm"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setEditTarget(null)} className="flex-1 py-2 border rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* SIDE NAVIGATION */}
      <aside className="w-[240px] bg-[#142314] text-gray-200 fixed h-full flex flex-col justify-between border-r border-emerald-950">
        <div>
          <div className="p-6 border-b border-emerald-900/30 flex items-center gap-2">
            {/* <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black">           */}
            <img
              src="/fav.png"
              alt="NutriSmart Logo"
              className="h-6 w-6 object-contain"
            />
            <h1 className="font-serif text-lg font-semibold tracking-tight whitespace-nowrap">
              Admin Dashboard
            </h1>
          </div>
          <nav className="p-4 space-y-1">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'overview' ? 'bg-emerald-600/20 text-emerald-400 font-bold' : 'text-gray-400 hover:bg-emerald-950'}`}>
              <LayoutDashboard size={16} /> Status Overview
            </button>
            <button onClick={() => setActiveTab('foods')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'foods' ? 'bg-emerald-600/20 text-emerald-400 font-bold' : 'text-gray-400 hover:bg-emerald-950'}`}>
              <Utensils size={16} /> Ethiopian Foods DB
            </button>
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'users' ? 'bg-emerald-600/20 text-emerald-400 font-bold' : 'text-gray-400 hover:bg-emerald-950'}`}>
              <Users size={16} /> User Directory
            </button>
            <button onClick={() => setActiveTab('feedback')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'feedback' ? 'bg-emerald-600/20 text-emerald-400 font-bold' : 'text-gray-400 hover:bg-emerald-950'}`}>
              <MessageSquare size={16} /> User Feedback
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-emerald-900/30 text-xs text-gray-500">
          NutriSmart API
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </aside>

      {/* CORE FRAME */}
      <div className="flex-1 pl-[240px]">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            System Operations / <span className="text-emerald-700">{activeTab}</span>
          </div>
          <button onClick={loadDashboardData} className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium bg-white hover:bg-gray-50 transition-colors">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Synchronize
          </button>
        </header>

        <main className="p-8 max-w-6xl mx-auto">

          {/* TAB 1: SYSTEM MONITORING OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Core Algorithmic Parameters Note */}
              <div className="bg-[#122512] text-emerald-100 p-5 rounded-xl border border-emerald-950 flex items-start gap-4">
                <div className="bg-emerald-800/40 p-2.5 rounded-lg text-base">⚙️</div>
                <div>
                  <h4 className="font-serif text-xl font-semibold text-white">
                    Operational overview
                  </h4>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    Stochastic constraints successfully enforced: <strong>Cosine-Similarity Matching</strong> engine is isolating generated targets against regional matrices. Frequency filtering prevents target repeats if a profile uses the target 4+ times inside rolling 7-day intervals.
                  </p>
                </div>
              </div>

              {/* API Reports Matrix /admin/reports */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <span className="text-sm font-medium text-gray-500">
                    Total users
                  </span>
                  <p className="text-2xl font-black text-gray-900 mt-1">{reports?.totalUsers ?? '...'}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <span className="text-sm font-medium text-gray-500">Foods in database</span>
                  <p className="text-2xl font-black text-gray-900 mt-1">{reports?.totalFoods ?? '...'}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <span className="text-sm font-medium text-gray-500">Active Plans Tracked</span>
                  <p className="text-2xl font-black text-gray-900 mt-1">{reports?.activePlansToday ?? '...'}</p>
                </div>
              </div>

              {/* Cron Run Parameters */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <ShieldAlert size={14} className="text-amber-500" /> Internal Automation Daemon Logs
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs border-t border-gray-50 pt-4">
                  <div>
                    <span className="text-gray-400">Engine Regenerator Target Cron:</span>
                    <p className="font-bold text-gray-800 mt-0.5">Every day at 05:00 AM</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Last Successful Global Execution:</span>
                    <p className="font-medium text-emerald-700 mt-0.5">{reports?.lastCronRun || 'Today at 5:00 AM'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FOOD MANAGEMENT (POST/DELETE /admin/foods) */}
          {activeTab === 'foods' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Insert Form */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Plus size={16} className="text-emerald-600" /> Populate Food Repository
                </h3>
                <form onSubmit={handleCreateFood} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-500 mb-1">Food Name (e.g., Injera, Shiro, etc.)</label>
                    <input type="text" required value={newFood.foodName} onChange={e => setNewFood({ ...newFood, foodName: e.target.value })} className="w-full border p-2 rounded-md outline-emerald-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-500 mb-1">Calories (kcal)</label>
                      <input type="number" value={newFood.foodCalories} onChange={e => setNewFood({ ...newFood, foodCalories: parseInt(e.target.value) || 0 })} className="w-full border p-2 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Protein (g)</label>
                      <input type="number" value={newFood.foodProtein} onChange={e => setNewFood({ ...newFood, foodProtein: parseInt(e.target.value) || 0 })} className="w-full border p-2 rounded-md" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-500 mb-1">Carbs (g)</label>
                      <input type="number" value={newFood.carbs} onChange={e => setNewFood({ ...newFood, carbs: parseInt(e.target.value) || 0 })} className="w-full border p-2 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Fat (g)</label>
                      <input type="number" value={newFood.fat} onChange={e => setNewFood({ ...newFood, fat: parseInt(e.target.value) || 0 })} className="w-full border p-2 rounded-md" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-emerald-700 text-white font-semibold p-2.5 rounded-md mt-2 hover:bg-emerald-800 transition-colors">
                    Commit to Database
                  </button>
                </form>
              </div>

              {/* Food Dataset Output Render */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Active Dataset Entries</h3>
                </div>
                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                  {foods.length === 0 ? (
                    <p className="p-4 text-xs text-gray-400">No active custom food definitions found. Use the editor frame to create entries.</p>
                  ) : foods.map((food: any) => (
                    <div key={food.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50/50">
                      <div>
                        <h4 className="font-bold text-gray-900">{food.foodName}</h4>
                        <p className="text-gray-400 mt-0.5">
                          C: {food.carbs}g · P: {food.foodProtein}g · F: {food.fat}g — <span className="italic">{food.foodCalories} kcal</span>
                        </p>
                      </div>
                      <button onClick={() => handleDeleteFood(food.id)} className="text-gray-400 hover:text-rose-600 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USER DIRECTORY (GET/DELETE /admin/users) */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Deletion Confirmation Modal */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="p-4">User ID</th>
                    <th className="p-4">Profile Credentials</th>
                    <th className="p-4">System Privileges</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user: any) => (
                    <tr key={user.userId} className="hover:bg-gray-50/40">
                      <td className="p-4 font-mono text-gray-400">#{user.userId}</td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{user.username}</div>
                        <div className="text-gray-400 mt-0.5">{user.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 font-bold rounded-md uppercase tracking-wide text-[10px] ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setEditTarget(user)} // Trigger Edit Modal
                          className="text-orange-400 hover:text-emerald-600 font-medium mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="text-gray-400 hover:text-rose-600 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: USER FEEDBACK STREAM (GET /admin/feedback) */}
          {/* {activeTab === 'feedback' && (
            <div className="space-y-3">
              {feedback.length === 0 ? (
                <div className="bg-white p-8 border rounded-xl text-center text-xs text-gray-400">
                  No tracking logs or user recommendations have been submitted yet.
                </div>
              ) : feedback.map((item: any) => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200/60 flex flex-col gap-2 shadow-2xs text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-500">User Profile Reference: #{item.userId}</span>
                    <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">★ {item.rating} / 5</span>
                  </div>
                  <p className="text-gray-800 leading-relaxed italic">"{item.comment}"</p>
                </div>
              ))}
            </div>
          )} */}

          {/* TAB 4: USER FEEDBACK STREAM (GET /admin/feedback) */}
          {activeTab === 'feedback' && (
            <div className="space-y-3">
              {feedback.length === 0 ? (
                <div className="bg-white p-8 border rounded-xl text-center text-xs text-gray-400">
                  No tracking logs or user recommendations have been submitted yet.
                </div>
              ) : (
                feedback.map((item: any) => (
                  <div
                    key={item.feedbackId}
                    className="bg-white p-4 rounded-xl border border-gray-200/60 flex flex-col gap-2 shadow-2xs text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-500">
                        User Profile Reference: #{item.userId}
                      </span>

                      <div className="flex items-center gap-3">
                        <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          ★ {item.rating} / 5
                        </span>

                        <button
                          onClick={() => setDeleteTarget({ type: 'feedback', id: item.feedbackId, label: `feedback #${item.feedbackId}` })}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-800 leading-relaxed italic">
                      "{item.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>
          )}


        </main>
      </div>
    </div>
  );
}