import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from "../api";
import axios from "axios";

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/login", form);

      // Handle response for successful login
      localStorage.setItem("refresh_token", response.data.refresh_token);
      if (response.data.role) {
        localStorage.setItem("role", response.data.role);
      }

      setMessage("Login successful!");

      // Redirect based on user role
      setTimeout(() => {
        if (response.data.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 1000);
    } catch (error: unknown) {
      setLoading(false);

      // Narrow down the error type
      if (axios.isAxiosError(error)) {
        // Axios error handling (e.g., bad status code, or no response)
        if (error.response) {
          const responseMessage = error.response.data.message;
          if (
            responseMessage ===
            "Your account is blocked due to multiple failed login attempts."
          ) {
            setMessage(
              "Your account is blocked due to too many failed login attempts."
            );
          } else { 
            setMessage(responseMessage || "Login failed. Please try again.");
          }
        } else {
          setMessage("Network error. Please try again.");
        }
      } else if (error instanceof Error) {
        // Generic error handling if it's a non-Axios error
        setMessage(error.message || "An unexpected error occurred.");
      } else {
        // If it's some other unknown error type
        setMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <StyledContainer>
      <FormCard>
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        {message && (
          <Message error={message.includes("failed")}>{message}</Message>
        )}
      </FormCard>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const FormCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.8rem;
  margin: 1rem 0;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    background-color: #cccccc;
  }
`;

const Message = styled.div<{ error?: boolean }>`
  color: ${(props) => (props.error ? "#dc3545" : "#28a745")};
  text-align: center;
  margin-top: 1rem;
`;

export default Login;
