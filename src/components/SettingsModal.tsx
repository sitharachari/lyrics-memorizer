import { THEMES } from '../constants/themes';

export default function SettingsModal({ currentThemeId, onSelectTheme, onClose, onClearData }: { currentThemeId: string, onSelectTheme: (id: string) => void, onClose: () => void, onClearData: () => void }) {
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