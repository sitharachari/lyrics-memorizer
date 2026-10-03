import { useState } from 'react';

export default function VerseSelectionScreen({ verses, onStartPractice, onStartTest, onCancel }: { verses: string[][], onStartPractice: (v: string[][]) => void, onStartTest: (v: string[][]) => void, onCancel: () => void }) {
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