import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

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
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for receiving access_token cookie
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        // Store refresh token and role
        localStorage.setItem('refresh_token', data.refresh_token);
        if (data.role) {
          localStorage.setItem('role', data.role);
        }
        if (data.role === "ADMIN") {
          setTimeout(() => navigate('/admin'), 2000);
        } else {
          setTimeout(() => navigate('/dashboard'), 2000);
        }
        // window.location.href = '/dashboard'; // Force reload to ensure cookie is set
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch {
      setMessage("Server error occurred");
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
