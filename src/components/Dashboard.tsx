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

interface ChangePasswordData {
  email: string;
  password: string;
  newpwd: string;
  confirmPassword: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    email: "",
    password: "",
    newpwd: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");

    if (!user?.email) {
      setPasswordMessage("User email not found. Please try again.");
      return;
    }

    if (passwordData.newpwd !== passwordData.confirmPassword) {
      setPasswordMessage("New passwords do not match");
      return;
    }

    try {
      const response = await api.post(
        "/auth/changepwd",
        {
          email: user.email,
          password: passwordData.password,
          newpwd: passwordData.newpwd,
        },
        {
          withCredentials: true,
        }
      );  

      if (response.status === 200) {
        setShowSuccessPopup(true);
        setShowPasswordModal(false);
        setPasswordData({
          email: "",
          password: "",
          newpwd: "",
          confirmPassword: "",
        });
        
        // Hide success popup after 3 seconds
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 3000);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to change password";
      setPasswordMessage(errorMessage);
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
        <ButtonGroup>
          <UpdateButton onClick={handleUpdateProfile}>Update Profile</UpdateButton>
          <ChangePasswordButton onClick={() => setShowPasswordModal(true)}>
            Change Password
          </ChangePasswordButton>
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
      {showPasswordModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <h2>Change Password</h2>
              <CloseButton onClick={() => setShowPasswordModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <form onSubmit={handlePasswordSubmit}>
                <InputGroup>
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    name="password"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    required
                  />
                </InputGroup>
                <InputGroup>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    name="newpwd"
                    value={passwordData.newpwd}
                    onChange={handlePasswordChange}
                    required
                  />
                </InputGroup>
                <InputGroup>
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </InputGroup>
                {passwordMessage && (
                  <Message success={passwordMessage.includes("Successfully")}>
                    {passwordMessage}
                  </Message>
                )}
                <ButtonGroup>
                  <SubmitButton type="submit">Change Password</SubmitButton>
                  <CancelButton type="button" onClick={() => setShowPasswordModal(false)}>
                    Cancel
                  </CancelButton>
                </ButtonGroup>
              </form>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
      {showSuccessPopup && (
        <SuccessPopup>
          <SuccessIcon>✓</SuccessIcon>
          <SuccessMessage>Password changed successfully!</SuccessMessage>
        </SuccessPopup>
      )}
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

const ChangePasswordButton = styled(UpdateButton)`
  background: #4CAF50;
  border-color: #4CAF50;
  color: white;

  &:hover {
    background: #45a049;
    border-color: #45a049;
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
  padding: 2rem;
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;

  h2 {
    margin: 0;
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
  }
`;

const Message = styled.div<{ success?: boolean }>`
  padding: 0.75rem;
  margin: 1rem 0;
  border-radius: 4px;
  background: ${props => props.success ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.success ? '#2e7d32' : '#c62828'};
  font-size: 0.9rem;
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #45a049;
  }
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #e0e0e0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;

  &:hover {
    color: #333;
  }
`;

const SuccessPopup = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: #4CAF50;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
  z-index: 1100;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const SuccessIcon = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const SuccessMessage = styled.div`
  font-size: 1rem;
  font-weight: 500;
`;

export default Dashboard;
