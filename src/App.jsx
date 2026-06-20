import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index"
import Scoreboard from "./pages/Scoreboard"
import Grading from "./pages/Grading"
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Index />} />
        <Route path="grading" element={<Grading />} />
        <Route path="scoreboard" element={<Scoreboard />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App