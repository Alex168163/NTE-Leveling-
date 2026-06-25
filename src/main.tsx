import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ResourceProvider } from './state/resources'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ResourceProvider>
      <App />
    </ResourceProvider>
  </StrictMode>,
)
