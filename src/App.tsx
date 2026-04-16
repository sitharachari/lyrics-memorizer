import { useState, useEffect, useRef } from 'react';
import './App.css';

// --- TYPES ---
type SessionStats = {
  wpm: number;
  accuracy: number;
  failedLines: string[];
};

// --- PRACTICE SESSION COMPONENT ---
function PracticeSession({ 
  lines, 
  onExit, 
  onComplete 
}: { 
  lines: string[], 
  onExit: () => void, 
  onComplete: (stats: SessionStats) => void 
}) {
  const [isLowerCase, setIsLowerCase] = useState(false);
  const [removePunctuation, setRemovePunctuation] = useState(false);
  const [showWPM, setShowWPM] = useState(true);
  const [showAccuracy, setShowAccuracy] = useState(true);

  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  
  const [startTime, setStartTime] = useState<number | null>(null);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  
  // Track errors on the current line specifically
  const [currentLineErrors, setCurrentLineErrors] = useState(0);
  // Keep a running list of lines the user struggled with
  const [failedLines, setFailedLines] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  let targetLine = lines[currentLineIndex] || "";
  
  if (removePunctuation) {
    targetLine = targetLine.replace(/[^\w\s]/g, "").replace(/\s+/g, " ");
  }
  if (isLowerCase) {
    targetLine = targetLine.toLowerCase();
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentLineIndex]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (!startTime) setStartTime(Date.now());

    setUserInput(value);

    // Calculate metrics
    setTotalKeystrokes(prev => prev + 1);
    const lastTypedChar = value[value.length - 1];
    const targetChar = targetLine[value.length - 1];
    
    if (lastTypedChar === targetChar) {
      setCorrectKeystrokes(prev => prev + 1);
    } else if (value.length <= targetLine.length) {
      // If they typed a wrong character (and aren't just backspacing), add an error
      setCurrentLineErrors(prev => prev + 1);
    }

    // Line Complete Logic
    if (value === targetLine) {
      // If they made more than 2 mistakes on this line, flag it as a "Weak Line"
      if (currentLineErrors > 2) {
        setFailedLines(prev => [...prev, lines[currentLineIndex]]); // Save original unformatted line
      }

      setTimeout(() => {
        if (currentLineIndex < lines.length - 1) {
          // Move to next line and reset line-specific trackers
          setCurrentLineIndex(prev => prev + 1);
          setUserInput('');
          setCurrentLineErrors(0);
        } else {
          // Song is totally finished! Calculate final stats and trigger the results view
          const finalMinutes = (Date.now() - startTime!) / 60000;
          const finalWpm = Math.round((correctKeystrokes / 5) / finalMinutes);
          const finalAccuracy = Math.round((correctKeystrokes / totalKeystrokes) * 100);
          
          onComplete({
            wpm: finalWpm,
            accuracy: finalAccuracy,
            failedLines: currentLineErrors > 2 ? [...failedLines, lines[currentLineIndex]] : failedLines
          });
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
        <label className="setting-toggle">
          <input type="checkbox" checked={isLowerCase} onChange={() => setIsLowerCase(!isLowerCase)} />
          Force Lowercase
        </label>
        <label className="setting-toggle">
          <input type="checkbox" checked={removePunctuation} onChange={() => setRemovePunctuation(!removePunctuation)} />
          No Punctuation
        </label>
        <label className="setting-toggle">
          <input type="checkbox" checked={showWPM} onChange={() => setShowWPM(!showWPM)} />
          Show WPM
        </label>
        <label className="setting-toggle">
          <input type="checkbox" checked={showAccuracy} onChange={() => setShowAccuracy(!showAccuracy)} />
          Show Accuracy
        </label>
      </div>

      <div className="stats-bar">
        {showWPM && <span>WPM: {wpm}</span>}
        {showAccuracy && <span>ACC: {accuracy}%</span>}
      </div>

      <p className="line-number">Line {currentLineIndex + 1} of {lines.length}</p>

      <div className="typing-container">
        <input 
          ref={inputRef}
          className="hidden-input"
          value={userInput}
          onChange={handleTyping}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {targetLine.split('').map((char, index) => {
          let stateClass = '';
          if (index < userInput.length) {
            stateClass = userInput[index] === char ? 'correct' : 'incorrect';
          }
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
          <div className="metric-card">
            <span className="metric-value">{stats.wpm}</span>
            <span className="metric-label">WPM</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">{stats.accuracy}%</span>
            <span className="metric-label">Accuracy</span>
          </div>
        </div>

        {stats.failedLines.length > 0 && (
          <div className="weak-lines-section">
            <h3>Lines to Review ({stats.failedLines.length})</h3>
            <ul className="weak-lines-list">
              {stats.failedLines.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="results-actions">
          <button className="secondary-button" onClick={onGoHome}>Back to Menu</button>
          <button className="go-button" onClick={onRetry}>Retry Song</button>
        </div>
      </div>
    </div>
  );
}

// ... (Keep your PracticeSession and ResultsScreen components up here!)

// --- TYPES ---
// Add this new type below your SessionStats type
type LrcLibTrack = {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  plainLyrics: string | null;
  instrumental: boolean;
};

// --- MAIN APP COMPONENT ---
function App() {
  const [currentView, setCurrentView] = useState<'home' | 'practice' | 'results'>('home');
  const [rawLyrics, setRawLyrics] = useState('');
  const [songLines, setSongLines] = useState<string[]>([]);
  const [finalStats, setFinalStats] = useState<SessionStats | null>(null);

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LrcLibTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // --- HANDLERS ---
  const handleStartPractice = () => {
    if (!rawLyrics.trim()) return; 
    const parsedLines = rawLyrics
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    setSongLines(parsedLines);
    setCurrentView('practice');
  };

  const handleSessionComplete = (stats: SessionStats) => {
    setFinalStats(stats);
    setCurrentView('results');
  };

  const executeSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      // Fetch from LRCLIB
      const response = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch from LRCLIB');
      }

      const data: LrcLibTrack[] = await response.json();
      
      // Filter out instrumentals or songs that don't have text lyrics
      const validTracks = data.filter(track => !track.instrumental && track.plainLyrics);
      
      if (validTracks.length === 0) {
        setSearchError('No lyrics found for that search.');
      } else {
        // Only show the top 5 results to keep the UI clean
        setSearchResults(validTracks.slice(0, 5));
      }
    } catch (err) {
      setSearchError('Network error. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectTrack = (track: LrcLibTrack) => {
    if (!track.plainLyrics) return;

    const parsedLines = track.plainLyrics
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    setSongLines(parsedLines);
    setCurrentView('practice');
    
    // Clear search state so it's clean if they come back to the home menu
    setSearchQuery('');
    setSearchResults([]);
  };

  // --- RENDERING ---
  if (currentView === 'practice') {
    return <PracticeSession lines={songLines} onExit={() => setCurrentView('home')} onComplete={handleSessionComplete} />;
  }

  if (currentView === 'results' && finalStats) {
    return <ResultsScreen stats={finalStats} onGoHome={() => setCurrentView('home')} onRetry={() => setCurrentView('practice')} />;
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Welcome to lyric memorizer!</h1>
        <h2>Get started!</h2>
      </header>
      
      <section className="manual-entry-section">
        <textarea 
          className="lyrics-textarea" 
          placeholder="paste in your lyrics here!"
          value={rawLyrics}
          onChange={(e) => setRawLyrics(e.target.value)}
        />
        <div className="button-container">
          <button className="go-button" onClick={handleStartPractice}>go</button>
        </div>
      </section>
      
      <div className="divider">
        <h3>or</h3>
        <p>search up a song through its title and get the lyrics!</p>
      </div>
      
      <section className="search-section">
        <div className="search-bar">
          <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          
          <input 
            type="text" 
            placeholder="Enter song title here" 
            className="search-input" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeSearch()} // Trigger on Enter
          />
          
          {/* Magnifying glass is now clickable */}
          <svg className="icon search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" onClick={executeSearch} style={{ cursor: 'pointer' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        {/* Dynamic Search Results UI */}
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
    </div>
  );
}

export default App;