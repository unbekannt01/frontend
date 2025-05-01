import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from "../api";

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleResendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/resend-verification", { email });
      const data = response.data; // Access .data directly

      if (response.status >= 200 && response.status < 300) {
        setMessage("Verification email resent successfully! Check your inbox.");
      } else {
        setMessage(data.message || "Failed to resend verification email");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      setMessage(
        error.response?.data?.message ||
          "Failed to resend verification email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <StyledContainer>
      <FormCard>
        <h2>Resend Verification Email</h2>
        <form onSubmit={handleResendSubmit}>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Resend Verification Email"}
          </Button>
        </form>
        {message && (
          <Message success={message.includes("successfully")}>
            {message}
          </Message>
        )}
        <BackButton onClick={handleBackToLogin}>Back to Log In</BackButton>
      </FormCard>
    </StyledContainer>
  );
};

// Styled components remain unchanged
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
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  text-align: center;

  h2 {
    color: #333;
    margin-bottom: 2rem;
    font-size: 1.8rem;
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

const Message = styled.p<{ success: boolean }>`
  text-align: center;
  margin-top: 1rem;
  color: ${(props) => (props.success ? "#10B981" : "#EF4444")};
  font-size: 0.9rem;
`;

const BackButton = styled.button`
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 2px solid #667eea;
  color: #667eea;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

export default EmailVerificationPage;