import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Labs from "./pages/Labs";
import Navbar from "./components/Navbar";
import Compare from "./pages/Compare"


function App() {
  return (
    <>
     <Navbar/>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/labs" element={<Labs />} />
      <Route path="/compare" element={<Compare/>}/>
    </Routes>
    </>
  );
}

export default App;
