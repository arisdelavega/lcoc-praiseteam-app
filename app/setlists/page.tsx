"use client";

import { supabase } from "../../lib/supabaseClient";
import { useState, useEffect } from "react";
import NavbarTopRight from "../../components/NavbarTopRight";

export default function SetlistsPage() {
  const [songs, setSongs] = useState<any[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [setlists, setSetlists] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [songSearch, setSongSearch] = useState("");

  // Musicians
  const [drummer, setDrummer] = useState("");
  const [guitar, setGuitar] = useState("");
  const [acoustic, setAcoustic] = useState("");
  const [piano, setPiano] = useState("");
  const [bass, setBass] = useState("");

  // For edit modal
  const [editingSetlist, setEditingSetlist] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editSelectedSongs, setEditSelectedSongs] = useState<string[]>([]);
  const [originalSongs, setOriginalSongs] = useState<string[]>([]);
  const [editSongSearch, setEditSongSearch] = useState("");
  const [editDrummer, setEditDrummer] = useState("");
  const [editGuitar, setEditGuitar] = useState("");
  const [editAcoustic, setEditAcoustic] = useState("");
  const [editPiano, setEditPiano] = useState("");
  const [editBass, setEditBass] = useState("");

  // Track expanded setlist
  const [expandedSetlist, setExpandedSetlist] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: songData } = await supabase.from("songs").select("*");
    setSongs(songData || []);

    const { data: setlistData } = await supabase
      .from("setlists")
      .select(
        "id, date, name, drummer, guitar, acoustic, piano, bass, setlist_songs(song_id, songs(title, lyrics))"
      )
      .order("date", { ascending: false });

    setSetlists(setlistData || []);
  }

  async function createSetlist() {
    const { data: setlist, error } = await supabase
      .from("setlists")
      .insert([{ date, name, drummer, guitar, acoustic, piano, bass }])
      .select()
      .single();

    if (error) {
      setMessage({ type: "error", text: "❌ Failed to create setlist." });
      return;
    }

    const rows = selectedSongs.map((songId, index) => ({
      setlist_id: setlist.id,
      song_id: songId,
      position: index,
    }));

    if (rows.length > 0) {
      await supabase.from("setlist_songs").insert(rows);
    }

    setMessage({ type: "success", text: "✅ Setlist created successfully!" });
    setDate("");
    setName("");
    setSelectedSongs([]);
    setSongSearch("");
    setDrummer("");
    setGuitar("");
    setAcoustic("");
    setPiano("");
    setBass("");
    await loadData();
  }

  async function deleteSetlist(id: string) {
    await supabase.from("setlists").delete().eq("id", id);
    setMessage({ type: "success", text: "🗑️ Setlist deleted." });
    await loadData();
  }

  async function saveEdit() {
    if (!editingSetlist) return;

    // Update setlist info
    const { error: updateError } = await supabase
      .from("setlists")
      .update({
        name: editName,
        date: editDate,
        drummer: editDrummer,
        guitar: editGuitar,
        acoustic: editAcoustic,
        piano: editPiano,
        bass: editBass,
      })
      .eq("id", editingSetlist.id);

    if (updateError) {
      setMessage({ type: "error", text: "❌ Failed to update setlist." });
      return;
    }

    // Update songs if changed
    const isSongsChanged =
      originalSongs.length !== editSelectedSongs.length ||
      !originalSongs.every((id, idx) => id === editSelectedSongs[idx]);

    if (isSongsChanged) {
      await supabase.from("setlist_songs").delete().eq("setlist_id", editingSetlist.id);

      const rows = editSelectedSongs.map((songId, index) => ({
        setlist_id: editingSetlist.id,
        song_id: songId,
        position: index,
      }));

      if (rows.length > 0) {
        await supabase.from("setlist_songs").insert(rows);
      }
    }

    setMessage({ type: "success", text: "✏️ Setlist updated." });
    setEditingSetlist(null);
    await loadData();
  }

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(songSearch.toLowerCase())
  );

  const filteredEditSongs = songs.filter(song =>
    song.title.toLowerCase().includes(editSongSearch.toLowerCase())
  );

  function moveSong(setlistId: string, idx: number, direction: "up" | "down") {
    setSetlists(prev =>
      prev.map(sl => {
        if (sl.id !== setlistId) return sl;
        const newSongs = [...sl.setlist_songs];
        if (direction === "up" && idx > 0) {
          [newSongs[idx - 1], newSongs[idx]] = [newSongs[idx], newSongs[idx - 1]];
        } else if (direction === "down" && idx < newSongs.length - 1) {
          [newSongs[idx + 1], newSongs[idx]] = [newSongs[idx], newSongs[idx + 1]];
        }
        return { ...sl, setlist_songs: newSongs };
      })
    );
  }

  // ---------------- Word Export Function ----------------
  async function exportSetlistToWord(setlist: any) {
    const { Document, Packer, Paragraph, TextRun } = await import("docx");
    const { saveAs } = await import("file-saver");

    const paragraphs: any[] = [];

    // Title
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: setlist.name || "Untitled Setlist",
            bold: true,
            size: 32,
          }),
        ],
        spacing: { after: 300 },
      })
    );

    // Date
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Date: ${setlist.date}`,
            italics: true,
          }),
        ],
        spacing: { after: 300 },
      })
    );

    // Musicians
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text:
              `Guitar: ${setlist.guitar || "-"} | ` +
              `Drummer: ${setlist.drummer || "-"} | ` +
              `Piano: ${setlist.piano || "-"} | ` +
              `Acoustic: ${setlist.acoustic || "-"} | ` +
              `Bass: ${setlist.bass || "-"}`,
          }),
        ],
        spacing: { after: 400 },
      })
    );

    // Songs & lyrics
    setlist.setlist_songs.forEach((s: any, index: number) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${s.songs.title}`,
              bold: true,
            }),
          ],
          spacing: { before: 300, after: 100 },
        })
      );

      if (s.songs.lyrics) {
        s.songs.lyrics.split("\n").forEach((line: string) => {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: line })],
            })
          );
        });
      }
    });

    const doc = new Document({
      sections: [{ children: paragraphs }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${setlist.name || "setlist"}.docx`);
  }

  return (
    <div className="min-h-screen bg-gray-900 relative text-white">
      <NavbarTopRight />
     

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-blue-400 mb-6"></h1>

        {/* Create new setlist */}
        <div className="bg-gray-800 shadow-lg rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Create New Setlist</h2>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-600 rounded-lg px-3 py-2 mb-2 bg-gray-900 text-white focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Setlist name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-600 rounded-lg px-3 py-2 mb-2 bg-gray-900 text-white focus:ring-2 focus:ring-blue-400"
          />

          {/* Musicians */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input type="text" placeholder="Drummer" value={drummer} onChange={e => setDrummer(e.target.value)}
              className="border border-gray-600 rounded-lg px-2 py-1 bg-gray-900 text-white focus:ring-2 focus:ring-blue-400" />
            <input type="text" placeholder="Guitar" value={guitar} onChange={e => setGuitar(e.target.value)}
              className="border border-gray-600 rounded-lg px-2 py-1 bg-gray-900 text-white focus:ring-2 focus:ring-blue-400" />
            <input type="text" placeholder="Acoustic" value={acoustic} onChange={e => setAcoustic(e.target.value)}
              className="border border-gray-600 rounded-lg px-2 py-1 bg-gray-900 text-white focus:ring-2 focus:ring-blue-400" />
            <input type="text" placeholder="Piano" value={piano} onChange={e => setPiano(e.target.value)}
              className="border border-gray-600 rounded-lg px-2 py-1 bg-gray-900 text-white focus:ring-2 focus:ring-blue-400" />
            <input type="text" placeholder="Bass" value={bass} onChange={e => setBass(e.target.value)}
              className="border border-gray-600 rounded-lg px-2 py-1 bg-gray-900 text-white focus:ring-2 focus:ring-blue-400" />
          </div>

          <input type="text" placeholder="Search songs..." value={songSearch} onChange={e => setSongSearch(e.target.value)}
            className="w-full border border-gray-600 rounded-lg px-3 py-2 mb-2 bg-gray-900 text-white focus:ring-2 focus:ring-blue-400" />

          <div className="max-h-40 overflow-y-auto border border-gray-700 rounded-lg p-3 bg-gray-800 mb-4">
            {filteredSongs.map(song => (
              <label key={song.id} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={selectedSongs.includes(song.id)}
                  onChange={e => {
                    if (e.target.checked)
                      setSelectedSongs(prev => prev.includes(song.id) ? prev : [...prev, song.id]);
                    else
                      setSelectedSongs(prev => prev.filter(id => id !== song.id));
                  }}
                  className="accent-blue-500"
                />
                <span>{song.title}</span>
              </label>
            ))}
          </div>

          <button onClick={createSetlist}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
            💾 Save Setlist
          </button>

          {message && (
            <div className={`mt-3 text-sm px-4 py-2 rounded-lg ${message.type === "success" ? "bg-green-900 text-green-400 border border-green-700" : "bg-red-900 text-red-400 border border-red-700"}`}>
              {message.text}
            </div>
          )}
        </div>

        {/* Existing setlists */}
        <div className="space-y-4">
          {setlists.map(setlist => (
            <div key={setlist.id} className="bg-gray-800 shadow-md rounded-lg p-5 border border-gray-700 hover:shadow-xl transition">
              <div className="flex justify-between cursor-pointer" onClick={() => setExpandedSetlist(expandedSetlist === setlist.id ? null : setlist.id)}>
                <h2 className="text-lg font-semibold text-blue-400">
                  {setlist.name || "Untitled"} — <span className="text-gray-400">{setlist.date}</span>
                </h2>
                <span className="text-gray-400">{expandedSetlist === setlist.id ? "▲" : "▼"}</span>
              </div>

              {expandedSetlist === setlist.id && (
                <div className="mt-2">
                  <p className="text-sm text-gray-300">
                    🎸 Guitar: {setlist.guitar || "-"} | 🥁 Drummer: {setlist.drummer || "-"} | 🎹 Piano: {setlist.piano || "-"} | 🎻 Acoustic: {setlist.acoustic || "-"} | 🎸 Bass: {setlist.bass || "-"}
                  </p>

                  <ul className="list-decimal ml-6 mt-2 text-gray-200">
                    {setlist.setlist_songs.map((s: any, idx: number) => (
                      <li key={s.song_id} className="mb-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="font-semibold">{s.songs.title}</p>
                            {s.songs.lyrics && <pre className="whitespace-pre-wrap text-sm bg-gray-700 p-2 rounded mt-1 border border-gray-600">{s.songs.lyrics}</pre>}
                          </div>
                          <div className="flex flex-col gap-1">
                            <button disabled={idx === 0} onClick={() => moveSong(setlist.id, idx, "up")}
                              className="bg-gray-600 px-2 rounded hover:bg-gray-500">↑</button>
                            <button disabled={idx === setlist.setlist_songs.length - 1} onClick={() => moveSong(setlist.id, idx, "down")}
                              className="bg-gray-600 px-2 rounded hover:bg-gray-500">↓</button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <button onClick={() => exportSetlistToWord(setlist)}
                    className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                    📄 Export Word
                  </button>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button onClick={() => {
                  setEditingSetlist(setlist);
                  setEditName(setlist.name || "");
                  setEditDate(setlist.date || "");
                  setEditSelectedSongs((setlist.setlist_songs || []).map((s: any) => s.song_id));
                  setOriginalSongs((setlist.setlist_songs || []).map((s: any) => s.song_id));
                  setEditDrummer(setlist.drummer || "");
                  setEditGuitar(setlist.guitar || "");
                  setEditAcoustic(setlist.acoustic || "");
                  setEditPiano(setlist.piano || "");
                  setEditBass(setlist.bass || "");
                }}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition">✏️ Edit</button>
                <button onClick={() => deleteSetlist(setlist.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingSetlist && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-96 shadow-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">Edit Setlist</h2>
            <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)}
              className="w-full border border-gray-600 rounded-lg px-3 py-2 mb-2 bg-gray-800 text-white focus:ring-2 focus:ring-blue-400" />
            <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
              className="w-full border border-gray-600 rounded-lg px-3 py-2 mb-2 bg-gray-800 text-white focus:ring-2 focus:ring-blue-400" />

            {/* Musicians */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input type="text" placeholder="Drummer" value={editDrummer} onChange={e => setEditDrummer(e.target.value)}
                className="border border-gray-600 rounded-lg px-2 py-1 bg-gray-800 text-white focus:ring-2 focus:ring-blue-400" />
              <input type="text" placeholder="Guitar" value={editGuitar} onChange={e => setEditGuitar(e.target.value)}
                className="border border-gray-600 rounded-lg px-2 py-1 bg-gray-800 text-white focus:ring-2 focus:ring-blue-400" />
              <input type="text" placeholder="Acoustic" value={editAcoustic} onChange={e => setEditAcoustic(e.target.value)}
                className="border border-gray-600 rounded-lg px-2 py-1 bg-gray-800 text-white focus:ring-2 focus:ring-blue-400" />
              <input type="text" placeholder="Piano" value={editPiano} onChange={e => setEditPiano(e.target.value)}
                className="border border-gray-600 rounded-lg px-2 py-1 bg-gray-800 text-white focus:ring-2 focus:ring-blue-400" />
              <input type="text" placeholder="Bass" value={editBass} onChange={e => setEditBass(e.target.value)}
                className="border border-gray-600 rounded-lg px-2 py-1 bg-gray-800 text-white focus:ring-2 focus:ring-blue-400" />
            </div>

            <input type="text" placeholder="Search songs..." value={editSongSearch} onChange={e => setEditSongSearch(e.target.value)}
              className="w-full border border-gray-600 rounded-lg px-3 py-2 mb-2 bg-gray-800 text-white focus:ring-2 focus:ring-blue-400" />

            <div className="max-h-40 overflow-y-auto border border-gray-700 rounded-lg p-3 bg-gray-800 mb-4">
              {filteredEditSongs.map(song => (
                <label key={song.id} className="flex items-center gap-2 py-1">
                  <input type="checkbox" checked={editSelectedSongs.includes(song.id)} onChange={e => {
                    if (e.target.checked)
                      setEditSelectedSongs(prev => prev.includes(song.id) ? prev : [...prev, song.id]);
                    else
                      setEditSelectedSongs(prev => prev.filter(id => id !== song.id));
                  }} className="accent-blue-500" />
                  <span>{song.title}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditingSetlist(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition">Cancel</button>
              <button onClick={saveEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
