/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from "../api";
import { AxiosError } from "axios";

interface LoginFormData {
  identifier: string;
  password: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const Login = () => {
  const navigate = useNavigate();
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    identifier: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        console.log("Google script loaded");
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin,
        });

        const googleButtonElement = document.getElementById("googleButton");
        if (googleButtonElement) {
          console.log("Google button element found");
          window.google.accounts.id.renderButton(googleButtonElement, {
            type: "standard",
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signin_with",
            shape: "rectangular",
          });
        } else {
          console.log("Google button element not found");
        }
      } else {
        console.log("Google script not loaded");
      }
    };

    // Check if Google script is already loaded
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Wait for Google script to load
      const checkGoogleScript = setInterval(() => {
        if (window.google) {
          console.log("Google script loaded after waiting");
          clearInterval(checkGoogleScript);
          initializeGoogleSignIn();
        }
      }, 100);

      // Clear interval after 5 seconds if Google script doesn't load
      setTimeout(() => {
        clearInterval(checkGoogleScript);
        console.log("Google script loading timeout");
      }, 5000);
    }
  }, []);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginFormData({
      ...loginFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/login", loginFormData);
      const data = response.data;

      if (data?.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("userEmail", loginFormData.identifier);
        document.cookie = `access_token=${data.access_token}; path=/; secure; samesite=lax`;
        navigate("/dashboard");
      } else {
        setMessage("Login failed");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setMessage(err.response?.data?.message || "Server error occurred");
    }
    setLoading(false);
  };

  const handleResendRedirect = () => {
    navigate("/email-verification");
  };

  const handleGoogleLogin = async (response: any) => {
    try {
      setLoading(true);
      setMessage("");

      const result = await api.post("/google/google-login", {
        credential: response.credential,
      });

      if (result.data?.refresh_token) {
        localStorage.setItem("refresh_token", result.data.refresh_token);
        document.cookie = `access_token=${result.data.access_token}; path=/; secure; samesite=lax`;
        navigate("/dashboard");
      } else {
        setMessage("Google login failed");
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setMessage(err.response?.data?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledContainer>
      <FormCard>
        <h2>Log In</h2>
        <form onSubmit={handleLoginSubmit}>
          <Input
            type="text"
            name="identifier"
            placeholder="Email or Username"
            value={loginFormData.identifier}
            onChange={handleLoginChange}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={loginFormData.password}
            onChange={handleLoginChange}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Logging In..." : "Log In"}
          </Button>
        </form>
        <Divider>
          <span>
            <b>OR</b>
          </span>
        </Divider>
        <div id="googleButton"></div>
        {message && <Message success={false}>{message}</Message>}
        <ResendSection>
          <h3>Missed the verification email?</h3>
          <Button onClick={handleResendRedirect}>
            Resend Verification Email
          </Button>
        </ResendSection>
        <RegisterSwitch>
          <p>Don't have an account?</p>
          <Button type="button" onClick={() => navigate("/register")}>
            Register
          </Button>
        </RegisterSwitch>

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
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;

  h2 {
    color: #333;
    text-align: center;
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

const ResendSection = styled.div`
  margin-top: 2rem;
  border-top: 1px solid #eef2ff;
  padding-top: 1rem;
  text-align: center;

  h3 {
    color: #333;
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #eef2ff;
  }

  span {
    padding: 0 1rem;
    color: #666;
    font-size: 0.9rem;
  }
`;

const RegisterSwitch = styled.div`
  margin-top: 2rem;
  text-align: center;

  p {
    margin-bottom: 0.5rem;
    color: #666;
  }
`;


export default Login;
