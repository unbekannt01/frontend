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

      const response = await api.patch(`/user/update?email=${userEmail}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

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

  return (
    <Container>
      <FormCard>
        <h2>Update Profile</h2>
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

const Message = styled.p<{ success: boolean }>`
  text-align: center;
  margin-top: 1rem;
  color: ${props => props.success ? '#10B981' : '#EF4444'};
  font-size: 0.9rem;
`;

export default UpdateProfile; 