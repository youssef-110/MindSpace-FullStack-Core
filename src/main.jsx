import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts: no request to Google, so visitor IPs are never shared with a font CDN.
import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/inter/wght.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
