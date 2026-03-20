// Admin dashboard for managing patients
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

export default function AdminPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
    fetchPatients();
  }, []);

  // 🔐 Check admin
  const checkAdmin = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: admin } = await supabase
      .from("admins")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!admin) {
      router.push("/");
    }
  };

  // 📥 Fetch patients
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

  // 🔍 Filter
  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* Logout */}
      <button
        onClick={async () => {
          await signOut();
          router.push("/login");
        }}
        className="mb-4 bg-red-500 px-4 py-2 rounded"
      >
        Logout
      </button>

      <h1 className="text-3xl text-cyan-400 mb-4">
        Admin Dashboard
      </h1>

      {/* Search */}
      <input
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 p-3 w-full max-w-md bg-gray-800 rounded border border-cyan-400"
      />

      {/* Patients */}
      <div className="grid gap-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="p-4 bg-gray-900 rounded-xl border border-cyan-400"
          >
            <p><b>Name:</b> {p.name}</p>
            <p><b>Phone:</b> {p.phone}</p>
            <p><b>Service:</b> {p.service}</p>
            <p><b>Location:</b> {p.location}</p>

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => setEditing(p)}
                className="px-3 py-1 bg-yellow-400 text-black rounded"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(p.id)}
                className="px-3 py-1 bg-red-500 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md">

            <h2 className="text-xl mb-4 text-cyan-400">
              Edit Patient
            </h2>

            <input
              value={editing.name}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
              className="w-full mb-2 p-2 bg-gray-800"
            />

            <input
              value={editing.phone}
              onChange={(e) =>
                setEditing({ ...editing, phone: e.target.value })
              }
              className="w-full mb-2 p-2 bg-gray-800"
            />

            <input
              value={editing.service}
              onChange={(e) =>
                setEditing({ ...editing, service: e.target.value })
              }
              className="w-full mb-2 p-2 bg-gray-800"
            />

            <input
              value={editing.location}
              onChange={(e) =>
                setEditing({ ...editing, location: e.target.value })
              }
              className="w-full mb-4 p-2 bg-gray-800"
            />

            <div className="flex gap-3">
              <button
                onClick={handleUpdate}
                className="bg-cyan-400 text-black px-4 py-2 rounded"
              >
                Save
              </button>

              <button
                onClick={() => setEditing(null)}
                className="bg-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}