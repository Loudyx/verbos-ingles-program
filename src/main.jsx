import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { VerbGame } from './components/VerbGame'
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VerbGame />
  </StrictMode>,
)
