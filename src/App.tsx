import { useState, useEffect, useRef } from 'react';
import './App.css';

// --- PRACTICE SESSION COMPONENT ---
function PracticeSession({ lines, onExit }: { lines: string[], onExit: () => void }) {
  // Settings
  const [isLowerCase, setIsLowerCase] = useState(false);
  const [showWPM, setShowWPM] = useState(true);
  const [showAccuracy, setShowAccuracy] = useState(true);

  // Typing State
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  
  // Metrics State
  const [startTime, setStartTime] = useState<number | null>(null);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // The line the user is currently trying to type
  let targetLine = lines[currentLineIndex] || "";
  if (isLowerCase) {
    targetLine = targetLine.toLowerCase();
  }

  // Focus the hidden input automatically
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentLineIndex]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Start the timer on the first keystroke
    if (!startTime) setStartTime(Date.now());

    setUserInput(value);

    // Calculate accuracy metrics
    setTotalKeystrokes(prev => prev + 1);
    const lastTypedChar = value[value.length - 1];
    const targetChar = targetLine[value.length - 1];
    
    if (lastTypedChar === targetChar) {
      setCorrectKeystrokes(prev => prev + 1);
    }

    // Advance to next line if the typed string perfectly matches the target
    if (value === targetLine) {
      setTimeout(() => {
        if (currentLineIndex < lines.length - 1) {
          setCurrentLineIndex(prev => prev + 1);
          setUserInput('');
        } else {
          alert("Song Complete!"); // We will replace this with a results screen later
          onExit();
        }
      }, 150); // Tiny delay so the user sees the last letter turn sand color
    }
  };

  // Calculate live WPM ( (Chars / 5) / Minutes )
  const elapsedMinutes = startTime ? (Date.now() - startTime) / 60000 : 0;
  const wpm = elapsedMinutes > 0 ? Math.round((correctKeystrokes / 5) / elapsedMinutes) : 0;
  
  // Calculate live Accuracy
  const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;

  return (
    <div className="container practice-container" onClick={() => inputRef.current?.focus()}>
      <button className="back-button" onClick={onExit}>&larr; Quit Session</button>

      {/* Toggles */}
      <div className="settings-bar">
        <label className="setting-toggle">
          <input type="checkbox" checked={isLowerCase} onChange={() => setIsLowerCase(!isLowerCase)} />
          Force Lowercase
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

      {/* Live Stats */}
      <div className="stats-bar">
        {showWPM && <span>WPM: {wpm}</span>}
        {showAccuracy && <span>ACC: {accuracy}%</span>}
      </div>

      <p className="line-number">Line {currentLineIndex + 1} of {lines.length}</p>

      {/* The Typing Engine */}
      <div className="typing-container">
        {/* Hidden input catches the physical keystrokes */}
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

        {/* Visual text rendering */}
        {targetLine.split('').map((char, index) => {
          let stateClass = '';
          if (index < userInput.length) {
            stateClass = userInput[index] === char ? 'correct' : 'incorrect';
          }

          return (
            <span key={index} className={`char ${stateClass}`}>
              {char}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
function App() {
  const [currentView, setCurrentView] = useState<'home' | 'practice'>('home');
  const [rawLyrics, setRawLyrics] = useState('');
  const [songLines, setSongLines] = useState<string[]>([]);

  const handleStartPractice = () => {
    if (!rawLyrics.trim()) return; 
    const parsedLines = rawLyrics
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    setSongLines(parsedLines);
    setCurrentView('practice');
  };

  if (currentView === 'practice') {
    return <PracticeSession lines={songLines} onExit={() => setCurrentView('home')} />;
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
          <input type="text" placeholder="Enter song title here" className="search-input" />
          <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
      </section>
    </div>
  );
}

export default App;