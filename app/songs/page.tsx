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
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 NEW

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

  // 🔍 FILTER + SORT
  const filteredAndSortedSongs = songs
    .filter(song =>
      `${song.title} ${song.artist} ${song.category}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      (a.title || "").localeCompare(b.title || "")
    );

  return (
    <div className="min-h-screen bg-gray-50 relative font-sans">
      <NavbarTopRight />

      <div className="absolute top-4 left-4">
        <img src="/logo.png" alt="Church Logo" className="w-16 h-16 object-contain" />
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-500 mb-6 text-left">
          
        </h1>

        {/* 🔍 SEARCH BAR */}
        <input
          type="text"
          placeholder="Search song title, artist, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-6 px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="space-y-4">
          {filteredAndSortedSongs.map(song => {
            const steps = targetKey
              ? getTransposeSteps(song.original_key || "", targetKey)
              : 0;

            return (
              <div
                key={song.id}
                className="border rounded-xl shadow-sm bg-white hover:shadow-lg transition-shadow duration-200"
              >
                <button
                  onClick={() =>
                    setOpenSongId(openSongId === song.id ? null : song.id)
                  }
                  className="w-full flex justify-between items-center px-5 py-4 font-semibold text-lg text-blue-600 hover:bg-blue-50 rounded-t-xl"
                >
                  <span>
                    {song.title}{" "}
                    <span className="text-gray-500">({song.original_key})</span>
                  </span>
                  <span className="text-gray-400">
                    {openSongId === song.id ? "▲" : "▼"}
                  </span>
                </button>

                {openSongId === song.id && (
                  <div className="px-5 py-4 border-t bg-gray-50 rounded-b-xl">
                    {song.artist && (
                      <p className="text-sm text-gray-600 italic mb-1">
                        Artist: {song.artist}
                      </p>
                    )}
                    {song.category && (
                      <p className="text-sm text-gray-600 italic mb-3">
                        Category: {song.category}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {CHORDS.map(key => (
                        <button
                          key={key}
                          onClick={() => setTargetKey(key)}
                          className={`w-10 h-10 rounded-lg border font-medium
                            ${targetKey === key
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-100"
                            }`}
                        >
                          {key}
                        </button>
                      ))}
                    </div>

                    <pre className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded-lg border overflow-x-auto">
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
