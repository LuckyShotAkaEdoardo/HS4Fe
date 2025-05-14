export type ThemeName =
  | 'napoli'
  | 'nwb'
  | 'bwn'
  | 'fire'
  | 'ice'
  | 'light'
  | 'dark'
  | 'magic'
  | 'rock'
  | 'forest'
  | 'plain';
export const Themes: Record<ThemeName, Record<string, string>> = {
  napoli: {
    '--bg-color': '#007bff',
    '--text-color': '#ffffff',
    '--accent-color': '#00d4ff',
    '--card-bg': '#0056b3',
    '--button-bg': '#00aaff',
    '--button-text': '#ffffff',
    '--border-color': '#66ccff',
    '--dropdown-bg': '#004a99',
  },
  nwb: {
    '--bg-color': '#ffffff',
    '--text-color': '#000000',
    '--accent-color': '#444444',
    '--card-bg': '#f0f0f0',
    '--button-bg': '#dddddd',
    '--button-text': '#000000',
    '--border-color': '#cccccc',
    '--dropdown-bg': '#ffffff',
  },
  bwn: {
    '--bg-color': '#000000',
    '--text-color': '#ffffff',
    '--accent-color': '#777777',
    '--card-bg': '#1a1a1a',
    '--button-bg': '#333333',
    '--button-text': '#ffffff',
    '--border-color': '#666666',
    '--dropdown-bg': '#1e1e1e',
  },
  fire: {
    '--bg-color': '#2a0a0a',
    '--text-color': '#ffb199',
    '--accent-color': '#ff5722',
    '--card-bg': '#3b1c1c',
    '--button-bg': '#ff7043',
    '--button-text': '#fff0e6',
    '--border-color': '#ff5722',
    '--dropdown-bg': '#4c2a2a',
  },
  ice: {
    '--bg-color': '#e0f7fa',
    '--text-color': '#004d60',
    '--accent-color': '#00acc1',
    '--card-bg': '#b2ebf2',
    '--button-bg': '#26c6da',
    '--button-text': '#003c50',
    '--border-color': '#00acc1',
    '--dropdown-bg': '#c2f0f5',
  },
  light: {
    '--bg-color': '#fff8e1',
    '--text-color': '#5e4b00',
    '--accent-color': '#ffeb3b',
    '--card-bg': '#fffde7',
    '--button-bg': '#ffecb3',
    '--button-text': '#5e4b00',
    '--border-color': '#fbc02d',
    '--dropdown-bg': '#fffbe1',
  },
  dark: {
    '--bg-color': '#0a0a0a',
    '--text-color': '#d8d8d8',
    '--accent-color': '#7e57c2',
    '--card-bg': '#1e1e1e',
    '--button-bg': '#3a3a3a',
    '--button-text': '#eeeeee',
    '--border-color': '#5e35b1',
    '--dropdown-bg': '#2a2a2a',
  },
  magic: {
    '--bg-color': '#1b0032',
    '--text-color': '#e6d1ff',
    '--accent-color': '#9c27b0',
    '--card-bg': '#2e0a4d',
    '--button-bg': '#6a1b9a',
    '--button-text': '#f3e5f5',
    '--border-color': '#ab47bc',
    '--dropdown-bg': '#32104d',
  },
  rock: {
    '--bg-color': '#3e3e3e',
    '--text-color': '#dcdcdc',
    '--accent-color': '#8d6e63',
    '--card-bg': '#555555',
    '--button-bg': '#6d4c41',
    '--button-text': '#f5f5f5',
    '--border-color': '#8d6e63',
    '--dropdown-bg': '#444444',
  },
  forest: {
    '--bg-color': '#1b3a1b',
    '--text-color': '#e0f2e9',
    '--accent-color': '#4caf50',
    '--card-bg': '#2e5939',
    '--button-bg': '#388e3c',
    '--button-text': '#e8f5e9',
    '--border-color': '#66bb6a',
    '--dropdown-bg': '#355d42',
  },
  plain: {
    '--bg-color': '#f5f5dc',
    '--text-color': '#3e3e1f',
    '--accent-color': '#a2c523',
    '--card-bg': '#eaeac2',
    '--button-bg': '#d2df96',
    '--button-text': '#3e3e1f',
    '--border-color': '#cddc39',
    '--dropdown-bg': '#f0f0c4',
  },
};
