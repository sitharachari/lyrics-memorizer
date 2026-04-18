import type { SessionStats } from '../types';
export default function ResultsScreen({ stats, onGoHome, onRetry }: { stats: SessionStats, onGoHome: () => void, onRetry: () => void }) {
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