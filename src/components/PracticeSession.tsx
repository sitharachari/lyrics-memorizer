import { useState, useEffect, useRef } from 'react';
import type { SessionStats } from '../types';

export default function PracticeSession({ verses, onExit, onComplete }: { verses: string[][], onExit: () => void, onComplete: (stats: SessionStats) => void }) {
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