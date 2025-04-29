import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

interface User {
  first_name: string;
  email: string;
  status: string;
}

const SuspendUserPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/user/getUserById/${id}`, {
            withCredentials: true,
          });
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }, [id]);
    

  const handleSuspend = async () => {
    try {
      await axios.patch(
        `http://localhost:3000/auth/suspend/${id}`,
        { message },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      alert("User suspended successfully.");
      navigate("/admin");
    } catch (error) {
      console.error("Suspension failed", error);
    }
  };

  if (loading) return <LoadingScreen>Loading user data...</LoadingScreen>;
  if (!user) return <LoadingScreen>User not found</LoadingScreen>;

  return (
    <PageWrapper>
      <NavBar>
        <Title>Suspend User</Title>
        <BackButton onClick={() => navigate("/admin")}>Back</BackButton>
      </NavBar>

      <Content>
        <FormWrapper>
          <h2>Confirm Suspension</h2>
          <p><strong>Name:</strong> {user.first_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Status:</strong> {user.status}</p>

          <label htmlFor="reason">Reason for Suspension:</label>
          <TextArea
            id="reason"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter suspension reason"
          />

          <Button onClick={handleSuspend} disabled={!message.trim()}>
            Confirm Suspend
          </Button>
        </FormWrapper>
      </Content>
    </PageWrapper>
  );
};

// Styled components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
`;

const NavBar = styled.nav`
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.div`
  font-weight: bold;
  color: #333;
`;

const BackButton = styled.button`
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
  padding: 2rem;
  display: flex;
  justify-content: center;
`;

const FormWrapper = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  max-width: 600px;
  width: 100%;

  h2 {
    margin-bottom: 1rem;
  }

  p {
    margin: 0.5rem 0;
  }

  label {
    font-weight: bold;
    margin-top: 1rem;
    display: block;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  margin: 0.5rem 0 1.5rem;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  border: none;
  background: #764ba2;
  color: white;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #6a3e92;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingScreen = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  color: #555;
`;

export default SuspendUserPage;
