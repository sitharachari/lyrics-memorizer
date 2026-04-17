import { useState, useEffect, useRef } from 'react';
import './App.css';

// --- TYPES ---
type SessionStats = { wpm: number; accuracy: number; failedVerses: string[][] };

type WordStatus = 'correct' | 'typo' | 'wrong' | 'missing';
type GradedWord = { target: string; typed: string; status: WordStatus };
type TestLineResult = { target: string; typed: string; isCorrect: boolean; verseIndex: number; gradedWords: GradedWord[] };
type TestStats = { totalLines: number; correctLines: number; hintsUsed: number; results: TestLineResult[]; failedVerses: string[][]; };

type LrcLibTrack = { id: number; trackName: string; artistName: string; plainLyrics: string | null; instrumental: boolean; };
type Theme = { id: string; name: string; colors: Record<string, string>; };
type SavedSong = { id: string; title: string; artist: string; fullVerses: string[][]; weakVerses: string[][]; lastPracticed: number; };

// --- THEME CONFIGURATION ---
const THEMES: Theme[] = [
  { id: 'default', name: 'Pine & Sand', colors: { '--color-sand': '#D2CB8F', '--color-neon-green': '#019A59', '--color-button-green': '#00674F', '--color-input-bg': '#00383D', '--color-bg-dark': '#021B32', '--color-error-orange': '#E07A5F' } },
  { id: 'aqua', name: 'Aqua Turquoise', colors: { '--color-bg-dark': '#201142', '--color-input-bg': '#254D7F', '--color-button-green': '#30A4B1', '--color-neon-green': '#6ED8B3', '--color-sand': '#DFFBD3', '--color-error-orange': '#FF6B6B' } },
  { id: 'pink', name: 'Cherry Frost', colors: { '--color-bg-dark': '#480930', '--color-input-bg': '#B51260', '--color-button-green': '#FE327D', '--color-neon-green': '#FE80AF', '--color-sand': '#FFDBE9', '--color-error-orange': '#FFD166' } },
  { id: 'sunset', name: 'Caramel Sunset', colors: { '--color-bg-dark': '#25203F', '--color-input-bg': '#7A4B5B', '--color-button-green': '#CC765D', '--color-neon-green': '#FEB872', '--color-sand': '#FEECD6', '--color-error-orange': '#06D6A0' } },
  { id: 'purple', name: 'Indigo Velvet', colors: { '--color-bg-dark': '#24143F', '--color-input-bg': '#4E3677', '--color-button-green': '#8761AF', '--color-neon-green': '#C795D9', '--color-sand': '#EFDCEF', '--color-error-orange': '#FF595E' } },
  { id: 'red-velvet', name: 'Night Bordeaux', colors: { '--color-bg-dark': '#480412', '--color-input-bg': '#7D0F19', '--color-button-green': '#BB2D26', '--color-neon-green': '#E1AD86', '--color-sand': '#F5DCB9', '--color-error-orange': '#00F5D4' } }
];

// --- UTILS ---
const normalizeString = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();

const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i += 1) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, 
        matrix[j - 1][i] + 1, 
        matrix[j - 1][i - 1] + indicator 
      );
    }
  }
  return matrix[b.length][a.length];
};

// --- COMPONENTS ---
function Navbar({ onOpenSettings, onOpenAbout }: { onOpenSettings: () => void, onOpenAbout: () => void }) {
  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={onOpenAbout}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
        <span>lyric memorizer</span>
      </div>
      <button className="nav-icon-button" onClick={onOpenSettings} aria-label="Settings">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
      </button>
    </nav>
  );
}

