// Import shims first to ensure compatibility with packages
import './shims';

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Import Tailwind CSS
import './essential.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './hooks/useAuth';

// Create a root.
const container = document.getElementById('root');

// Initial render.
if (container) {
  ReactDOM.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>,
    container
  );
} else {
  throw new Error('Root container not found');
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
