"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import NavbarTopRight from "../../components/NavbarTopRight";

type Availability = {
  id: number;
  user_id: string | null;
  date: string;
  available: boolean;
  full_name: string;
  instrument: string | null;
};

type GroupedAvailability = {
  month: string;
  entries: Availability[];
};

export default function AvailabilityPage() {
  const [date, setDate] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [instrument, setInstrument] = useState<string>("");
  const [available, setAvailable] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [summaryList, setSummaryList] = useState<Availability[]>([]);
  const [myName, setMyName] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const instruments = ["Drum", "Bass", "Guitar", "Acoustic", "Organ"];

  useEffect(() => {
    const storedName = localStorage.getItem("myName");
    if (storedName) setMyName(storedName);
  }, []);

  const fetchAllAvailability = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("availability")
      .select("*")
      .gte("date", today)
      .order("date", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }
    if (data) setSummaryList(data as Availability[]);
  };

  useEffect(() => {
    fetchAllAvailability();
  }, []);

  const saveAvailability = async () => {
    if (!date || !fullName.trim()) {
      setMessage("Please enter your name and select a date.");
      return;
    }

    setLoading(true);
    setMessage("");

    if (editingId) {
      const { error } = await supabase
        .from("availability")
        .update({ date, instrument: instrument || null, available })
        .eq("id", editingId);

      if (error) {
        console.error(error);
        setMessage("Error updating entry ❌");
      } else {
        setMessage("Entry updated ✅");
        setEditingId(null);
        setDate("");
        setInstrument("");
        setAvailable(true);
        fetchAllAvailability();
      }
    } else {
      const { error } = await supabase.from("availability").insert({
        user_id: null,
        date,
        available,
        full_name: fullName.trim(),
        instrument: instrument || null,
      });

      if (error) {
        console.error(error);
        setMessage("Error saving availability ❌");
      } else {
        setMessage("Availability saved ✅");
        localStorage.setItem("myName", fullName.trim());
        setMyName(fullName.trim());
        setDate("");
        setInstrument("");
        setAvailable(true);
        fetchAllAvailability();
      }
    }

    setLoading(false);
  };

  const deleteAvailability = async (id: number) => {
    const confirm = window.confirm("Are you sure you want to delete this entry?");
    if (!confirm) return;

    const { error } = await supabase.from("availability").delete().eq("id", id);
    if (error) {
      console.error(error);
      setMessage("Error deleting entry ❌");
    } else {
      setMessage("Entry deleted ✅");
      fetchAllAvailability();
    }
  };

  const startEdit = (entry: Availability) => {
    setEditingId(entry.id);
    setDate(entry.date);
    setInstrument(entry.instrument || "");
    setAvailable(entry.available);
    setFullName(entry.full_name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDate("");
    setInstrument("");
    setAvailable(true);
    setFullName("");
    setMessage("");
  };

  // Group by month with nearest month first
  const grouped: GroupedAvailability[] = [];
  const monthMap: { [month: string]: Availability[] } = {};

  summaryList.forEach((entry) => {
    const dateObj = new Date(entry.date);
    const monthKey = dateObj.toLocaleString("default", { month: "long", year: "numeric" });
    if (!monthMap[monthKey]) monthMap[monthKey] = [];
    monthMap[monthKey].push(entry);
  });

  // Sort months by nearest first
  const sortedMonths = Object.keys(monthMap).sort((a, b) => {
    const aDate = new Date(monthMap[a][0].date);
    const bDate = new Date(monthMap[b][0].date);
    return aDate.getTime() - bDate.getTime();
  });

  sortedMonths.forEach((month) => {
    grouped.push({ month, entries: monthMap[month] });
  });

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100 p-4 relative">
      <NavbarTopRight />

      <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow bg-gray-800">
        <h1 className="text-2xl font-bold mb-4">My Availability</h1>

        <label className="block mb-2 text-sm font-medium">Select Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border px-3 py-2 w-full mb-4 rounded bg-gray-700 text-gray-100"
        />

        <label className="block mb-2 text-sm font-medium">Your Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Type your name"
          className="border px-3 py-2 w-full mb-4 rounded bg-gray-700 text-gray-100"
          disabled={!!editingId}
        />

        <label className="block mb-2 text-sm font-medium">Instrument</label>
        <select
          value={instrument}
          onChange={(e) => setInstrument(e.target.value)}
          className="border px-3 py-2 w-full mb-4 rounded bg-gray-700 text-gray-100"
        >
          <option value="">-- Select Instrument --</option>
          {instruments.map((inst) => (
            <option key={inst} value={inst}>{inst}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            className="w-4 h-4 accent-blue-500"
          />
          Available
        </label>

        <div className="flex gap-2 mb-3">
          <button
            onClick={saveAvailability}
            disabled={!date || !fullName || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
          >
            {loading ? "Saving..." : editingId ? "Update" : "Save"}
          </button>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="bg-gray-500 text-white px-4 py-2 rounded w-full"
            >
              Cancel
            </button>
          )}
        </div>

        {message && <p className="mt-1 text-sm">{message}</p>}

        {/* Grouped Availability */}
        <div className="mt-6">
          <h2 className="font-semibold mb-2">All Availability Summary</h2>
          {grouped.length > 0 ? (
            grouped.map((group) => (
              <div key={group.month} className="mb-4">
                <h3 className="font-semibold text-lg mb-1">{group.month}</h3>
                <ul>
                  {group.entries.map((entry) => {
                    const isYou = entry.full_name === myName;
                    return (
                      <li
                        key={entry.id}
                        className={`flex justify-between items-center border-b border-gray-700 py-1 px-2 ${
                          isYou ? "bg-yellow-600 text-white" : ""
                        }`}
                      >
                        <div>
                          {entry.full_name} ({entry.instrument || "no instrument"}) - {entry.date}
                          {isYou ? " (You)" : ""}
                        </div>
                        <div className="flex gap-2">
                          <span>{entry.available ? "✅ Available" : "❌ Not available"}</span>
                          {isYou && (
                            <>
                              <button
                                onClick={() => startEdit(entry)}
                                className="text-green-400 hover:underline text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteAvailability(entry.id)}
                                className="text-red-500 hover:underline text-sm"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No availability saved yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
