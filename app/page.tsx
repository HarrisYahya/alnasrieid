"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

const MAX_PATIENTS = 200;

// 🔐 Mask phone
const maskPhone = (phone: string) => {
  if (phone.length < 6) return "****";
  return phone.slice(0, 2) + "****" + phone.slice(-2);
};

export default function Page() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: "",
    location: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [recent, setRecent] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [popup, setPopup] = useState<any>(null);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📡 Fetch data
  const fetchData = async () => {
    const { count } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true });

    const { data } = await supabase
      .from("patients")
      .select("name, phone")
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) {
      setRecent(data);

      // 🎯 show popup randomly
      if (data.length > 0) {
        const random = data[Math.floor(Math.random() * data.length)];
        setPopup(random);

        setTimeout(() => setPopup(null), 3000);
      }
    }

    setCount(count || 0);
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🚀 Submit
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (count >= MAX_PATIENTS) {
        setMessage("❌ Registration closed. 200 patients reached.");
        return;
      }

      const { data: existing } = await supabase
        .from("patients")
        .select("phone")
        .eq("phone", form.phone)
        .maybeSingle();

      if (existing) {
        setMessage("⚠️ Phone already registered");
        return;
      }

      const { error } = await supabase.from("patients").insert(form);
      if (error) throw error;

      const newCount = count + 1;
      const remaining = MAX_PATIENTS - newCount;

      // ⚡ instant UI update
      setCount(newCount);
      setRecent([{ ...form }, ...recent.slice(0, 4)]);

      setMessage(
        `🎉 Eid Mubarak ${form.name}! You are registered. ${remaining} spots left.`
      );

      setForm({
        name: "",
        phone: "",
        service: "",
        location: "",
      });

    } catch (err) {
      console.error(err);
      setMessage("❌ Error saving data");
    } finally {
      setLoading(false);
    }
  };

  const progress = (count / MAX_PATIENTS) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative">

      {/* 🔥 POPUP */}
      {popup && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-cyan-400 text-black px-4 py-2 rounded-xl shadow-lg animate-bounce text-sm">
          {popup.name} just registered 🎉
        </div>
      )}

      <div className="max-w-md w-full bg-gray-900/50 p-8 rounded-3xl shadow-[0_0_40px_#00fff7]">

        <h1 className="text-center text-4xl font-bold text-cyan-400 mb-4">
          ALNASRI DENTAL
        </h1>

        <p className="text-center text-gray-300 mb-2">
          🎊 Eid Special Offer — Limited to 200 Patients
        </p>

        {/* 📊 Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>{count} registered</span>
            <span>{MAX_PATIENTS}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="bg-cyan-400 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {message && (
          <p className="text-center text-cyan-300 mb-4">{message}</p>
        )}

        {/* 👀 Recent */}
        <div className="mb-6">
          <h2 className="text-center text-cyan-400 mb-2 text-lg">
            🔥 Live Registrations
          </h2>

          <div className="space-y-2 max-h-40 overflow-hidden">
            {recent.map((p, i) => (
              <div
                key={i}
                className="flex justify-between bg-gray-800 px-3 py-2 rounded-lg text-sm text-gray-300 animate-pulse"
              >
                <span>{p.name}</span>
                <span>{maskPhone(p.phone)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 📝 FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="name"
            placeholder="Patient Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-800 text-white border border-cyan-400"
            required
          />

          <input
  name="phone"
  placeholder="Phone Number (e.g. 0612345678)"
  value={form.phone}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ""); // allow numbers only
    setForm({ ...form, phone: value });
  }}
  className="w-full p-3 rounded-xl bg-gray-800 text-white border border-cyan-400"
  required
/>

          <select
            name="service"
            value={form.service}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-800 text-white border border-cyan-400"
            required
          >
            <option value="">Select Service</option>
            <option>Gelin</option>
            <option>Dhaqid</option>
            <option>Buuxin</option>
            <option>Composite</option>
            <option>Direct Veneers</option>
            <option>Biro xirasho</option>
          </select>

          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-800 text-white border border-cyan-400"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold transition ${
              loading
                ? "bg-gray-500 text-white cursor-not-allowed"
                : "bg-cyan-400 text-black hover:bg-cyan-300"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>
      </div>
    </div>
  );
}