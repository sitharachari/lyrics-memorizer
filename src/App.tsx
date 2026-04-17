import { useState, useEffect, useRef } from 'react';
import './App.css';

// --- TYPES ---
type SessionStats = {
  wpm: number;
  accuracy: number;
  failedVerses: string[][]; // Changed from string[] to string[][]
};

type LrcLibTrack = {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  plainLyrics: string | null;
  instrumental: boolean;
};

// --- PRACTICE SESSION COMPONENT ---
function PracticeSession({ 
  verses, 
  onExit, 
  onComplete 
}: { 
  verses: string[][], 
  onExit: () => void, 
  onComplete: (stats: SessionStats) => void 
}) {
  const [isLowerCase, setIsLowerCase] = useState(false);
  const [removePunctuation, setRemovePunctuation] = useState(false);
  const [showWPM, setShowWPM] = useState(true);
  const [showAccuracy, setShowAccuracy] = useState(true);

  // 2D Tracking: Which verse, and which line inside that verse
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  
  const [startTime, setStartTime] = useState<number | null>(null);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  
  const [currentLineErrors, setCurrentLineErrors] = useState(0);
  // Track indices of verses that had at least one bad line
  const [failedVerseIndices, setFailedVerseIndices] = useState<Set<number>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);

  let targetLine = verses[currentVerseIndex]?.[currentLineIndex] || "";
  
  if (removePunctuation) {
    targetLine = targetLine.replace(/[^\w\s]/g, "").replace(/\s+/g, " ");
  }
  if (isLowerCase) {
    targetLine = targetLine.toLowerCase();
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentLineIndex, currentVerseIndex]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!startTime) setStartTime(Date.now());
    setUserInput(value);

    setTotalKeystrokes(prev => prev + 1);
    const lastTypedChar = value[value.length - 1];
    const targetChar = targetLine[value.length - 1];
    
    if (lastTypedChar === targetChar) {
      setCorrectKeystrokes(prev => prev + 1);
    } else if (value.length <= targetLine.length) {
      setCurrentLineErrors(prev => prev + 1);
    }

    if (value === targetLine) {
      // If they mess up a single line, flag the ENTIRE verse for review
      if (currentLineErrors > 2) {
        setFailedVerseIndices(prev => new Set(prev).add(currentVerseIndex));
      }

      setTimeout(() => {
        // Are we still inside the current verse?
        if (currentLineIndex < verses[currentVerseIndex].length - 1) {
          setCurrentLineIndex(prev => prev + 1);
          setUserInput('');
          setCurrentLineErrors(0);
        } else {
          // Verse is done. Are there more verses in the session?
          if (currentVerseIndex < verses.length - 1) {
            setCurrentVerseIndex(prev => prev + 1);
            setCurrentLineIndex(0); // Reset back to line 1 of the new verse
            setUserInput('');
            setCurrentLineErrors(0);
          } else {
            // Song/Session is completely finished!
            const finalMinutes = (Date.now() - startTime!) / 60000;
            const finalWpm = Math.round((correctKeystrokes / 5) / finalMinutes);
            const finalAccuracy = Math.round((correctKeystrokes / totalKeystrokes) * 100);
            
            // Map the failed indices back to the actual text arrays
            const finalFailedVerses = Array.from(failedVerseIndices).map(idx => verses[idx]);
            
            onComplete({
              wpm: finalWpm,
              accuracy: finalAccuracy,
              failedVerses: finalFailedVerses
            });
          }
        }
      }, 150); 
    }
  };

  const elapsedMinutes = startTime ? (Date.now() - startTime) / 60000 : 0;
  const wpm = elapsedMinutes > 0 ? Math.round((correctKeystrokes / 5) / elapsedMinutes) : 0;
  const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;

  return (
    <div className="container practice-container" onClick={() => inputRef.current?.focus()}>
      <button className="back-button" onClick={onExit}>&larr; Quit Session</button>

      <div className="settings-bar">
        <label className="setting-toggle"><input type="checkbox" checked={isLowerCase} onChange={() => setIsLowerCase(!isLowerCase)} />Force Lowercase</label>
        <label className="setting-toggle"><input type="checkbox" checked={removePunctuation} onChange={() => setRemovePunctuation(!removePunctuation)} />No Punctuation</label>
        <label className="setting-toggle"><input type="checkbox" checked={showWPM} onChange={() => setShowWPM(!showWPM)} />Show WPM</label>
        <label className="setting-toggle"><input type="checkbox" checked={showAccuracy} onChange={() => setShowAccuracy(!showAccuracy)} />Show Accuracy</label>
      </div>

      <div className="stats-bar">
        {showWPM && <span>WPM: {wpm}</span>}
        {showAccuracy && <span>ACC: {accuracy}%</span>}
      </div>

      <p className="line-number">
        Verse {currentVerseIndex + 1} of {verses.length} 
        <span style={{opacity: 0.5, marginLeft: '1rem'}}>
          (Line {currentLineIndex + 1} of {verses[currentVerseIndex].length})
        </span>
      </p>

      <div className="typing-container">
        <input ref={inputRef} className="hidden-input" value={userInput} onChange={handleTyping} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" />
        {targetLine.split('').map((char, index) => {
          let stateClass = '';
          if (index < userInput.length) stateClass = userInput[index] === char ? 'correct' : 'incorrect';
          return <span key={index} className={`char ${stateClass}`}>{char}</span>;
        })}
      </div>
    </div>
  );
}

