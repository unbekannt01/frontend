import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from "../api";
import { AxiosError } from "axios";

interface UpdateFormData {
  first_name: string;
  last_name: string;
  userName: string;
  mobile_no: string;
  birth_date: string;
}

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UpdateFormData>({
    first_name: "",
    last_name: "",
    userName: "",
    mobile_no: "",
    birth_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/user/user");
        const userData = response.data;
        setFormData({
          first_name: userData.first_name,
          last_name: userData.last_name,
          userName: userData.userName,
          mobile_no: userData.mobile_no,
          birth_date: userData.birth_date,
        });
        setUserEmail(userData.email);
        if (userData.avatar) {
          setPreview(`http://localhost:3001/uploads/${userData.avatar}`);
        }
      } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        setMessage(err.response?.data?.message || "Failed to fetch user data");
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!userEmail) {
        setMessage("User email not found. Please login again.");
        return;
      }

      const formDataToSend = new FormData();

      // Append file if exists
      if (file) {
        formDataToSend.append("avatar", file);
      }

      // Append all other form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      const response = await api.patch(
        `/user/update?email=${userEmail}`,
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (
        response.data &&
        response.data.message &&
        response.data.message.toLowerCase().includes("successfully")
      ) {
        setMessage("Profile updated successfully!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setMessage(response.data?.message || "Failed to update profile");
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setMessage(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  return (
    <Container>
      <FormCard>
        <h2>Update Profile</h2>
        <form onSubmit={handleSubmit}>
          <FileUploadContainer
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            isDragging={isDragging}
          >
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: "none" }}
            />
            <label htmlFor="file-upload">
              {preview ? (
                <PreviewImage src={preview} alt="Preview" />
              ) : (
                <UploadPlaceholder>
                  <UploadIcon>👤</UploadIcon>
                  <UploadText>
                    Drag and drop your profile picture here, or click to select
                  </UploadText>
                  <UploadHint>
                    Supported formats: JPG, PNG, GIF (Max size: 5MB)
                  </UploadHint>
                </UploadPlaceholder>
              )}
            </label>
          </FileUploadContainer>
          <InputGroup>
            <Input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </InputGroup>
          <Input
            type="text"
            name="userName"
            placeholder="Username"
            value={formData.userName}
            onChange={handleChange}
            required
          />
          <Input
            type="tel"
            name="mobile_no"
            placeholder="Mobile Number"
            value={formData.mobile_no}
            onChange={handleChange}
            required
          />
          <DateInput
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
        {message && (
          <Message success={message.includes("successfully")}>
            {message}
          </Message>
        )}
      </FormCard>
    </Container>
  );
};

const Container = styled.div`
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

const InputGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
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

const DateInput = styled(Input)`
  color: #333;
`;

const FileUploadContainer = styled.div<{ isDragging: boolean }>`
  border: 2px dashed ${props => props.isDragging ? '#667eea' : '#eef2ff'};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  background: ${props => props.isDragging ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
`;

const PreviewImage = styled.img`
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
`;

const UploadPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const UploadIcon = styled.div`
  font-size: 2.5rem;
`;

const UploadText = styled.p`
  color: #666;
  margin: 0;
`;

const UploadHint = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #5a67d8;
  }

  &:disabled {
    background: #a5b4fc;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ success: boolean }>`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  background: ${(props) => (props.success ? "#c6f6d5" : "#fed7d7")};
  color: ${(props) => (props.success ? "#2f855a" : "#c53030")};
`;

export default UpdateProfile;
