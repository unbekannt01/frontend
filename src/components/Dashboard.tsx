import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useEffect } from "react";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user role is ADMIN (replace with your actual logic)
    const role = localStorage.getItem("role");
    if (role === "ADMIN") {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  return (
    <StyledDashboard>
      <NavBar>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </NavBar>
      <Content>
        <QuoteCard>
          <Quote>
            "Security is not about convenience. It's about protecting what matters most - your digital identity."
          </Quote>
          <Author>- Authentication Principle</Author>
        </QuoteCard>
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
  justify-content: flex-end;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

const QuoteCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 600px;
`;

const Quote = styled.p`
  color: #333;
  font-size: 1.5rem;
  line-height: 1.6;
  font-style: italic;
  margin-bottom: 1.5rem;
`;

const Author = styled.p`
  color: #666;
  font-size: 1rem;
`;

export default Dashboard;
