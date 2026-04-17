// src/types/index.ts

export type SessionStats = { wpm: number; accuracy: number; failedVerses: string[][] };

export type WordStatus = 'correct' | 'typo' | 'wrong' | 'missing';
export type GradedWord = { target: string; typed: string; status: WordStatus };
export type TestLineResult = { target: string; typed: string; isCorrect: boolean; verseIndex: number; gradedWords: GradedWord[] };
export type TestStats = { totalLines: number; correctLines: number; hintsUsed: number; results: TestLineResult[]; failedVerses: string[][]; };

export type LrcLibTrack = { id: number; trackName: string; artistName: string; plainLyrics: string | null; instrumental: boolean; };
export type Theme = { id: string; name: string; colors: Record<string, string>; };
export type SavedSong = { id: string; title: string; artist: string; fullVerses: string[][]; weakVerses: string[][]; lastPracticed: number; };