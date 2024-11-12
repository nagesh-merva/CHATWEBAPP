import { ContextProvider } from './contexts/MainContext'
import Dashboard from './contexts/DashBoard'
function App() {

  return (
    < ContextProvider>
      <Dashboard />
    </ContextProvider>
  )
}

export default App