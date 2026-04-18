export default function AboutScreen({ onGoHome }: { onGoHome: () => void }) {
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