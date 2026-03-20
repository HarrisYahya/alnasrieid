// Main patient registration page with form and real-time count
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function Page() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: "",
    location: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage("");

    try {
      // 🔢 Count patients
      const { count } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true });

      if ((count || 0) >= 200) {
        setMessage("❌ Registration closed. 200 patients reached.");
        return;
      }

      // 🔍 Check duplicate phone
      const { data: existing } = await supabase
        .from("patients")
        .select("phone")
        .eq("phone", form.phone)
        .maybeSingle();

      if (existing) {
        setMessage("⚠️ Phone already registered");
        return;
      }

      // ➕ Insert patient
      const { error } = await supabase.from("patients").insert(form);
      if (error) throw error;

      // 🔢 Get updated count
      const { count: newCount } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true });

      const remaining = 200 - (newCount || 0);

      setMessage(
        `🎉 Eid Mubarak ${form.name}! You are registered successfully. ${remaining} spots left out of 200.`
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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full bg-gray-900/50 p-8 rounded-3xl shadow-[0_0_40px_#00fff7]">

        <h1 className="text-center text-4xl font-bold text-cyan-400 mb-4">
          ALNASRI DENTAL
        </h1>

        <p className="text-center text-gray-300 mb-4">
          🎊 Eid Special Offer — Limited to 200 Patients
        </p>

        {message && (
          <p className="text-center text-cyan-300 mb-4">{message}</p>
        )}

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
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
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
            className="w-full py-3 rounded-xl bg-cyan-400 text-black font-bold"
          >
            Register
          </button>

        </form>
      </div>
    </div>
  );
}