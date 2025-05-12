import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from "../api";
import { AxiosError } from "axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (!storedEmail) {
      navigate("/forgot-password");
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // First check if user is suspended
      const userResponse = await api.get(`/user/check-status/${email}`);

      if (userResponse.data.status === "SUSPENDED") {
        setMessage(
          "This account has been suspended. Please contact admin support."
        );
        setLoading(false);
        return;
      }

      console.log("Sending reset request with:", {
        email,
        newpwd: formData.password,
      });
      const response = await api.post("/auth/resetpwd", {
        email,
        newpwd: formData.password,
      });

      console.log("Reset response:", response.data);

      if (response.data?.message) {
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("refresh_token");
        document.cookie =
          "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login", {
            state: {
              message:
                "Password has been reset successfully. Please login with your new password.",
              email: email,
            },
          });
        }, 2000);
      } else {
        setMessage("Failed to reset password. Please try again.");
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setMessage(err.response?.data?.message || "Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <h2>Reset Password</h2>
        <p>Enter your new password</p>
        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            name="password"
            placeholder="New Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
          {message && <Message>{message}</Message>}
        </form>
      </FormCard>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const FormCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;

  h2 {
    color: #333;
    text-align: center;
    margin-bottom: 1rem;
  }

  p {
    color: #666;
    text-align: center;
    margin-bottom: 2rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 1rem;
  border: 2px solid #eef2ff;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  text-align: center;
  margin-top: 1rem;
  color: #ef4444;
  font-size: 0.9rem;
`;

export default ResetPassword;
