import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CreateRoomPage } from "./pages/CreateRoom/CreateRoomPage";
import { LandingPage } from "./pages/Landing/LandingPage";
import { Room } from "./pages/Room/Room";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreateRoomPage />} />
        <Route path="/rooms/:roomId" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
