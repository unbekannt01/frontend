import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from "../api";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  userName: string;
  mobile_no: string;
  age: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/user/user");
        setUser(response.data);
      } catch (error) {
        console.error("Unauthorized or session expired:", error);
        localStorage.clear();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );

      console.log("Logout successful", response.data);

      // 1. Remove refresh_token from localStorage
      localStorage.removeItem("refresh_token");

      // 2. Redirect to homepage
      navigate("/"); // or navigate('/login') if you want
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return <LoadingScreen>Loading Dashboard...</LoadingScreen>;
  }

  if (!user) {
    return null;
  }

  return (
    <StyledDashboard>
      <NavBar>
        <UserInfo>
          {user.first_name} {user.last_name} ({user.role})
        </UserInfo>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </NavBar>
      <Content>
        <WelcomeCard>
          <h1>Welcome, {user.first_name} 👋</h1>
          <p>Email: {user.email}</p>
          <p>Username: {user.userName}</p>
          <p>Mobile: {user.mobile_no}</p>
          <p>Age: {user.age}</p>
        </WelcomeCard>
      </Content>
    </StyledDashboard>
  );
};

const StyledDashboard = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
`;

const NavBar = styled.nav`
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  align-items: center;
`;

const UserInfo = styled.div`
  font-weight: bold;
  color: #333;
`;

const LogoutButton = styled.button`
  padding: 0.5rem 1.5rem;
  border: 2px solid #764ba2;
  border-radius: 8px;
  background: transparent;
  color: #764ba2;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #764ba2;
    color: white;
  }
`;

const Content = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 70px);
  padding: 2rem;
`;

const WelcomeCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;

  h1 {
    margin-bottom: 1.5rem;
  }

  p {
    color: #666;
    margin-bottom: 0.5rem;
  }
`;

const LoadingScreen = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
`;

export default Dashboard;
