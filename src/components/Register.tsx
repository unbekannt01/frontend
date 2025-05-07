import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from "../api";
import { AxiosError } from "axios";

// Define the expected error response shape
interface ApiErrorResponse {
  message?: string;
}

interface RegisterFormData {
  first_name: string;
  last_name: string;
  userName: string;
  email: string;
  password: string;
  mobile_no: string;
  birth_date: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    first_name: "",
    last_name: "",
    userName: "",
    email: "",
    password: "",
    mobile_no: "",
    birth_date: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage("File size should be less than 5MB");
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(selectedFile.type)) {
        setMessage("Please upload a valid image file (JPG, PNG, or GIF)");
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formDataToSend = new FormData();

      // Append file if it exists
      if (file) {
        formDataToSend.append("avatar", file);
      }

      // Append all other form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      const response = await api.post("/auth/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status >= 200 && response.status < 300) {
        setMessage("User registered successfully! A verification link has been sent to your email.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage(response.data?.message || "Registration failed");
      }
    } catch (error: unknown) {
      console.error("Error registering user:", error);
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        setMessage(errorData.message || "Registration failed. Please try again.");
      } else {
        setMessage("Server error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
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
    
    if (droppedFile) {
      // Validate file size (5MB limit)
      if (droppedFile.size > 5 * 1024 * 1024) {
        setMessage("File size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!droppedFile.type.startsWith('image/')) {
        setMessage("Please upload a valid image file (JPG, PNG, or GIF)");
        return;
      }

      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  return (
    <StyledContainer>
      <FormCard>
        <h2>Create Your Account</h2>
        <form onSubmit={handleSubmit}>
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
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
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
              style={{ display: 'none' }}
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
                  <UploadHint>Supported formats: JPG, PNG, GIF (Max size: 5MB)</UploadHint>
                </UploadPlaceholder>
              )}
            </label>
          </FileUploadContainer>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </Button>

          <LoginSwitch>
            <p>Already have an account?</p>
            <Button type="button" onClick={() => navigate("/login")}>
              Log In
            </Button>
          </LoginSwitch>


        </form>
        {message && (
          <Message success={message.includes("successful")}>{message}</Message>
        )}
      </FormCard>
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
  color: #666;

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.6;
    filter: invert(0.8);
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

const Message = styled.p<{ success?: boolean }>`
  text-align: center;
  margin-top: 1rem;
  color: ${(props) => (props.success ? "#10B981" : "#EF4444")};
  font-size: 0.9rem;
`;

const LoginSwitch = styled.div`
  margin-top: 2rem;
  text-align: center;

  p {
    margin-bottom: 0.5rem;
    color: #666;
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
  }`;

export default Register;