// src/App.tsx
import { useState, useEffect } from 'react';
import './App.css';

// 1. Import Types & Constants
import type { SessionStats, TestStats, LrcLibTrack, SavedSong } from './types';
import { THEMES } from './constants/themes';

// 2. Import Components
import Navbar from './components/Navbar';
import SettingsModal from './components/SettingsModal';
import AboutScreen from './components/AboutScreen';
import PracticeSession from './components/PracticeSession';
import TestSession from './components/TestSession';
import VerseSelectionScreen from './components/VerseSelectionScreen';
import ResultsScreen from './components/ResultsScreen';
import TestResultsScreen from './components/TestResultsScreen';

// --- MAIN APP COMPONENT ---
function App() {
  const [currentView, setCurrentView] = useState<'home' | 'select-verses' | 'practice' | 'test' | 'results' | 'test-results' | 'about'>('home');
  const [rawLyrics, setRawLyrics] = useState('');
  
  const [songLibrary, setSongLibrary] = useState<SavedSong[]>(() => {
    const saved = localStorage.getItem('lyric-library');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSongMeta, setActiveSongMeta] = useState<{ id: string, title: string, artist: string, fullVerses: string[][] } | null>(null);
  const [songVerses, setSongVerses] = useState<string[][]>([]); 
  const [activePracticeVerses, setActivePracticeVerses] = useState<string[][]>([]); 
  
  const [practiceStats, setPracticeStats] = useState<SessionStats | null>(null);
  const [testStats, setTestStats] = useState<TestStats | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LrcLibTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState<string>(() => localStorage.getItem('lyric-theme') || 'default');

  useEffect(() => {
    const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([property, value]) => root.style.setProperty(property, value));
    localStorage.setItem('lyric-theme', activeThemeId);
  }, [activeThemeId]);


  const parseLyricsToVerses = (text: string) => text.split(/\n{2,}/).map(chunk => chunk.split('\n').map(l => l.trim()).filter(l => l.length > 0)).filter(v => v.length > 0);

  const handlePastedLyrics = () => {
    const parsed = parseLyricsToVerses(rawLyrics);
    if (parsed.length === 0) return;
    setActiveSongMeta({ id: 'custom-' + Date.now(), title: 'Custom Song', artist: 'Unknown', fullVerses: parsed });
    setSongVerses(parsed); setCurrentView('select-verses');
  };

  const handleSelectTrack = (track: LrcLibTrack) => {
    if (!track.plainLyrics) return;
    const parsed = parseLyricsToVerses(track.plainLyrics);
    setActiveSongMeta({ id: track.id.toString(), title: track.trackName, artist: track.artistName, fullVerses: parsed });
    setSongVerses(parsed); setCurrentView('select-verses');
    setSearchQuery(''); setSearchResults([]);
  };

  const handleResumeSong = (song: SavedSong) => {
    setActiveSongMeta({ id: song.id, title: song.title, artist: song.artist, fullVerses: song.fullVerses });
    setSongVerses(song.fullVerses); setCurrentView('select-verses'); 
  };

  const handleStartPractice = (selectedVerses: string[][]) => { setActivePracticeVerses(selectedVerses); setCurrentView('practice'); };
  const handleStartTest = (selectedVerses: string[][]) => { setActivePracticeVerses(selectedVerses); setCurrentView('test'); };

  const saveFailedVersesToLibrary = (failedVerses: string[][]) => {
    if (activeSongMeta) {
      setSongLibrary(prev => {
        const existingSongIndex = prev.findIndex(s => s.id === activeSongMeta.id);
        if (existingSongIndex >= 0) {
          const existingSong = prev[existingSongIndex];
          const existingStrings = existingSong.weakVerses.map(v => JSON.stringify(v));
          const newStrings = failedVerses.map(v => JSON.stringify(v));
          const combinedStrings = Array.from(new Set([...existingStrings, ...newStrings]));
          
          const newLibrary = [...prev];
          newLibrary[existingSongIndex] = { ...existingSong, weakVerses: combinedStrings.map(s => JSON.parse(s)), lastPracticed: Date.now() };
          localStorage.setItem('lyric-library', JSON.stringify(newLibrary));
          return newLibrary;
        } else {
          const newLibrary = [{ id: activeSongMeta.id, title: activeSongMeta.title, artist: activeSongMeta.artist, fullVerses: activeSongMeta.fullVerses, weakVerses: failedVerses, lastPracticed: Date.now() }, ...prev];
          localStorage.setItem('lyric-library', JSON.stringify(newLibrary));
          return newLibrary;
        }
      });
    }
  }

  const handlePracticeComplete = (stats: SessionStats) => {
    setPracticeStats(stats);
    saveFailedVersesToLibrary(stats.failedVerses);
    setCurrentView('results');
  };

  const handleTestComplete = (stats: TestStats) => {
    setTestStats(stats);
    saveFailedVersesToLibrary(stats.failedVerses);
    setCurrentView('test-results');
  };

  const confirmClearDatabase = () => { localStorage.removeItem('lyric-library'); setSongLibrary([]); setIsDeleteModalOpen(false); setIsSettingsOpen(false); };

  const executeSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true); setSearchError(''); setSearchResults([]);
    try {
      const response = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data: LrcLibTrack[] = await response.json();
      const validTracks = data.filter(track => !track.instrumental && track.plainLyrics);
      validTracks.length === 0 ? setSearchError('No lyrics found.') : setSearchResults(validTracks.slice(0, 5));
    } catch { setSearchError('Network error. Please try again.'); } finally { setIsSearching(false); }
  };

  // --- RENDERING ROUTER ---
  if (currentView === 'practice') return <PracticeSession verses={activePracticeVerses} onExit={() => setCurrentView('home')} onComplete={handlePracticeComplete} />;
  if (currentView === 'test') return <TestSession verses={activePracticeVerses} onExit={() => setCurrentView('home')} onComplete={handleTestComplete} />;

  return (
    <>
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} onOpenAbout={() => setCurrentView('about')} />
      {isSettingsOpen && <SettingsModal currentThemeId={activeThemeId} onSelectTheme={setActiveThemeId} onClose={() => setIsSettingsOpen(false)} onClearData={() => setIsDeleteModalOpen(true)} />}
      
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ color: 'var(--color-error-orange)' }}>Are you sure?</h3>
            <p>This will permanently delete your entire Song Library.</p>
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="go-button" onClick={confirmClearDatabase} style={{ backgroundColor: 'var(--color-error-orange)', color: 'var(--color-bg-dark)', borderColor: 'var(--color-error-orange)' }}>Delete Everything</button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'about' ? (
        <AboutScreen onGoHome={() => setCurrentView('home')} />
      ) : currentView === 'select-verses' ? (
        <VerseSelectionScreen verses={songVerses} onStartPractice={handleStartPractice} onStartTest={handleStartTest} onCancel={() => setCurrentView('home')} />
      ) : currentView === 'results' && practiceStats ? (
        <ResultsScreen stats={practiceStats} onGoHome={() => setCurrentView('home')} onRetry={() => setCurrentView('select-verses')} />
      ) : currentView === 'test-results' && testStats ? (
        <TestResultsScreen stats={testStats} onGoHome={() => setCurrentView('home')} onRetry={() => setCurrentView('select-verses')} />
      ) : (
        <div className="container">
          <div className="library-dashboard">
            <h3>Continue Memorizing</h3>
            {songLibrary.length === 0 ? (
              <p style={{ opacity: 0.6 }}>Your library is empty. Search or paste a song below to start!</p>
            ) : (
              <ul className="library-list">
                {songLibrary.sort((a,b) => b.lastPracticed - a.lastPracticed).map(song => (
                  <li key={song.id} className="library-item">
                     <div className="library-song-info">
                        <div><p className="library-song-title">{song.title}</p><p className="library-song-artist">{song.artist}</p></div>
                        {song.weakVerses.length > 0 && <span className="weak-badge">{song.weakVerses.length} Weak Verses</span>}
                     </div>
                     <div className="library-actions"><button className="library-btn" onClick={() => handleResumeSong(song)}>Open Song Details</button></div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {songLibrary.length > 0 && (
            <div className="divider" style={{ width: '100%', maxWidth: '600px', margin: '0.3rem 0' }}></div>
          )}
          
          <section className="search-section" style={{ width: '100%', maxWidth: '600px', marginBottom: '2rem' }}>
            <h3 style={{ textAlign: 'left', marginTop: 0, color: 'var(--color-sand)' }}>Add a New Song</h3>
            <div className="search-bar">
              <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              <input type="text" placeholder="Search by song title..." className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && executeSearch()} />
            </div>
            <div className="search-feedback-container">
              {isSearching && <p className="status-text">Searching LRCLIB...</p>}
              {searchError && <p className="error-text">{searchError}</p>}
              {searchResults.length > 0 && (
                <ul className="search-results-list">
                  {searchResults.map((track) => (
                    <li key={track.id} className="search-result-item" onClick={() => handleSelectTrack(track)}>
                      <span className="track-name">{track.trackName}</span>
                      <span className="artist-name">{track.artistName}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="manual-entry-section" style={{ width: '100%', maxWidth: '600px' }}>
            <p style={{ textAlign: 'center', opacity: 0.6, margin: '1rem 0' }}>or paste raw text</p>
            <textarea className="lyrics-textarea" placeholder="Paste custom lyrics here..." value={rawLyrics} onChange={(e) => setRawLyrics(e.target.value)} />
            <div className="button-container" style={{ marginTop: '1rem' }}><button className="go-button" onClick={handlePastedLyrics}>Process Lyrics</button></div>
          </section>
        </div>
      )}
    </>
  );
}

export default App;