import type { TestStats } from '../types';

export default function TestResultsScreen({ stats, onGoHome, onRetry }: { stats: TestStats, onGoHome: () => void, onRetry: () => void }) {
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