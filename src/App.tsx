import './App.css';

function App() {
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
        />
        <div className="button-container">
          <button className="go-button">go</button>
        </div>
      </section>

      <div className="divider">
        <h3>or</h3>
        <p>search up a song through its title and get the lyrics!</p>
      </div>

      <section className="search-section">
        <div className="search-bar">
          {/* Hamburger Menu Icon */}
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

          {/* Magnifying Glass Icon */}
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