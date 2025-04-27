import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// Import our components
import GamesList from './components/Games/GamesList'
import GameDetail from './components/Games/GameDetail'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<GamesList />} />
          <Route path="/games" element={<GamesList />} />
          <Route path="/games/:id" element={<GameDetail />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  )
}

export default App
