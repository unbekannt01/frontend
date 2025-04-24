import { Link } from "react-router-dom";
import styled from "styled-components";

const Home = () => {
  return (
    <StyledHome>
      <div className="content">
        <h1>Welcome to Auth System</h1>
        <div className="auth-buttons">
          <Link to="/login" className="btn">Login</Link>
          <Link to="/register" className="btn">Register</Link>
        </div>
      </div>
    </StyledHome>
  );
};

const StyledHome = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .content {
    text-align: center;
    padding: 2rem;
    
    h1 {
      color: white;
      margin-bottom: 2rem;
      font-size: 2.5rem;
    }
  }

  .auth-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;

    .btn {
      padding: 0.8rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      background: white;
      color: #764ba2;
      font-weight: 600;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
    }
  }
`;

export default Home;
