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
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] as any); // Type assertion to fix type mismatch
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("http://localhost:3001/file-upload/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // The backend returns the file path, e.g., { fileURLToPath: 'uploads/filename.jpg' }
      if (res.data.fileURLToPath) {
        setUploadedUrl(`http://localhost:3001/${res.data.fileURLToPath}`);
      }
      alert(res.data.message);
    } catch (err) {
      alert("Upload failed!");
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
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </ButtonGroup>
      </NavBar>
      <Content>
        <WelcomeCard>
          {user.avatar && (
            <img
              src={`http://localhost:3001/uploads/${user.avatar}`}
              alt="Profile"
              style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", marginBottom: 16 }}
            />
          )}
          <h1>Welcome, {user.first_name} 👋</h1>
          <p>Email: {user.email}</p>
          <p>Username: {user.userName}</p>
          <p>Mobile: {user.mobile_no}</p>
          <p>Age: {user.age}</p>
        </WelcomeCard>
        <FileUpload>
          <form onSubmit={handleUpload}>
            <input type="file" onChange={handleFileChange} accept="image/*,application/pdf" />
            <button type="submit">Upload</button>
          </form>
          {uploadedUrl && (
            <div>
              <h4>Preview:</h4>
              <img src={uploadedUrl} alt="Uploaded" style={{ maxWidth: 300 }} />
            </div>
          )}
        </FileUpload>
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

const FileUpload = styled.div`
  margin-top: 2rem;
  text-align: center;
`;

export default Dashboard;
