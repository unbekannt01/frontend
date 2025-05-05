import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import api from "../api";
import { AxiosError } from "axios";

interface ApiErrorResponse {
  message?: string;
}

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setMessage("Invalid verification link");
        setError(true);
        setLoading(false);
        return;
      }

      try {
        console.log("Verifying token:", token); // Debug token
        const response = await api.post(`/email-verification-by-link/verify-email?token=${token}`); // Fix endpoint and request
        const data = response.data;

        if (response.status >= 200 && response.status < 300) {
          setMessage(data.message || "Email verified successfully! You can now log in.");
        } else {
          setMessage(data.message || "Verification failed");
          setError(true);
        }
      } catch (err: unknown) {
        console.error("Verification error:", err); // Debug error
        if (err instanceof AxiosError && err.response?.data) {
          const errorData = err.response.data as ApiErrorResponse;
          if (errorData.message?.includes("Invalid or expired verification token")) {
            setMessage("Email may already be verified. Please proceed to login.");
          } else {
            setMessage(errorData.message || "Verification failed. Please try again.");
          }
          setError(true);
        } else {
          setMessage("Failed to connect to the server. Please try again.");
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <StyledContainer>
      <VerifyCard>
        <h2>Email Verification</h2>
        {loading ? (
          <Message>Loading...</Message>
        ) : (
          <>
            <Message error={error}>{message}</Message>
            <Button onClick={handleLoginRedirect}>Go to Login</Button>
          </>
        )}
      </VerifyCard>
    </StyledContainer>
  );
};

// Styled components (unchanged)
const StyledContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const VerifyCard = styled.div`
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

const Message = styled.p<{ error?: boolean }>`
  text-align: center;
  margin: 1rem 0;
  color: ${(props) => (props.error ? "#EF4444" : "#10B981")};
  font-size: 1rem;
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
`;

export default VerifyEmail;