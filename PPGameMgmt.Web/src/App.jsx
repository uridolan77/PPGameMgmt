import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import './styles/layout.css'  // Import layout styling

// Import our components
import Layout from './components/Layout'
import GamesList from './components/Games/GamesList'
import GameDetail from './components/Games/GameDetail'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<GamesList />} />
          <Route path="/games" element={<GamesList />} />
          <Route path="/games/:id" element={<GameDetail />} />
          {/* Add more routes as needed */}
        </Route>
      </Routes>
    </div>
  )
}

export default App
