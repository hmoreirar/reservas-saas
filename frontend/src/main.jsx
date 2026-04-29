import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import BookingPage from './BookingPage.jsx'

const path = window.location.pathname

if (path.startsWith('/book/')) {
  const slug = path.replace('/book/', '')
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BookingPage slug={slug} />
    </StrictMode>,
  )
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
