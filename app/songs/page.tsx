"use client";

import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";
import NavbarTopRight from "../../components/NavbarTopRight";

type Song = {
  id: string;
  title: string;
  original_key: string;
  lyrics: string;
  artist?: string;
  category?: string;
};

const CHORDS = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"];

function transposeChord(chord: string, steps: number): string {
  const match = chord.match(/^([A-G]#?)(.*)$/);
  if (!match) return chord;
  const [_, root, suffix] = match;
  const index = CHORDS.indexOf(root);
  if (index === -1) return chord;
  const newIndex = (index + steps + CHORDS.length) % CHORDS.length;
  return CHORDS[newIndex] + suffix;
}

function transposeLyrics(lyrics: string, steps: number): string {
  return lyrics
    .split("\n")
    .map(line =>
      line
        .split(" ")
        .map(word => transposeChord(word, steps))
        .join(" ")
    )
    .join("\n");
}

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [openSongId, setOpenSongId] = useState<string | null>(null);
  const [targetKey, setTargetKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(true); // ✅ default dark

  useEffect(() => {
    async function loadSongs() {
      const { data, error } = await supabase.from("songs").select("*");
      if (error) {
        console.error("Supabase error:", error.message, error.code, error.details);
      } else {
        setSongs(data || []);
      }
    }
    loadSongs();
  }, []);

  function getTransposeSteps(original: string, target: string): number {
    const origIndex = CHORDS.indexOf(original);
    const targetIndex = CHORDS.indexOf(target);
    if (origIndex === -1 || targetIndex === -1) return 0;
    return targetIndex - origIndex;
  }

  const filteredAndSortedSongs = songs
    .filter(song =>
      `${song.title} ${song.artist} ${song.category}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      (a.title || "").localeCompare(b.title || "")
    );

  // ✅ Dynamic classes for dark/light mode
  const bgClass = darkMode ? "bg-gray-900" : "bg-gray-50";
  const textClass = darkMode ? "text-white" : "text-gray-900";
  const preBgClass = darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900";
  const borderClass = darkMode ? "border-gray-700" : "border-gray-300";
  const inputBgClass = darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-300";
  const buttonBgClass = darkMode ? "bg-gray-700 text-gray-200 hover:bg-blue-600" : "bg-gray-200 text-gray-900 hover:bg-blue-300";

  return (
    <div className={`min-h-screen relative font-sans ${bgClass} ${textClass}`}>
      <NavbarTopRight />

      <div className="absolute top-4 left-4">
        <img src="/logo.png" alt="Church Logo" className="w-16 h-16 object-contain" />
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-400">🎵 Songs Library</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded border border-gray-400 hover:bg-gray-500 hover:text-white transition"
          >
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <input
          type="text"
          placeholder="Search song title, artist, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full mb-6 px-4 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputBgClass}`}
        />

        <div className="space-y-4">
          {filteredAndSortedSongs.map(song => {
            const steps = targetKey
              ? getTransposeSteps(song.original_key || "", targetKey)
              : 0;

            return (
              <div
                key={song.id}
                className={`border rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 ${bgClass} ${borderClass}`}
              >
                <button
                  onClick={() =>
                    setOpenSongId(openSongId === song.id ? null : song.id)
                  }
                  className={`w-full flex justify-between items-center px-5 py-4 font-semibold text-lg text-blue-300 hover:bg-gray-700 rounded-t-xl`}
                >
                  <span>
                    {song.title}{" "}
                    <span className="text-gray-400">({song.original_key})</span>
                  </span>
                  <span className="text-gray-500">
                    {openSongId === song.id ? "▲" : "▼"}
                  </span>
                </button>

                {openSongId === song.id && (
                  <div className={`px-5 py-4 border-t rounded-b-xl ${bgClass} ${borderClass}`}>
                    {song.artist && (
                      <p className="text-sm text-gray-400 italic mb-1">
                        Artist: {song.artist}
                      </p>
                    )}
                    {song.category && (
                      <p className="text-sm text-gray-400 italic mb-3">
                        Category: {song.category}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {CHORDS.map(key => (
                        <button
                          key={key}
                          onClick={() => setTargetKey(key)}
                          className={`w-10 h-10 rounded-lg border font-medium ${targetKey === key
                            ? "bg-blue-600 text-white border-blue-600"
                            : buttonBgClass
                          }`}
                        >
                          {key}
                        </button>
                      ))}
                    </div>

                    <pre className={`whitespace-pre-wrap text-sm p-3 rounded border antialiased ${preBgClass} ${borderClass}`}>
                      {transposeLyrics(song.lyrics || "", steps)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
