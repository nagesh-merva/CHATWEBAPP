import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ContextProvider } from './contexts/MainContext'
import Dashboard from './DashBoard'
import LoginPage from './login'
import RegisterPage from './register'

function App() {

  return (
    < ContextProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </ContextProvider>
  )
}

export default App