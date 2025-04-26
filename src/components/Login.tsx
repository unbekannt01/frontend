import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from '../api'

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
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', form); // 👈 changed from fetch

      // Store refresh token and role
      localStorage.setItem('refresh_token', response.data.refresh_token);
      if (response.data.role) {
        localStorage.setItem('role', response.data.role);
      }

      if (response.data.role === "ADMIN") {
        setTimeout(() => navigate('/admin'), 2000);
      } else {
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error: unknown) {
      if (error instanceof Error && (error as { response?: { data?: { message?: string } } })?.response?.data?.message) {
        const errorMsg = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "An unknown error occurred";
        setMessage(errorMsg);
      } else {
        setMessage("Login failed");
      }
    }
    setLoading(false);
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
            onChange={(e) => setForm({...form, email: e.target.value})}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        {message && <Message error>{message}</Message>}
      </FormCard>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
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
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;

  h2 {
    color: #333;
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
    box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
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
  }
`;

const Message = styled.p<{ error?: boolean }>`
  margin-top: 1rem;
  color: ${props => props.error ? '#ef4444' : '#10b981'};
`;

export default Login;
