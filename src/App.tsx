import { useState } from 'react';
import './App.css';

function App() {
  // --- STATE ---
  const [currentView, setCurrentView] = useState<'home' | 'practice'>('home');
  const [rawLyrics, setRawLyrics] = useState('');
  const [songLines, setSongLines] = useState<string[]>([]);

  // --- HANDLERS ---
  const handleStartPractice = () => {
    // 1. Prevent starting if the text area is empty
    if (!rawLyrics.trim()) return; 

    // 2. Parse the lyrics: split by new line, trim whitespace, and remove empty lines
    const parsedLines = rawLyrics
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // 3. Save the parsed lines and switch the view
    setSongLines(parsedLines);
    setCurrentView('practice');
  };

  // --- RENDER PRACTICE VIEW ---
  if (currentView === 'practice') {
    return (
      <div className="container practice-container">
        <button 
          className="back-button" 
          onClick={() => setCurrentView('home')}
        >
          &larr; Back to Menu
        </button>
        
        <div className="practice-header">
          <h2>Practice Mode</h2>
          <p>{songLines.length} lines loaded.</p>
        </div>

        {/* This is a temporary display to prove the parsing worked */}
        <div className="debug-lines">
          {songLines.map((line, index) => (
            <p key={index} className="debug-line">
              <span className="line-number">{index + 1}.</span> {line}
            </p>
          ))}
        </div>
      </div>
    );
  }

  // --- RENDER HOME VIEW ---
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
          <button className="go-button" onClick={handleStartPractice}>
            go
          </button>
        </div>
      </section>

      <div className="divider">
        <h3>or</h3>
        <p>search up a song through its title and get the lyrics!</p>
      </div>

      <section className="search-section">
        <div className="search-bar">
          <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Enter song title here" 
            className="search-input"
          />
          <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </section>
    </div>
  );
}

export default App;