// --- RESULTS SCREEN COMPONENT ---
function ResultsScreen({ stats, onGoHome, onRetry }: { stats: SessionStats, onGoHome: () => void, onRetry: () => void }) {
  return (
    <div className="container">
      <div className="results-container">
        <h2 className="results-header">Session Complete!</h2>
        <div className="metrics-grid">
          <div className="metric-card"><span className="metric-value">{stats.wpm}</span><span className="metric-label">WPM</span></div>
          <div className="metric-card"><span className="metric-value">{stats.accuracy}%</span><span className="metric-label">Accuracy</span></div>
        </div>

        {stats.failedVerses.length > 0 && (
          <div className="weak-lines-section">
            <h3>Verses to Review ({stats.failedVerses.length})</h3>
            <div className="weak-verses-list">
              {stats.failedVerses.map((verse, idx) => (
                <div key={idx} className="weak-verse-card">
                  {verse.map((line, lineIdx) => <p key={lineIdx}>{line}</p>)}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="results-actions">
          <button className="secondary-button" onClick={onGoHome}>Back to Menu</button>
          <button className="go-button" onClick={onRetry}>Retry</button>
        </div>
      </div>
    </div>
  );
}

// --- VERSE SELECTION COMPONENT ---
function VerseSelectionScreen({ verses, onStart, onCancel }: { verses: string[][], onStart: (selectedVerses: string[][]) => void, onCancel: () => void }) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>(verses.map((_, i) => i));

  const toggleVerse = (index: number) => {
    setSelectedIndices(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index].sort((a, b) => a - b));
  };

  return (
    <div className="container verse-selection-container">
      <button className="back-button" onClick={onCancel}>&larr; Back to Search</button>
      <div className="verse-selection-header">
        <h2>Select Verses to Practice</h2>
        <button className="secondary-button" onClick={() => setSelectedIndices(selectedIndices.length === verses.length ? [] : verses.map((_, i) => i))}>
          {selectedIndices.length === verses.length ? "Deselect All" : "Select Whole Song"}
        </button>
      </div>

      <div className="verse-list">
        {verses.map((verse, index) => (
          <div key={index} className={`verse-card ${selectedIndices.includes(index) ? 'selected' : ''}`} onClick={() => toggleVerse(index)}>
            <input type="checkbox" className="verse-checkbox" checked={selectedIndices.includes(index)} readOnly />
            <div className="verse-content">
              {verse.slice(0, 4).map((line, lineIdx) => <p key={lineIdx}>{line}</p>)}
              {verse.length > 4 && <p style={{ opacity: 0.5 }}><em>+ {verse.length - 4} more lines...</em></p>}
            </div>
          </div>
        ))}
      </div>

      <div className="results-actions" style={{ marginTop: '2rem' }}>
        <button className="go-button" onClick={() => onStart(selectedIndices.map(i => verses[i]))} disabled={selectedIndices.length === 0} style={{ opacity: selectedIndices.length === 0 ? 0.5 : 1, width: '100%', padding: '1rem' }}>
          Start Practice ({selectedIndices.length} verses)
        </button>
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
function App() {
  const [currentView, setCurrentView] = useState<'home' | 'select-verses' | 'practice' | 'results'>('home');
  const [rawLyrics, setRawLyrics] = useState('');
  
  const [songVerses, setSongVerses] = useState<string[][]>([]); // For the selection screen
  const [activePracticeVerses, setActivePracticeVerses] = useState<string[][]>([]); // For the actual typing test
  const [finalStats, setFinalStats] = useState<SessionStats | null>(null);

  // Initialize with our new verse-based DB key
  const [savedWeakVerses, setSavedWeakVerses] = useState<string[][]>(() => {
    const saved = localStorage.getItem('lyric-weak-verses');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LrcLibTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Core parser
  const parseLyricsToVerses = (text: string) => {
    return text.split(/\n{2,}/).map(chunk => chunk.split('\n').map(l => l.trim()).filter(l => l.length > 0)).filter(v => v.length > 0);
  };

  const handleProcessLyrics = (textToProcess: string) => {
    const parsed = parseLyricsToVerses(textToProcess);
    if (parsed.length === 0) return;
    setSongVerses(parsed);
    setCurrentView('select-verses');
  };

  const handleStartPracticeFromSelection = (selectedVerses: string[][]) => {
    setActivePracticeVerses(selectedVerses);
    setCurrentView('practice');
  };

  const handleDrillWeakVerses = () => {
    if (savedWeakVerses.length === 0) return;
    const shuffled = [...savedWeakVerses].sort(() => Math.random() - 0.5);
    setActivePracticeVerses(shuffled);
    setCurrentView('practice');
  };

  const handleClearDatabase = () => {
    if (confirm("Are you sure you want to delete all your saved weak verses?")) {
      localStorage.removeItem('lyric-weak-verses');
      setSavedWeakVerses([]);
    }
  };

  const handleSessionComplete = (stats: SessionStats) => {
    setFinalStats(stats);
    setCurrentView('results');

    if (stats.failedVerses.length > 0) {
      setSavedWeakVerses(prev => {
        // Stringify arrays to easily remove duplicates in a Set
        const existingStrings = prev.map(v => JSON.stringify(v));
        const newStrings = stats.failedVerses.map(v => JSON.stringify(v));
        const combinedStrings = Array.from(new Set([...existingStrings, ...newStrings]));
        const combined = combinedStrings.map(s => JSON.parse(s));
        
        localStorage.setItem('lyric-weak-verses', JSON.stringify(combined));
        return combined;
      });
    }
  };

  const executeSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const response = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data: LrcLibTrack[] = await response.json();
      const validTracks = data.filter(track => !track.instrumental && track.plainLyrics);
      validTracks.length === 0 ? setSearchError('No lyrics found.') : setSearchResults(validTracks.slice(0, 5));
    } catch {
      setSearchError('Network error. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // --- RENDERING ROUTER ---
  if (currentView === 'select-verses') return <VerseSelectionScreen verses={songVerses} onStart={handleStartPracticeFromSelection} onCancel={() => setCurrentView('home')} />;
  if (currentView === 'practice') return <PracticeSession verses={activePracticeVerses} onExit={() => setCurrentView('home')} onComplete={handleSessionComplete} />;
  if (currentView === 'results' && finalStats) return <ResultsScreen stats={finalStats} onGoHome={() => setCurrentView('home')} onRetry={() => setCurrentView('select-verses')} />;

  return (
    <div className="container">
      <header className="header">
        <h1>Welcome to lyric memorizer!</h1>
        <h2>Get started!</h2>
      </header>

      <div className="weak-lines-dashboard">
        <h3>Your Weak Verses Database</h3>
        <p>You have <strong>{savedWeakVerses.length}</strong> verses currently saved for review.</p>
        <div className="results-actions">
          <button className="go-button" onClick={handleDrillWeakVerses} disabled={savedWeakVerses.length === 0} style={{ opacity: savedWeakVerses.length === 0 ? 0.5 : 1 }}>Drill Weak Verses Now</button>
          {savedWeakVerses.length > 0 && <button className="secondary-button" onClick={handleClearDatabase} style={{ borderColor: 'var(--color-error-orange)', color: 'var(--color-error-orange)'}}>Clear Database</button>}
        </div>
      </div>

      <div className="divider"></div>
      
      <section className="manual-entry-section">
        <textarea className="lyrics-textarea" placeholder="paste in your lyrics here!" value={rawLyrics} onChange={(e) => setRawLyrics(e.target.value)} />
        <div className="button-container"><button className="go-button" onClick={() => handleProcessLyrics(rawLyrics)}>go</button></div>
      </section>
      
      <div className="divider"><h3>or</h3><p>search up a song through its title and get the lyrics!</p></div>
      
      <section className="search-section">
        <div className="search-bar">
          <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          <input type="text" placeholder="Enter song title here" className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && executeSearch()} />
          <svg className="icon search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" onClick={executeSearch} style={{ cursor: 'pointer' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <div className="search-feedback-container">
          {isSearching && <p className="status-text">Searching LRCLIB...</p>}
          {searchError && <p className="error-text">{searchError}</p>}
          {searchResults.length > 0 && (
            <ul className="search-results-list">
              {searchResults.map((track) => (
                <li key={track.id} className="search-result-item" onClick={() => handleProcessLyrics(track.plainLyrics || '')}>
                  <span className="track-name">{track.trackName}</span>
                  <span className="artist-name">{track.artistName}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;