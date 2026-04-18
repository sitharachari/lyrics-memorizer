import React, { useState, useEffect, useRef } from 'react';
import type { TestStats, TestLineResult, GradedWord } from '../types';import { normalizeString, levenshteinDistance } from '../utils/grading';

export default function TestSession({ verses, onExit, onComplete }: { verses: string[][], onExit: () => void, onComplete: (stats: TestStats) => void }) {
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