function SettingsModal({ currentThemeId, onSelectTheme, onClose, onClearData }: { currentThemeId: string, onSelectTheme: (id: string) => void, onClose: () => void, onClearData: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-sand)' }}>Settings</h3>
          <button className="nav-icon-button" onClick={onClose}>&times;</button>
        </div>
        
        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h4 style={{ color: 'var(--color-neon-green)', marginBottom: '1rem' }}>Color Theme</h4>
          <div className="theme-grid">
            {THEMES.map(theme => (
              <div key={theme.id} className={`theme-card ${currentThemeId === theme.id ? 'active' : ''}`} onClick={() => onSelectTheme(theme.id)}>
                <div className="theme-preview">
                  <div className="theme-swatch" style={{ backgroundColor: theme.colors['--color-bg-dark'] }}></div>
                  <div className="theme-swatch" style={{ backgroundColor: theme.colors['--color-input-bg'] }}></div>
                  <div className="theme-swatch" style={{ backgroundColor: theme.colors['--color-button-green'] }}></div>
                  <div className="theme-swatch" style={{ backgroundColor: theme.colors['--color-neon-green'] }}></div>
                  <div className="theme-swatch" style={{ backgroundColor: theme.colors['--color-sand'] }}></div>
                </div>
                <span>{theme.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--color-input-bg)', paddingTop: '1.5rem' }}>
           <button className="go-button" style={{ backgroundColor: 'transparent', color: 'var(--color-error-orange)', borderColor: 'var(--color-error-orange)', width: '100%' }} onClick={onClearData}>Wipe All Saved Data</button>
        </div>
      </div>
    </div>
  );
}

// --- NEW: ABOUT SCREEN ---
function AboutScreen({ onGoHome }: { onGoHome: () => void }) {
  return (
    <div className="container">
      <div className="results-container" style={{ textAlign: 'left', maxWidth: '600px' }}>
        <button className="back-button" onClick={onGoHome}>&larr; Back to Library</button>
        <h2 className="results-header" style={{ textAlign: 'left', marginTop: '1rem', color: 'var(--color-neon-green)' }}>About</h2>
        <div style={{ color: 'var(--color-sand)', fontSize: '1.2rem', lineHeight: '1.6' }}>
          <p>
            I created this app because I tend to hyper fixate on a song and I want to memorize it to be able to sing it as fast as I can.
          </p>
          <p>
            I also love typing tests and practicing typing, so this app is a specialized mix of both!
          </p>
        </div>
      </div>
    </div>
  );
}

function TestSession({ verses, onExit, onComplete }: { verses: string[][], onExit: () => void, onComplete: (stats: TestStats) => void }) {
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  
  const [isHintActive, setIsHintActive] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  
  const [results, setResults] = useState<TestLineResult[]>([]);
  const [failedVerseIndices, setFailedVerseIndices] = useState<Set<number>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);
  const targetLine = verses[currentVerseIndex]?.[currentLineIndex] || "";

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentLineIndex, currentVerseIndex]);

  const handleHint = () => {
    if (!isHintActive) {
      setIsHintActive(true);
      setHintsUsed(prev => prev + 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const targetWords = normalizeString(targetLine).split(' ');
    const typedWords = normalizeString(userInput).split(' ');
    let lineHasMemoryErrors = false;
    const gradedWords: GradedWord[] = [];

    targetWords.forEach((tWord, i) => {
      const inputWord = typedWords[i] || '';
      
      if (tWord === inputWord) {
        gradedWords.push({ target: tWord, typed: inputWord, status: 'correct' });
      } else if (!inputWord) {
        lineHasMemoryErrors = true;
        gradedWords.push({ target: tWord, typed: inputWord, status: 'missing' });
      } else {
        const distance = levenshteinDistance(tWord, inputWord);
        const maxTypoDist = tWord.length <= 2 ? 0 : (tWord.length <= 5 ? 1 : 2);

        if (distance <= maxTypoDist) {
          gradedWords.push({ target: tWord, typed: inputWord, status: 'typo' });
        } else {
          lineHasMemoryErrors = true;
          gradedWords.push({ target: tWord, typed: inputWord, status: 'wrong' });
        }
      }
    });

    if (typedWords.length > targetWords.length) {
      lineHasMemoryErrors = true;
      for (let i = targetWords.length; i < typedWords.length; i++) {
        gradedWords.push({ target: '', typed: typedWords[i], status: 'wrong' });
      }
    }

    const isLineForgiven = !lineHasMemoryErrors && !isHintActive;

    if (!isLineForgiven) {
      setFailedVerseIndices(prev => new Set(prev).add(currentVerseIndex));
    }

    const currentResult: TestLineResult = { target: targetLine, typed: userInput, isCorrect: isLineForgiven, verseIndex: currentVerseIndex, gradedWords };
    setResults(prev => [...prev, currentResult]);

    if (currentLineIndex < verses[currentVerseIndex].length - 1) {
      setCurrentLineIndex(prev => prev + 1);
    } else if (currentVerseIndex < verses.length - 1) {
      setCurrentVerseIndex(prev => prev + 1);
      setCurrentLineIndex(0);
    } else {
      const finalFailedVerses = Array.from(failedVerseIndices).map(idx => verses[idx]);
      onComplete({
        totalLines: results.length + 1,
        correctLines: results.filter(r => r.isCorrect).length + (isLineForgiven ? 1 : 0),
        hintsUsed: hintsUsed,
        results: [...results, currentResult],
        failedVerses: finalFailedVerses
      });
      return;
    }

    setUserInput('');
    setIsHintActive(false);
  };

  return (
    <div className="container practice-container" onClick={() => inputRef.current?.focus()}>
      <button className="back-button" onClick={onExit}>&larr; Quit Test</button>
      
      <div className="practice-header">
        <h2>Test Mode</h2>
        <p>Type the lyrics from memory. Punctuation is ignored. Minor typos are forgiven!</p>
      </div>

      <p className="line-number" style={{ marginTop: '2rem' }}>
        Verse {currentVerseIndex + 1} of {verses.length} 
        <span style={{opacity: 0.5, marginLeft: '1rem'}}>(Line {currentLineIndex + 1} of {verses[currentVerseIndex].length})</span>
      </p>

      {isHintActive ? (
        <div className="hint-display">{targetLine}</div>
      ) : (
        <button className="hint-button" type="button" onClick={handleHint}>Reveal Hint</button>
      )}

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <input ref={inputRef} className="test-input" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Type the line here and press Enter..." autoComplete="off" spellCheck="false" />
      </form>
    </div>
  );
}

function TestResultsScreen({ stats, onGoHome, onRetry }: { stats: TestStats, onGoHome: () => void, onRetry: () => void }) {
  const accuracy = Math.round((stats.correctLines / stats.totalLines) * 100);

  return (
    <div className="container">
      <div className="results-container">
        <h2 className="results-header">Test Complete!</h2>
        <div className="metrics-grid">
          <div className="metric-card"><span className="metric-value">{accuracy}%</span><span className="metric-label">Line Accuracy</span></div>
          <div className="metric-card"><span className="metric-value">{stats.hintsUsed}</span><span className="metric-label">Hints Used</span></div>
        </div>

        <div className="weak-lines-section">
          <h3>Line Review</h3>
          <div className="grading-list">
            {stats.results.map((result, idx) => {
              if (result.isCorrect && result.gradedWords.every(w => w.status === 'correct')) {
                return (
                  <div key={idx} className="grade-card correct">
                    <p className="grade-text" style={{ color: 'var(--color-neon-green)' }}>{result.target}</p>
                  </div>
                );
              }

              return (
                <div key={idx} className={`grade-card ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                  <p className="grade-label">Target Line:</p>
                  <p className="grade-text" style={{ color: 'var(--color-sand)' }}>{result.target}</p>
                  <p className="grade-label" style={{ marginTop: '1rem', color: result.isCorrect ? 'var(--color-sand)' : 'var(--color-error-orange)' }}>
                    {result.isCorrect ? "Your Input (Typos Forgiven):" : "Your Input (Errors Highlighted):"}
                  </p>
                  <p className="grade-text">
                    {result.gradedWords.map((word, wIdx) => {
                      if (word.status === 'correct') return <span key={wIdx} className="diff-word">{word.typed}</span>;
                      else if (word.status === 'missing') return <span key={wIdx} className="diff-word missing" title="Missed word">{word.target}</span>;
                      else if (word.status === 'typo') return <span key={wIdx} className="diff-word typo" title={`Target: ${word.target}`}>{word.typed}</span>;
                      else return <span key={wIdx} className="diff-word wrong" title={`Target: ${word.target}`}>{word.typed}</span>;
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="results-actions" style={{ marginTop: '2rem' }}>
          <button className="secondary-button" onClick={onGoHome}>Back to Library</button>
          <button className="go-button" onClick={onRetry}>Test Again</button>
        </div>
      </div>
    </div>
  );
}

// --- PRACTICE SESSION COMPONENT ---
function PracticeSession({ verses, onExit, onComplete }: { verses: string[][], onExit: () => void, onComplete: (stats: SessionStats) => void }) {
  const [isLowerCase, setIsLowerCase] = useState(false);
  const [removePunctuation, setRemovePunctuation] = useState(false);
  const [firstLetterMode, setFirstLetterMode] = useState(false); // NEW: First-Letter Toggle
  const [showWPM, setShowWPM] = useState(true);
  const [showAccuracy, setShowAccuracy] = useState(true);

  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  
  const [startTime, setStartTime] = useState<number | null>(null);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  
  const [currentLineErrors, setCurrentLineErrors] = useState(0);
  const [failedVerseIndices, setFailedVerseIndices] = useState<Set<number>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);

  let targetLine = verses[currentVerseIndex]?.[currentLineIndex] || "";
  
  if (removePunctuation) targetLine = targetLine.replace(/[^\w\s]/g, "").replace(/\s+/g, " ");
  if (isLowerCase) targetLine = targetLine.toLowerCase();

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
      if (currentLineErrors > 2) {
        setFailedVerseIndices(prev => new Set(prev).add(currentVerseIndex));
      }

      setTimeout(() => {
        if (currentLineIndex < verses[currentVerseIndex].length - 1) {
          setCurrentLineIndex(prev => prev + 1);
          setUserInput('');
          setCurrentLineErrors(0);
        } else {
          if (currentVerseIndex < verses.length - 1) {
            setCurrentVerseIndex(prev => prev + 1);
            setCurrentLineIndex(0);
            setUserInput('');
            setCurrentLineErrors(0);
          } else {
            const finalMinutes = (Date.now() - startTime!) / 60000;
            const finalWpm = Math.round((correctKeystrokes / 5) / finalMinutes);
            const finalAccuracy = Math.round((correctKeystrokes / totalKeystrokes) * 100);
            const finalFailedVerses = Array.from(failedVerseIndices).map(idx => verses[idx]);
            
            onComplete({ wpm: finalWpm, accuracy: finalAccuracy, failedVerses: finalFailedVerses });
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
        <label className="setting-toggle"><input type="checkbox" checked={firstLetterMode} onChange={() => setFirstLetterMode(!firstLetterMode)} />First-Letter Mode</label>
        <label className="setting-toggle"><input type="checkbox" checked={showWPM} onChange={() => setShowWPM(!showWPM)} />Show WPM</label>
        <label className="setting-toggle"><input type="checkbox" checked={showAccuracy} onChange={() => setShowAccuracy(!showAccuracy)} />Show Accuracy</label>
      </div>

      <div className="stats-bar">
        {showWPM && <span>WPM: {wpm}</span>}
        {showAccuracy && <span>ACC: {accuracy}%</span>}
      </div>

      <p className="line-number">
        Verse {currentVerseIndex + 1} of {verses.length} 
        <span style={{opacity: 0.5, marginLeft: '1rem'}}>(Line {currentLineIndex + 1} of {verses[currentVerseIndex].length})</span>
      </p>

      <div className="typing-container">
        <input ref={inputRef} className="hidden-input" value={userInput} onChange={handleTyping} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" />
        
        {targetLine.split('').map((char, index) => {
          let stateClass = '';
          let displayChar = char; // Default to the true letter

          // 1. If the user has typed this character, evaluate it and show what they ACTUALLY typed
          if (index < userInput.length) {
            stateClass = userInput[index] === char ? 'correct' : 'incorrect';
            displayChar = userInput[index]; 
          } 
          // 2. If they haven't typed it yet, check if First-Letter mode should mask it
          else if (firstLetterMode) {
            const isLetter = /[a-zA-Z]/.test(char);
            const prevIsLetter = index > 0 && /[a-zA-Z]/.test(targetLine[index - 1]);
            
            if (isLetter && prevIsLetter) {
              displayChar = '_';
            }
          }

          return <span key={index} className={`char ${stateClass}`}>{displayChar}</span>;
        })}
      </div>
    </div>
  );
}

function VerseSelectionScreen({ verses, onStartPractice, onStartTest, onCancel }: { verses: string[][], onStartPractice: (v: string[][]) => void, onStartTest: (v: string[][]) => void, onCancel: () => void }) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>(verses.map((_, i) => i));

  const toggleVerse = (index: number) => {
    setSelectedIndices(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index].sort((a, b) => a - b));
  };

  return (
    <div className="container verse-selection-container">
      <button className="back-button" onClick={onCancel}>&larr; Back</button>
      <div className="verse-selection-header">
        <h2>Select Verses</h2>
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

      <div className="results-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button className="secondary-button" onClick={() => onStartPractice(selectedIndices.map(i => verses[i]))} disabled={selectedIndices.length === 0} style={{ flex: 1 }}>
          Practice Mode (Guided)
        </button>
        <button className="go-button" onClick={() => onStartTest(selectedIndices.map(i => verses[i]))} disabled={selectedIndices.length === 0} style={{ flex: 1 }}>
          Test Mode (Blind)
        </button>
      </div>
    </div>
  );
}

function ResultsScreen({ stats, onGoHome, onRetry }: { stats: SessionStats, onGoHome: () => void, onRetry: () => void }) {
  return (
    <div className="container">
      <div className="results-container">
        <h2 className="results-header">Practice Complete!</h2>
        <div className="metrics-grid">
          <div className="metric-card"><span className="metric-value">{stats.wpm}</span><span className="metric-label">WPM</span></div>
          <div className="metric-card"><span className="metric-value">{stats.accuracy}%</span><span className="metric-label">Accuracy</span></div>
        </div>
        <div className="results-actions">
          <button className="secondary-button" onClick={onGoHome}>Back to Library</button>
          <button className="go-button" onClick={onRetry}>Retry</button>
        </div>
      </div>
    </div>
  );
}

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