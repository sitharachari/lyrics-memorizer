export default function AboutScreen({ onGoHome }: { onGoHome: () => void }) {
  return (
    <div className="container">
      <div className="results-container" style={{ textAlign: 'left', maxWidth: '600px' }}>
        <button className="back-button" onClick={onGoHome}>&larr; Back to Library</button>
        <h2 className="results-header" style={{ textAlign: 'left', marginTop: '1rem', color: 'var(--color-neon-green)' }}>About</h2>
        <div style={{ color: 'var(--color-sand)', fontSize: '1.2rem', lineHeight: '1.6' }}>
          <p>
            I created this app because I get random bursts of having to memorize a certain song completely. Usually, I just write it out until it's in my head, but since I also love practicing my typing, I thought to mix the two and make an app catered towards memorizing lyrics this way.
          </p>
          <p>
            Since I occasionally also want to memorize anything else, there is a feature to paste in any passage you want and memorize that too!
          </p>
        </div>
      </div>
    </div>
  );
}