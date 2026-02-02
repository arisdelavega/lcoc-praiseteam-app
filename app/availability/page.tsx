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

type MusicianAssignment = {
  id: number;
  date: string;
  instrument: string;
  musician_name: string;
  created_at: string;
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

  const instruments = ["Drum", "Bass", "Guitar", "Acoustic", "Organ", "Pinagkitan"];

  // Musician
  const [musicianDate, setMusicianDate] = useState<string>("");
  const [musiciansPerInstrument, setMusiciansPerInstrument] = useState<{ [key: string]: string }>({});
  const [musicianLoading, setMusicianLoading] = useState<boolean>(false);
  const [musicianMessage, setMusicianMessage] = useState<string>("");
  const [musicianAssignments, setMusicianAssignments] = useState<MusicianAssignment[]>([]);
  const [editingMusicianDate, setEditingMusicianDate] = useState<string | null>(null);

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    const storedName = localStorage.getItem("myName");
    if (storedName) setMyName(storedName);
    fetchAllAvailability();
    fetchMusicianAssignments();
  }, []);

  // --- Utility to format date correctly ---
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // --- Fetch Availability ---
  const fetchAllAvailability = async () => {
    const today = formatDate(new Date());
    const { data, error } = await supabase
      .from("availability")
      .select("*")
      .gte("date", today)
      .order("date", { ascending: true });
    if (error) console.error(error);
    if (data) setSummaryList(data as Availability[]);
  };

  // --- Fetch Musician Assignments ---
  const fetchMusicianAssignments = async () => {
    const today = formatDate(new Date());
    const { data, error } = await supabase
      .from("musician_assignment")
      .select("*")
      .gte("date", today)
      .order("date", { ascending: true });
    if (error) console.error(error);
    if (data) setMusicianAssignments(data as MusicianAssignment[]);
  };

  // --- Save Availability ---
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
      if (error) setMessage("Error updating entry ❌");
      else {
        setMessage("Entry updated ✅");
        setEditingId(null);
        setDate(""); setInstrument(""); setAvailable(true);
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
      if (error) setMessage("Error saving availability ❌");
      else {
        setMessage("Availability saved ✅");
        localStorage.setItem("myName", fullName.trim());
        setMyName(fullName.trim());
        setDate(""); setInstrument(""); setAvailable(true);
        fetchAllAvailability();
      }
    }
    setLoading(false);
  };

  // --- Delete / Edit ---
  const deleteAvailability = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    const { error } = await supabase.from("availability").delete().eq("id", id);
    if (error) setMessage("Error deleting ❌");
    else { setMessage("Entry deleted ✅"); fetchAllAvailability(); }
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
    setDate(""); setInstrument(""); setAvailable(true); setFullName(""); setMessage("");
  };

  // --- Calendar Logic ---
  const generateMonthGrid = (month: Date) => {
    const year = month.getFullYear();
    const mon = month.getMonth();
    const firstDay = new Date(year, mon, 1);
    const lastDay = new Date(year, mon + 1, 0);
    const grid: (Availability[] | null)[][] = [];
    let week: (Availability[] | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) week.push(null);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = formatDate(new Date(year, mon, day));
      const entriesForDay = summaryList.filter((e) => e.date === dateStr);
      week.push(entriesForDay.length ? entriesForDay : null);
      if (week.length === 7) { grid.push(week); week = []; }
    }
    while (week.length < 7 && week.length !== 0) week.push(null);
    if (week.length) grid.push(week);

    return grid;
  };

  const calendarGrid = generateMonthGrid(currentMonth);
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });
  const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  // --- Navigation ---
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1));

  // --- Musician Assignments Save / Edit / Delete ---
  const saveMusicianAssignment = async () => {
    if (!musicianDate) { setMusicianMessage("Select a date."); return; }
    const assignments = Object.entries(musiciansPerInstrument)
      .filter(([_, name]) => name.trim() !== "")
      .map(([instrument, musician_name]) => ({ date: musicianDate, instrument, musician_name: musician_name.trim() }));
    if (!assignments.length) { setMusicianMessage("Enter at least one musician."); return; }
    setMusicianLoading(true); setMusicianMessage("");

    try {
      if (editingMusicianDate) await supabase.from("musician_assignment").delete().eq("date", editingMusicianDate);
      const { error } = await supabase.from("musician_assignment").insert(assignments);
      if (error) throw error;
      setMusicianMessage("Musician assignments saved ✅");
      setMusicianDate(""); setMusiciansPerInstrument({}); setEditingMusicianDate(null);
      fetchMusicianAssignments();
    } catch (err) { console.error(err); setMusicianMessage("Error saving ❌"); }

    setMusicianLoading(false);
  };

  const deleteMusician = async (date: string) => {
    if (!window.confirm("Delete all musicians for this date?")) return;
    const { error } = await supabase.from("musician_assignment").delete().eq("date", date);
    if (error) setMusicianMessage("Error deleting ❌"); else { setMusicianMessage("Deleted ✅"); fetchMusicianAssignments(); }
  };

  const editMusician = (date: string) => {
    const assignmentsForDate = musicianAssignments.filter((m) => m.date === date);
    const newMap: { [key: string]: string } = {};
    assignmentsForDate.forEach((m) => { newMap[m.instrument] = m.musician_name; });
    setMusicianDate(date); setMusiciansPerInstrument(newMap); setEditingMusicianDate(date);
  };

  const isToday = (dayNumber: number | null) => {
    if (!dayNumber) return false;
    const today = new Date();
    return today.getDate() === dayNumber &&
           today.getMonth() === currentMonth.getMonth() &&
           today.getFullYear() === currentMonth.getFullYear();
  };

  const instrumentColor = (inst: string | null) => {
    switch(inst) {
      case "Drum": return "text-red-400";
      case "Bass": return "text-green-400";
      case "Guitar": return "text-yellow-400";
      case "Acoustic": return "text-orange-400";
      case "Organ": return "text-purple-400";
      case "Pinagkitan": return "text-pink-400";
      default: return "text-gray-100";
    }
  };

  // --- Render ---
  return (
    <div className="bg-gray-900 min-h-screen text-gray-100 p-4 relative">
      <NavbarTopRight />
      <div className="max-w-5xl mx-auto mt-20 p-6 border rounded shadow bg-gray-800">
        <h1 className="text-2xl font-bold mb-4">My Availability</h1>

        {/* --- Form --- */}
        <div className="mb-6">
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border px-3 py-2 mb-2 w-full rounded bg-gray-700 text-gray-100" />
          <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your Name" disabled={!!editingId} className="border px-3 py-2 mb-2 w-full rounded bg-gray-700 text-gray-100" />
          <select value={instrument} onChange={e=>setInstrument(e.target.value)} className="border px-3 py-2 mb-2 w-full rounded bg-gray-700 text-gray-100">
            <option value="">-- Select Instrument --</option>
            {instruments.map(inst=><option key={inst} value={inst}>{inst}</option>)}
          </select>
          <label className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked={available} onChange={e=>setAvailable(e.target.checked)} className="w-4 h-4 accent-blue-500" /> Available
          </label>
          <div className="flex gap-2 mb-2">
            <button onClick={saveAvailability} disabled={!date||!fullName||loading} className="bg-blue-600 px-4 py-2 rounded w-full">{loading ? "Saving..." : editingId?"Update":"Save"}</button>
            {editingId && <button onClick={cancelEdit} className="bg-gray-500 px-4 py-2 rounded w-full">Cancel</button>}
          </div>
          {message && <p className="text-sm">{message}</p>}
        </div>

        {/* --- Calendar --- */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <button onClick={prevMonth} className="px-3 py-1 bg-gray-700 rounded">Prev</button>
            <h2 className="text-xl font-semibold">{monthName}</h2>
            <button onClick={nextMonth} className="px-3 py-1 bg-gray-700 rounded">Next</button>
          </div>
          <div className="grid grid-cols-7 text-center font-semibold mb-1">{weekdays.map(d=><div key={d}>{d}</div>)}</div>
          {calendarGrid.map((week, i) =>
            <div key={i} className="grid grid-cols-7 gap-1 mb-1">
              {week.map((entries, j) => {
                const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                const dayNumber = (() => {
                  if (!entries) {
                    const weekIndex = i;
                    const dayIndex = j;
                    const dateNum = weekIndex * 7 + dayIndex - firstDay.getDay() + 1;
                    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                    if (dateNum < 1 || dateNum > lastDayOfMonth) return null;
                    return dateNum;
                  } else {
                    return parseInt(entries[0].date.split("-")[2]);
                  }
                })();

                return (
                  <div key={j} className={`border rounded p-2 flex flex-col justify-start items-start overflow-hidden text-xs
                    ${entries?.some(e => e.full_name === myName) ? "bg-yellow-600 text-gray-900" :
                      isToday(dayNumber) ? "bg-blue-500 text-white" : "bg-gray-700"}`}>
                    <span className="font-semibold">{dayNumber}</span>
                    <div className="overflow-y-auto max-h-36 w-full mt-1">
                      {entries?.map(e => (
                        <div key={e.id} className="mt-1 border-b border-gray-600 pb-1">
                          <span className={`${instrumentColor(e.instrument)}`}>{e.instrument ? e.instrument + " 🎸" : ""}</span><br/>
                          <span className="font-semibold">{e.full_name}</span>
                          <div className="flex gap-1 mt-1">
                            {e.full_name === myName && <>
                              <button onClick={() => startEdit(e)} className="text-green-400 text-xs">Edit</button>
                              <button onClick={() => deleteAvailability(e.id)} className="text-red-500 text-xs">Delete</button>
                            </>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {entries?.length ? <span className="text-xs mt-1">{entries.length} Available</span> : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- Musician Assignments --- */}
        <div className="border-t border-gray-700 pt-4">
          <h2 className="font-semibold mb-2 text-xl">Musician Assignments</h2>
          <input type="date" value={musicianDate} onChange={e=>setMusicianDate(e.target.value)} className="border px-3 py-2 mb-2 w-full rounded bg-gray-700 text-gray-100" />
          <div className="grid grid-cols-2 gap-2 mb-2">
            {instruments.map(inst => (
              <div key={inst}>
                <label className="font-semibold">{inst}</label>
                <input type="text" placeholder={`Enter ${inst}`} value={musiciansPerInstrument[inst] || ""}
                  onChange={e => setMusiciansPerInstrument(prev => ({ ...prev, [inst]: e.target.value }))}
                  className="border px-2 py-1 w-full rounded bg-gray-700 text-gray-100"/>
              </div>
            ))}
          </div>
          <button onClick={saveMusicianAssignment} disabled={!musicianDate || musicianLoading} className="bg-green-600 px-4 py-2 rounded w-full hover:bg-green-500 transition">
            {musicianLoading ? "Saving..." : editingMusicianDate ? "Update All" : "Save All"}
          </button>
          {musicianMessage && <p className="text-sm mt-1">{musicianMessage}</p>}

          {musicianAssignments.length > 0 && (
            <div className="mt-4 space-y-2">
              {Array.from(new Set(musicianAssignments.map(m => m.date)))
                .sort()
                .map(date => {
                  const assigns = musicianAssignments.filter(m => m.date === date);
                  return (
                    <div key={date} className="border rounded p-3 bg-gray-800 hover:bg-gray-700 transition">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-lg">{date}</span>
                        <div className="flex gap-1">
                          <button onClick={() => editMusician(date)} className="text-green-400 text-xs">Edit</button>
                          <button onClick={() => deleteMusician(date)} className="text-red-500 text-xs">Delete</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {instruments.map(inst => {
                          const m = assigns.find(a => a.instrument === inst);
                          return (
                            <div key={inst} className={`p-1 rounded ${m ? "bg-gray-700" : "bg-gray-900"} ${instrumentColor(inst)}`}>
                              <span className="font-semibold">{inst}:</span> {m ? m.musician_name : "-"}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
