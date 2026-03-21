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
    checkUser();
    fetchPatients();
  }, []);

  // 🔐 Check user login only
  const checkUser = async () => {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (!user || userError) {
      router.push("/login");
      return;
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

  // 🗑 Delete patient
  const handleDelete = async (id: string) => {
    await supabase.from("patients").delete().eq("id", id);
    fetchPatients();
  };

  // ✏️ Update patient
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

  // 📩 Mark as messaged
  const markAsMessaged = async (id: string) => {
    await supabase
      .from("patients")
      .update({ messaged: true })
      .eq("id", id);

    fetchPatients();
  };

  // 🔍 Filter patients
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
        className="mb-4 bg-red-500 px-4 py-2 rounded hover:bg-red-400 transition-colors"
      >
        Logout
      </button>

      <h1 className="text-3xl text-cyan-400 mb-4 font-semibold">
        Admin Dashboard
      </h1>

      {/* Search */}
      <input
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 p-3 w-full max-w-md bg-gray-800 rounded border border-cyan-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />

      {/* Patients Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-2xl border border-gray-700 shadow-lg">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-cyan-400 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-cyan-400 uppercase">Service</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-cyan-400 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-cyan-400 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-cyan-400 uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 text-white">{p.name}</td>
                <td className="px-6 py-4 text-gray-300">{p.service}</td>
                <td className="px-6 py-4 text-gray-300">{p.phone}</td>

                {/* ✅ Status Column */}
                <td className="px-6 py-4">
                  {p.messaged ? (
                    <span className="text-green-400 font-semibold">Sent ✅</span>
                  ) : (
                    <span className="text-red-400 font-semibold">Not Sent ❌</span>
                  )}
                </td>

                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button
                    onClick={() => setEditing(p)}
                    className="px-3 py-1 bg-yellow-400 text-black rounded-lg text-sm hover:bg-yellow-300 transition-colors"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1 bg-red-500 rounded-lg text-sm hover:bg-red-400 transition-colors"
                  >
                    Delete
                  </button>

                  {/* 📩 WhatsApp Button */}
                  <a
                    href={`https://wa.me/${p.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `*Hambalyo!* 🎉
Waxaad ka mid tahay guulaystayaasha. 
qiimihii ramadanka ayaana lagugu shaqayn doona
Soo booqo xarunta i.n waan ku soo dhaweyn doonaa.
Wixii su’aal ah ee aad qabtid, noo reeb i.n waan ku soo jawaabi doonaa. 🤲`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => markAsMessaged(p.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-400 transition-colors"
                  >
                    WhatsApp
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md shadow-lg">
            <h2 className="text-xl mb-4 text-cyan-400 font-semibold">
              Edit Patient
            </h2>

            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="w-full mb-2 p-2 bg-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Name"
            />

            <input
              value={editing.service}
              onChange={(e) => setEditing({ ...editing, service: e.target.value })}
              className="w-full mb-2 p-2 bg-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Service"
            />

            <input
              value={editing.phone}
              onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
              className="w-full mb-2 p-2 bg-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Phone"
            />

            <input
              value={editing.location}
              onChange={(e) => setEditing({ ...editing, location: e.target.value })}
              className="w-full mb-4 p-2 bg-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Location"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleUpdate}
                className="bg-cyan-400 text-black px-4 py-2 rounded-lg hover:bg-cyan-300 transition-colors"
              >
                Save
              </button>

              <button
                onClick={() => setEditing(null)}
                className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
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
