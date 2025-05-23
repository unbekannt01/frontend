import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Register from "./components/Register";
import VerifyEmail from "./components/VerifyEmail";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AdminPage from "./components/AdminPage";
import EmailVerificationPage from "./components/EmailVerificationPage";
import UpdateProfile from "./components/UpdateProfile";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import VerifyOtp from "./components/VerifyOtp";
// import CheckTokenGuard from "./components/CheckTokenGuard";

// Helper function to check auth status
const isAuthenticated = () => {
  const refreshToken = localStorage.getItem("refresh_token");
  return !!refreshToken; // We only check refresh_token as access_token is in cookie
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* <CheckTokenGuard /> */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            !isAuthenticated() ? <Login /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/register"
          element={
            !isAuthenticated() ? <Register /> : <Navigate to="/dashboard" />
          }
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/email-verification" element={<EmailVerificationPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </div>
  );
}

export default App;
