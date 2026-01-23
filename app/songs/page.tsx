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

/**
 * Convert TAB characters to spaces (VERY IMPORTANT)
 */
function normalizeTabs(text: string, tabSize = 4) {
  return text.replace(/\t/g, " ".repeat(tabSize));
}

/**
 * Transpose a single chord safely
 */
function transposeChord(chord: string, steps: number): string {
  const match = chord.match(/^([A-G])(#|b)?(.*)$/);
  if (!match) return chord;

  const root = match[1] + (match[2] || "");
  const suffix = match[3] || "";

  const index = CHORDS.indexOf(root);
  if (index === -1) return chord;

  const newIndex = (index + steps + CHORDS.length) % CHORDS.length;
  return CHORDS[newIndex] + suffix;
}

/**
 * Transpose lyrics while preserving spacing & alignment
 */
function transposeLyrics(lyrics: string, steps: number): string {
  const chordRegex =
    /\b([A-G])(#|b)?(m|maj|min|dim|aug|sus\d*)?(?:\d*)?\b/g;

  return normalizeTabs(lyrics)
    .split("\n")
    .map(line => {
      // Only touch chord-looking lines
      if (!/^[A-G#bm\d\s\/]+$/.test(line.trim())) return line;

      return line.replace(chordRegex, (match) =>
        transposeChord(match, steps)
      );
    })
    .join("\n");
}

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [openSongId, setOpenSongId] = useState<string | null>(null);
  const [targetKey, setTargetKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadSongs() {
      const { data, error } = await supabase.from("songs").select("*");
      if (error) {
        console.error("Supabase error:", error.message);
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

  const filteredSongs = songs
    .filter(song =>
      `${song.title} ${song.artist} ${song.category}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (a.title || "").localeCompare(b.title || ""));

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <NavbarTopRight />

      <div className="max-w-4xl mx-auto p-6">
        <input
          type="text"
          placeholder="Search song title, artist, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-6 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-400"
        />

        <div className="space-y-4">
          {filteredSongs.map(song => {
            const steps = targetKey
              ? getTransposeSteps(song.original_key || "", targetKey)
              : 0;

            return (
              <div
                key={song.id}
                className="border border-gray-700 rounded-xl"
              >
                <button
                  onClick={() =>
                    setOpenSongId(openSongId === song.id ? null : song.id)
                  }
                  className="w-full flex justify-between px-5 py-4 text-lg font-semibold text-blue-300 hover:bg-gray-700 rounded-t-xl"
                >
                  <span>
                    {song.title}{" "}
                    <span className="text-gray-400">
                      ({song.original_key})
                    </span>
                  </span>
                  <span>{openSongId === song.id ? "▲" : "▼"}</span>
                </button>

                {openSongId === song.id && (
                  <div className="px-5 py-4 border-t border-gray-700">
                    {song.artist && (
                      <p className="text-sm text-gray-400 italic">
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
                          className={`w-10 h-10 rounded-lg border font-medium ${
                            targetKey === key
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-gray-700 text-gray-200 border-gray-600 hover:bg-blue-600"
                          }`}
                        >
                          {key}
                        </button>
                      ))}
                    </div>

                    <pre className="whitespace-pre font-mono text-sm p-3 rounded bg-gray-800 border border-gray-700 overflow-x-auto">
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
