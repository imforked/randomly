import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CreateRoomPage } from "./pages/CreateRoom/CreateRoomPage";
import { LandingPage } from "./pages/Landing/LandingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreateRoomPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
