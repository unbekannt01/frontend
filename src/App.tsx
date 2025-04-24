import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Register from "./components/Register";
import VerifyOtp from "./components/VerifyOtp";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
// import Dashboard from "./components/Dashboard";

// Helper function to check auth status
const isAuthenticated = () => {
  const refreshToken = localStorage.getItem('refresh_token');
  return !!refreshToken;  // We only check refresh_token as access_token is in cookie
};

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!isAuthenticated() ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated() ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
      </Routes>
    </div>
  );
}

export default App;
