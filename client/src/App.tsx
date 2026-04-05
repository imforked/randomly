import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CreateRoomPage } from './pages/CreateRoomPage'
import { LandingPage } from './pages/LandingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreateRoomPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
