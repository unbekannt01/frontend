import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from "../api";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (!storedEmail) {
      navigate("/forgot-password");
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage("Email not found. Please try again.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/otp/verify-otp", { email, otp });
      
      if (response.data) {
        navigate("/reset-password");
      } else {
        setMessage("Verification failed");
      }
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
      const response = await api.post("/otp/resend-otp", { email });
      if (response.data) {
        setMessage("OTP resent successfully!");
      }
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Failed to resend OTP");
    }
    setResendLoading(false);
  };

  return (
    <StyledContainer>
      <FormCard>
        <h2>Verify OTP</h2>
        <p className="subtitle">Enter the verification code sent to {email}</p>
        <form onSubmit={handleSubmit}>
          <OtpInput
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            maxLength={6}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>
        <ResendButton 
          type="button" 
          onClick={handleResendOtp} 
          disabled={resendLoading}
        >
          {resendLoading ? "Sending..." : "Resend OTP"}
        </ResendButton>
        {message && (
          <Message success={message.includes("successfully") || message.includes("sent")}>
            {message}
          </Message>
        )}
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
    margin-bottom: 1rem;
  }

  .subtitle {
    color: #666;
    margin-bottom: 2rem;
    font-size: 0.9rem;
  }
`;

const OtpInput = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 1rem;
  border: 2px solid #eef2ff;
  border-radius: 8px;
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 0.5rem;
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
    cursor: not-allowed;
  }
`;

const ResendButton = styled.button`
  background: transparent;
  border: 2px solid #667eea;
  color: #667eea;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background: #667eea10;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Message = styled.p<{ success?: boolean }>`
  margin-top: 1rem;
  color: ${props => props.success ? '#10B981' : '#EF4444'};
  font-size: 0.9rem;
`;

export default VerifyOtp;
