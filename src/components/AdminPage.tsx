import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  userName: string;
  mobile_no: string;
  age: number;
  status: string;
  isBlocked: boolean;
  deletedAt: Date | null;
  birth_date: Date | null;
  refresh_token: string;
  expiryDate_token : Date | null;
  is_logged_in: boolean;
  is_Verified: boolean;
  loginAttempts: number;
  createdAt: Date;
  updatedAt: Date;
  suspensionReason: string | null;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/auth/getAllUsers",
          {
            withCredentials: true,
          }
        );

        const data = response.data;
        if (Array.isArray(data.users)) {
          // Exclude admin from the user list
          const filteredUsers = data.users.filter(
            (user: User) => user.role !== "admin"
          );
          setUsers(filteredUsers);
        } else {
          console.error("Invalid users format:", data);
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/auth/logout",
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("refresh_token");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const suspendUser = async (id: string) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/auth/suspend/${id}`,
        { reason: "Violation of terms" },
        { withCredentials: true }
      );
      alert(response.data.message);
      updateUserInState(id, "SUSPENDED", null);
    } catch (error) {
      console.error("Suspend failed:", error);
    }
  };

  const reactivateUser = async (id: string) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/auth/reActivated/${id}`,
        {},
        { withCredentials: true }
      );
      alert(response.data.message);
      updateUserInState(id, "ACTIVE", null);
    } catch (error) {
      console.error("Reactivation failed:", error);
    }
  };

  const restoreUser = async (id: string) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/auth/restore/${id}`,
        {},
        { withCredentials: true }
      );
      alert(response.data.message);
      updateUserInState(id, "ACTIVE", null);
    } catch (error) {
      console.error("Restore failed:", error);
    }
  };

  const unblockUser = async (id: string) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/auth/unblock/${id}`,
        {},
        { withCredentials: true }
      );
      alert(response.data.message);
      updateUserInState(id, "ACTIVE", null);
    } catch (error) {
      console.error("Unblock failed:", error);
    }
  };

  const softDeleteUser = async (id: string) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/auth/softDelete/${id}`,
        { withCredentials: true }
      );
      alert(response.data.message);
      updateUserInState(id, "INACTIVE", new Date());
    } catch (error) {
      console.error("Soft delete failed:", error);
    }
  };

  const hardDeleteUser = async (id: string) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/auth/hardDelete/${id}`,
        { withCredentials: true }
      );
      alert(response.data.message);
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Hard delete failed:", error);
    }
  };

  const updateUserInState = (
    id: string,
    newStatus: string,
    deletedAt: Date | null
  ) => {
    setUsers(
      users.map((user) =>
        user.id === id ? { ...user, status: newStatus, deletedAt } : user
      )
    );
  };

  return (
    <StyledAdminPage>
      <NavBar>
        <UserInfo>Admin Panel</UserInfo>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </NavBar>
      <Content>
        {loading ? (
          <LoadingMessage>Loading user data...</LoadingMessage>
        ) : (
          <UserTable>
            <thead>
              <tr>
                <th>ID</th>
                <th>Role</th>
                <th>Username</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Birth Date</th>
                <th>Mobile No</th>
                <th>Email</th>
                <th>Status</th>
                <th>Refresh Token</th>
                <th>Token Expiry</th>
                <th>Age</th>
                <th>Is Logged In</th>
                <th>Is Verified</th>
                <th>Login Attempts</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Is Blocked</th>
                <th>Suspension Reason</th>
                <th>Deleted At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.role}</td>
                    <td>{user.userName}</td>
                    <td>{user.first_name}</td>
                    <td>{user.last_name}</td>
                    <td>
                      {user.birth_date
                        ? new Date(user.birth_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>{user.mobile_no}</td>
                    <td>{user.email}</td>
                    <td>{user.status}</td>
                    <td>{user.refresh_token ?? "N/A"}</td>
                    <td>
                      {user.expiryDate_token
                        ? new Date(user.expiryDate_token).toLocaleString()
                        : "N/A"}
                    </td>
                    <td>{user.age}</td>
                    <td>{user.is_logged_in ? "Yes" : "No"}</td>
                    <td>{user.is_Verified ? "Yes" : "No"}</td>
                    <td>{user.loginAttempts}</td>
                    <td>{new Date(user.createdAt).toLocaleString()}</td>
                    <td>{new Date(user.updatedAt).toLocaleString()}</td>
                    <td>{user.isBlocked ? "Yes" : "No"}</td>
                    <td>{user.suspensionReason ?? "N/A"}</td>
                    <td>
                      {user.deletedAt
                        ? new Date(user.deletedAt).toLocaleString()
                        : "N/A"}
                    </td>
                    <td>
                      {user.isBlocked && (
                        <Button onClick={() => unblockUser(user.id)}>
                          Unblock
                        </Button>
                      )}
                      {!user.isBlocked && user.status === "SUSPENDED" && (
                        <Button onClick={() => reactivateUser(user.id)}>
                          Reactivate
                        </Button>
                      )}
                      {!user.isBlocked &&
                        user.status !== "SUSPENDED" &&
                        !user.deletedAt && (
                          <Button onClick={() => suspendUser(user.id)}>
                            Suspend
                          </Button>
                        )}
                      {user.deletedAt === null && (
                        <Button onClick={() => softDeleteUser(user.id)}>
                          Soft Delete
                        </Button>
                      )}
                      {user.deletedAt !== null && (
                        <Button onClick={() => restoreUser(user.id)}>
                          Restore
                        </Button>
                      )}
                      <Button onClick={() => hardDeleteUser(user.id)}>
                        Hard Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={21}>No users found.</td>
                </tr>
              )}
            </tbody>
          </UserTable>
        )}
      </Content>
    </StyledAdminPage>
  );
};

// Styled Components (unchanged)
const StyledAdminPage = styled.div`
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: calc(100vh - 70px);
`;

const LoadingMessage = styled.div`
  font-size: 1.5rem;
  color: #333;
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  text-align: left;

  th,
  td {
    padding: 1rem;
    border: 1px solid #ddd;
  }

  th {
    background-color: #f5f7fa;
  }

  tr:hover {
    background-color: #f1f1f1;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  background: #764ba2;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: background 0.3s;

  &:hover {
    background: #6a3e92;
  }
`;

export default AdminPage;
