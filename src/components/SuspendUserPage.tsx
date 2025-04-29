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
        const response = await axios.get(
          `http://localhost:3000/auth/user/user/${id}`,
          {
            withCredentials: true,
          }
        );
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
        { message }, // assuming your backend expects { message: string }
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

  if (!user) return <div>Loading...</div>;
  if (loading) return <LoadingScreen />;

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h2>Suspend User Confirmation</h2>
      <p>
        <strong>Name:</strong> {user.first_name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Status:</strong> {user.status}
      </p>

      <label htmlFor="reason">Reason for Suspension:</label>
      <textarea
        id="reason"
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      <button onClick={handleSuspend} disabled={!message.trim()}>
        Confirm Suspend
      </button>
    </div>
  );
};

const LoadingScreen = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
`;

export default SuspendUserPage;
