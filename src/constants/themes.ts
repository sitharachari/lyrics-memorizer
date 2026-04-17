// src/constants/themes.ts
import { Theme } from '../types';

// --- THEME CONFIGURATION ---
const THEMES: Theme[] = [
  { id: 'default', name: 'Pine & Sand', colors: { '--color-sand': '#D2CB8F', '--color-neon-green': '#019A59', '--color-button-green': '#00674F', '--color-input-bg': '#00383D', '--color-bg-dark': '#021B32', '--color-error-orange': '#E07A5F' } },
  { id: 'aqua', name: 'Aqua Turquoise', colors: { '--color-bg-dark': '#201142', '--color-input-bg': '#254D7F', '--color-button-green': '#30A4B1', '--color-neon-green': '#6ED8B3', '--color-sand': '#DFFBD3', '--color-error-orange': '#FF6B6B' } },
  { id: 'pink', name: 'Cherry Frost', colors: { '--color-bg-dark': '#480930', '--color-input-bg': '#B51260', '--color-button-green': '#FE327D', '--color-neon-green': '#FE80AF', '--color-sand': '#FFDBE9', '--color-error-orange': '#FFD166' } },
  { id: 'sunset', name: 'Caramel Sunset', colors: { '--color-bg-dark': '#25203F', '--color-input-bg': '#7A4B5B', '--color-button-green': '#CC765D', '--color-neon-green': '#FEB872', '--color-sand': '#FEECD6', '--color-error-orange': '#06D6A0' } },
  { id: 'purple', name: 'Indigo Velvet', colors: { '--color-bg-dark': '#24143F', '--color-input-bg': '#4E3677', '--color-button-green': '#8761AF', '--color-neon-green': '#C795D9', '--color-sand': '#EFDCEF', '--color-error-orange': '#FF595E' } },
  { id: 'red-velvet', name: 'Night Bordeaux', colors: { '--color-bg-dark': '#480412', '--color-input-bg': '#7D0F19', '--color-button-green': '#BB2D26', '--color-neon-green': '#E1AD86', '--color-sand': '#F5DCB9', '--color-error-orange': '#00F5D4' } }
];