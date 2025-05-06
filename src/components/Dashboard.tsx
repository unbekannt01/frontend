import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from "../api";

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
  avatar?: string;
  status: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // const [file, setFile] = useState(null);
  // const [uploadedUrl, setUploadedUrl] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/user/user");
        // Redirect if the user is an admin
        if (response.data.role === "ADMIN") {
          navigate("/admin");
        }
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
      const response = await api.post(
        "/auth/logout",
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

  const handleUpdateProfile = () => {
    navigate("/update-profile");
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
        <ButtonGroup>
          <UpdateButton onClick={handleUpdateProfile}>Update Profile</UpdateButton>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </ButtonGroup>
      </NavBar>
      <Content>
        <ProfileCard>
          {user.avatar ? (
            <Avatar
              src={`http://localhost:3001/uploads/${user.avatar}`}
              alt="User Profile"
            />
          ) : (
            <AvatarPlaceholder>
              {user.first_name?.[0]}{user.last_name?.[0]}
            </AvatarPlaceholder>
          )}

          <Name>{user.first_name} {user.last_name}</Name>
          <RoleTag>{user.role}</RoleTag>

          <InfoSection>
            <InfoItem>
              <InfoLabel>Email:</InfoLabel>
              <InfoValue>{user.email}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Username:</InfoLabel>
              <InfoValue>{user.userName}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Mobile:</InfoLabel>
              <InfoValue>{user.mobile_no || "N/A"}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Status:</InfoLabel>
              <InfoValue>{user.status}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Age:</InfoLabel>
              <InfoValue>{user.age || "N/A"}</InfoValue>
            </InfoItem>
          </InfoSection>
        </ProfileCard>
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const UpdateButton = styled.button`
  padding: 0.5rem 1.5rem;
  border: 2px solid #4CAF50;
  border-radius: 8px;
  background: transparent;
  color: #4CAF50;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #4CAF50;
    color: white;
  }
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
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LoadingScreen = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  width: 100%;
`;

const Avatar = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #764ba2;
  margin-bottom: 1.5rem;
`;

const AvatarPlaceholder = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: #764ba2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
`;

const Name = styled.h2`
  margin: 0.5rem 0;
  font-size: 1.8rem;
  color: #333;
`;

const RoleTag = styled.div`
  background: #764ba2;
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
`;

const InfoSection = styled.div`
  width: 100%;
`;

const InfoItem = styled.div`
  display: flex;
  margin: 0.8rem 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.8rem;
`;

const InfoLabel = styled.div`
  width: 30%;
  font-weight: bold;
  color: #555;
`;

const InfoValue = styled.div`
  width: 70%;
  color: #333;
`;

// const ActionButton = styled.button`
//   margin-top: 1.5rem;
//   padding: 0.6rem 1.2rem;
//   background: #764ba2;
//   color: white;
//   border: none;
//   border-radius: 8px;
//   font-weight: bold;
//   cursor: pointer;
//   transition: background 0.3s ease;

//   &:hover {
//     background: #5a3789;
//   }
// `;

export default Dashboard;
