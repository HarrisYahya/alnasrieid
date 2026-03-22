"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

export default function AdminPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [liveName, setLiveName] = useState("");
  const router = useRouter();

  const GOAL = 200;

  useEffect(() => {
    checkUser();
    fetchPatients();

    // 👀 Fake live activity (viral effect)
    const interval = setInterval(() => {
      const names = [
        "Ahmed", "Fatima", "Ali", "Ayan", "Hodan",
        "Yusuf", "Zahra", "Abdi", "Maryam", "Omar"
      ];
      const random = names[Math.floor(Math.random() * names.length)];
      setLiveName(random);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // 🔐 Check user
  const checkUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!user || error) {
      router.push("/login");
    }
  };

  // 📥 Fetch
  const fetchPatients = async () => {
    const { data } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setPatients(data);
  };

  // 🗑 Delete
  const handleDelete = async (id: string) => {
    await supabase.from("patients").delete().eq("id", id);
    fetchPatients();
  };

  // ✏️ Update
  const handleUpdate = async () => {
    await supabase
      .from("patients")
      .update({
        name: editing.name,
        phone: editing.phone,
        service: editing.service,
        location: editing.location,
      })
      .eq("id", editing.id);

    setEditing(null);
    fetchPatients();
  };

  // 📩 Mark as messaged (instant UI)
  const markAsMessaged = async (id: string) => {
    await supabase
      .from("patients")
      .update({ messaged: true })
      .eq("id", id);

    setPatients((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, messaged: true } : p
      )
    );
  };

  // 🔍 Filter
  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  // 📊 Stats
  const total = patients.length;
  const messagedCount = patients.filter((p) => p.messaged).length;
  const remaining = GOAL - messagedCount;
  const progress = Math.min((messagedCount / GOAL) * 100, 100);

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* Logout */}
      <button
        onClick={async () => {
          await signOut();
          router.push("/login");
        }}
        className="mb-4 bg-red-500 px-4 py-2 rounded hover:bg-red-400"
      >
        Logout
      </button>

      <h1 className="text-3xl text-cyan-400 mb-4 font-semibold">
        Admin Dashboard
      </h1>

      {/* 👀 Live activity */}
      {liveName && (
        <div className="mb-4 text-sm text-green-400 animate-pulse">
          🔥 {liveName} just registered!
        </div>
      )}

      {/* 📊 Stats + Progress */}
      <div className="mb-6 space-y-4">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-900 p-4 rounded-xl">
            <p className="text-gray-400 text-sm">Total</p>
            <h2 className="text-2xl font-bold">{total}</h2>
          </div>

          <div className="bg-gray-900 p-4 rounded-xl">
            <p className="text-gray-400 text-sm">Messaged</p>
            <h2 className="text-2xl font-bold text-green-400">
              {messagedCount}
            </h2>
          </div>

          <div className="bg-gray-900 p-4 rounded-xl">
            <p className="text-gray-400 text-sm">Remaining</p>
            <h2 className="text-2xl font-bold text-red-400">
              {remaining > 0 ? remaining : 0}
            </h2>
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress to {GOAL}</span>
            <span>{Math.floor(progress)}%</span>
          </div>

          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="bg-cyan-400 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

      </div>

      {/* Search */}
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 p-3 w-full max-w-md bg-gray-800 rounded"
      />

      {/* Table */}
       {/* 🧾 Premium Table */}
<div className="overflow-x-auto bg-gray-900 rounded-2xl border border-gray-700 shadow-xl">

  <table className="min-w-full text-sm">
    
    {/* Header */}
    <thead className="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
      <tr>
        <th className="px-6 py-4 text-left">Name</th>
        <th className="px-6 py-4 text-left">Service</th>
        <th className="px-6 py-4 text-left">Phone</th>
        <th className="px-6 py-4 text-left">Status</th>
        <th className="px-6 py-4 text-right">Actions</th>
      </tr>
    </thead>

    {/* Body */}
    <tbody className="divide-y divide-gray-800">
      {filtered.map((p) => (
        <tr
          key={p.id}
          className="hover:bg-gray-800/60 transition-all duration-200"
        >
          {/* Name */}
          <td className="px-6 py-4 font-medium text-white">
            {p.name}
          </td>

          {/* Service */}
          <td className="px-6 py-4 text-gray-400">
            {p.service}
          </td>

          {/* Phone */}
          <td className="px-6 py-4 text-gray-400">
            {p.phone}
          </td>

          {/* Status */}
          <td className="px-6 py-4">
            {p.messaged ? (
              <span className="px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-400 font-semibold">
                Sent ✅
              </span>
            ) : (
              <span className="px-3 py-1 text-xs rounded-full bg-red-500/20 text-red-400 font-semibold">
                Not Sent ❌
              </span>
            )}
          </td>

          {/* Actions */}
          <td className="px-6 py-4">
            <div className="flex justify-end gap-2">

              {/* Edit */}
              <button
                onClick={() => setEditing(p)}
                className="px-3 py-1.5 text-xs bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition"
              >
                Edit
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(p.id)}
                className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-400 transition"
              >
                Delete
              </button>

              {/* WhatsApp */}
          <a
  href={`https://wa.me/${p.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hello ${p.name}, we received your request for ${p.service}.`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => markAsMessaged(p.id)}
  className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-400 transition"
>
  WhatsApp
</a>

            </div>
          </td>

        </tr>
      ))}
    </tbody>

  </table>
</div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md">

            <input
              value={editing.name}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
            />

            <input
              value={editing.phone}
              onChange={(e) =>
                setEditing({ ...editing, phone: e.target.value })
              }
            />

            <div className="flex gap-3 mt-4">
              <button onClick={handleUpdate}>Save</button>
              <button onClick={() => setEditing(null)}>Cancel</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}