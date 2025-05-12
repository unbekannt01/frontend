"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import api from "../api"

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  userName: string
  mobile_no: string
  age: number
  status: string
  isBlocked: boolean
  deletedAt: Date | null
  birth_date: Date | null
  refresh_token: string
  expiryDate_token: Date | null
  is_logged_in: boolean
  is_Verified: boolean
  loginAttempts: number
  createdAt: Date
  updatedAt: Date
  suspensionReason: string | null
  avatar?: string
}

type SortOrder = "asc" | "desc"

const AdminPage = () => {
  const navigate = useNavigate()
  const [adminData, setAdminData] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortKey, setSortKey] = useState<keyof User | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [suspendMessage, setSuspendMessage] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [showUserManagement, setShowUserManagement] = useState(false)

  // Add session validation on component mount
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // First validate the refresh token
        const refresh_token = localStorage.getItem("refresh_token")
        if (refresh_token) {
          try {
            await api.post("/auth/validate-refresh-token", { refresh_token })
          } catch (error) {
            console.error("Token validation failed:", error)
            // Token is invalid, log the user out
            localStorage.removeItem("refresh_token")
            document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
            navigate("/login", {
              state: { message: "Your session was ended because you logged in on another device." },
            })
            return
          }
        }

        const response = await api.get("/user/user", {
          withCredentials: true,
        })

        if (response.data.role !== "ADMIN" && response.data.role !== "admin") {
          navigate("/dashboard")
          return
        }

        setAdminData(response.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching admin data:", error)
        navigate("/login")
      }
    }

    fetchAdminData()
  }, [navigate])

  useEffect(() => {
    if (showUserManagement) {
      const fetchUsers = async () => {
        try {
          const response = await api.get("/auth/getAllUsers", {
            withCredentials: true,
          })

          const data = response.data
          if (Array.isArray(data.users)) {
            const nonAdmins = data.users.filter((user: User) => user.role !== "admin" && user.role !== "ADMIN")
            setUsers(nonAdmins)
            setFilteredUsers(nonAdmins)
          } else {
            console.error("Invalid users format:", data)
            setUsers([])
          }
        } catch (error) {
          console.error("Error fetching users:", error)
          setUsers([])
        }
      }

      fetchUsers()
    }
  }, [showUserManagement])

  useEffect(() => {
    if (!showUserManagement) return

    let tempUsers = [...users]

    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      tempUsers = tempUsers.filter(
        (user) => user.email.toLowerCase().includes(lower) || user.userName.toLowerCase().includes(lower),
      )
    }

    if (statusFilter !== "all") {
      tempUsers = tempUsers.filter((user) => user.status === statusFilter)
    }

    if (sortKey) {
      tempUsers.sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        if (aVal == null) return 1
        if (bVal == null) return -1
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal
        }
        return 0
      })
    }

    setFilteredUsers(tempUsers)
  }, [searchTerm, statusFilter, sortKey, sortOrder, users, showUserManagement])

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true })
      localStorage.removeItem("refresh_token")
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const updateUserInState = (
    id: string,
    newStatus: string,
    deletedAt: Date | null,
    suspensionReason: string | null = null,
  ) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, status: newStatus, deletedAt, suspensionReason } : user)),
    )
  }

  const openSuspendModal = async (user: User) => {
    setSelectedUser(user)
    setSuspendMessage("")
    setIsModalOpen(true)
    setModalLoading(false)
  }

  const closeSuspendModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
    setSuspendMessage("")
  }

  const handleSuspend = async () => {
    if (!selectedUser) return
    setModalLoading(true)
    try {
      await api.patch(
        `/auth/suspend/${selectedUser.id}`,
        { message: suspendMessage },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      )
      updateUserInState(selectedUser.id, "SUSPENDED", null, suspendMessage)
      closeSuspendModal()
    } catch (error) {
      console.error("Suspension failed", error)
    } finally {
      setModalLoading(false)
    }
  }

  const reactivateUser = async (id: string) => {
    try {
      await api.patch(`/auth/reActivated/${id}`, {}, { withCredentials: true })
      updateUserInState(id, "ACTIVE", null)
    } catch (error) {
      console.error("Reactivation failed:", error)
    }
  }

  const restoreUser = async (id: string) => {
    try {
      await api.patch(`/auth/restore/${id}`, {}, { withCredentials: true })
      updateUserInState(id, "ACTIVE", null)
    } catch (error) {
      console.error("Restore failed:", error)
    }
  }

  const unblockUser = async (id: string) => {
    try {
      await api.patch(`/auth/unblock/${id}`, {}, { withCredentials: true })
      updateUserInState(id, "ACTIVE", null)
    } catch (error) {
      console.error("Unblock failed:", error)
    }
  }

  const softDeleteUser = async (id: string) => {
    try {
      await api.delete(`/auth/softDelete/${id}`, {
        withCredentials: true,
      })
      updateUserInState(id, "INACTIVE", new Date())
    } catch (error) {
      console.error("Soft delete failed:", error)
    }
  }

  const hardDeleteUser = async (id: string) => {
    try {
      await api.delete(`/auth/hardDelete/${id}`, {
        withCredentials: true,
      })
      setUsers((prev) => prev.filter((user) => user.id !== id))
    } catch (error) {
      console.error("Hard delete failed:", error)
    }
  }

  const handleSort = (key: keyof User) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  const toggleUserManagement = () => {
    setShowUserManagement(!showUserManagement)
  }

  if (loading) {
    return <LoadingScreen>Loading admin data...</LoadingScreen>
  }

  const handleUpdateProfile = () => {
    navigate("/update-profile")
  }

  return (
    <StyledAdminPage>
      <NavBar>
        <UserInfo>Admin Panel</UserInfo>
        {showUserManagement ? (
          <ButtonGroup>
            <AdminProfileButton onClick={toggleUserManagement}>Back to Profile</AdminProfileButton>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </ButtonGroup>
        ) : (
          <ButtonGroup>
            <AdminProfileButton onClick={toggleUserManagement}>Manage Users</AdminProfileButton>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </ButtonGroup>
        )}
      </NavBar>

      <Content>
        {!showUserManagement && adminData && (
          <AdminProfileCard>
            {adminData.avatar && (
              <Avatar src={`http://localhost:3001/uploads/${adminData.avatar}`} alt="Admin Profile" />
            )}
            {!adminData.avatar && (
              <AvatarPlaceholder>
                {adminData.first_name?.[0]}
                {adminData.last_name?.[0]}
              </AvatarPlaceholder>
            )}
            <AdminName>
              {adminData.first_name} {adminData.last_name}
            </AdminName>
            <AdminRole>{adminData.role}</AdminRole>
            <AdminInfo>
              <InfoItem>
                <InfoLabel>Email:</InfoLabel>
                <InfoValue>{adminData.email}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Username:</InfoLabel>
                <InfoValue>{adminData.userName}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Mobile:</InfoLabel>
                <InfoValue>{adminData.mobile_no || "N/A"}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Status:</InfoLabel>
                <InfoValue>{adminData.status}</InfoValue>
              </InfoItem>
            </AdminInfo>
            <ManageUsersButton onClick={handleUpdateProfile}>Update Profile</ManageUsersButton>
          </AdminProfileCard>
        )}

        {showUserManagement && (
          <>
            <Controls>
              <input
                type="text"
                placeholder="Search by username or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </Controls>

            <TableWrapper>
              <UserTable>
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th onClick={() => handleSort("id")}>ID</th>
                    <th>Role</th>
                    <th onClick={() => handleSort("userName")}>Username</th>
                    <th>Name</th>
                    <th>DOB</th>
                    <th>Mobile</th>
                    <th onClick={() => handleSort("email")}>Email</th>
                    <th>Status</th>
                    <th>Refresh Token</th>
                    <th>Token Expiry</th>
                    <th>Age</th>
                    <th>Logged In</th>
                    <th>Verified</th>
                    <th>Attempts</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Blocked</th>
                    <th>Suspension Reason</th>
                    <th>Deleted</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          {user.deletedAt ? (
                            <Button onClick={() => restoreUser(user.id)}>Restore</Button>
                          ) : user.isBlocked ? (
                            <>
                              <Button onClick={() => unblockUser(user.id)}>Unblock</Button>
                              <Button onClick={() => softDeleteUser(user.id)}>Soft Delete</Button>
                              <Button onClick={() => hardDeleteUser(user.id)}>Hard Delete</Button>
                            </>
                          ) : user.status === "SUSPENDED" ? (
                            <>
                              <Button onClick={() => reactivateUser(user.id)}>Reactivate</Button>
                              <Button onClick={() => softDeleteUser(user.id)}>Soft Delete</Button>
                              <Button onClick={() => hardDeleteUser(user.id)}>Hard Delete</Button>
                            </>
                          ) : (
                            <>
                              <Button onClick={() => openSuspendModal(user)}>Suspend</Button>
                              <Button onClick={() => softDeleteUser(user.id)}>Soft Delete</Button>
                              <Button onClick={() => hardDeleteUser(user.id)}>Hard Delete</Button>
                            </>
                          )}
                        </td>

                        <td>{user.id}</td>
                        <td>{user.role}</td>
                        <td>{user.userName}</td>
                        <td>
                          {user.first_name} {user.last_name}
                        </td>
                        <td>{user.birth_date ? new Date(user.birth_date).toLocaleDateString() : "N/A"}</td>
                        <td>{user.mobile_no}</td>
                        <td>{user.email}</td>
                        <td>{user.status}</td>
                        <td>{user.refresh_token ? `${user.refresh_token.slice(0, 10)}...` : "N/A"}</td>
                        <td>{user.expiryDate_token ? new Date(user.expiryDate_token).toLocaleString() : "N/A"}</td>
                        <td>{user.age}</td>
                        <td>{user.is_logged_in ? "Yes" : "No"}</td>
                        <td>{user.is_Verified ? "Yes" : "No"}</td>
                        <td>{user.loginAttempts}</td>
                        <td>{new Date(user.createdAt).toLocaleString()}</td>
                        <td>{new Date(user.updatedAt).toLocaleString()}</td>
                        <td>{user.isBlocked ? "Yes" : "No"}</td>
                        <td>{user.suspensionReason ?? "N/A"}</td>
                        <td>{user.deletedAt ? new Date(user.deletedAt).toLocaleString() : "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={20}>No data found.</td>
                    </tr>
                  )}
                </tbody>
              </UserTable>
            </TableWrapper>
          </>
        )}
      </Content>

      {isModalOpen && selectedUser && (
        <ModalOverlay>
          <ModalContent>
            <ModalNavBar>
              <ModalTitle>Suspend User</ModalTitle>
              <CloseButton onClick={closeSuspendModal}>Close</CloseButton>
            </ModalNavBar>
            <ModalFormWrapper>
              {modalLoading ? (
                <LoadingScreen>Loading...</LoadingScreen>
              ) : (
                <>
                  <h2>Confirm Suspension</h2>
                  <p>
                    <strong>Name:</strong> {selectedUser.first_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedUser.status}
                  </p>
                  <label htmlFor="reason">Reason for Suspension:</label>
                  <TextArea
                    id="reason"
                    rows={4}
                    value={suspendMessage}
                    onChange={(e) => setSuspendMessage(e.target.value)}
                    placeholder="Enter suspension reason"
                  />
                  <Button onClick={handleSuspend} disabled={!suspendMessage.trim() || modalLoading}>
                    Confirm Suspend
                  </Button>
                </>
              )}
            </ModalFormWrapper>
          </ModalContent>
        </ModalOverlay>
      )}
    </StyledAdminPage>
  )
}

// Styled Components
const StyledAdminPage = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
`

const NavBar = styled.nav`
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  align-items: center;
`

const UserInfo = styled.div`
  font-weight: bold;
  color: #333;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`

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
`

const AdminProfileButton = styled.button`
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
`

const Content = styled.main`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 800px;

  input,
  select {
    padding: 0.5rem;
    font-size: 1rem;
  }

  input {
    flex: 1;
  }
`

const LoadingScreen = styled.div`
  font-size: 1.5rem;
  color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  font-size: 0.95rem;

  th,
  td {
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    text-align: left;
    vertical-align: top;
    cursor: default;
  }

  th {
    background-color: #f5f7fa;
    cursor: pointer;
  }

  tr:hover {
    background-color: #f1f1f1;
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;
    th,
    td {
      padding: 0.5rem;
    }
  }
`

const Button = styled.button`
  padding: 0.4rem 0.75rem;
  border: none;
  background: #764ba2;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  margin: 0.25rem;
  font-size: 0.75rem;
  transition: background 0.3s;

  &:hover {
    background: #6a3e92;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`

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
`

const ModalContent = styled.div`
  background: #f5f7fa;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`

const ModalNavBar = styled.nav`
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const ModalTitle = styled.div`
  font-weight: bold;
  color: #333;
`

const CloseButton = styled.button`
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
`

const ModalFormWrapper = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

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
`

const TextArea = styled.textarea`
  width: 100%;
  margin: 0.5rem 0 1.5rem;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
`

// New styled components for admin profile
const AdminProfileCard = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  width: 100%;
`

const Avatar = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #764ba2;
  margin-bottom: 1.5rem;
`

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
`

const AdminName = styled.h2`
  margin: 0.5rem 0;
  font-size: 1.8rem;
  color: #333;
`

const AdminRole = styled.div`
  background: #764ba2;
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
`

const AdminInfo = styled.div`
  width: 100%;
`

const InfoItem = styled.div`
  display: flex;
  margin: 0.8rem 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.8rem;
`

const InfoLabel = styled.div`
  width: 30%;
  font-weight: bold;
  color: #555;
`

const InfoValue = styled.div`
  width: 70%;
  color: #333;
`

const ManageUsersButton = styled.button`
  padding: 0.8rem 2rem;
  background: #764ba2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    background: #663993;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`

export default AdminPage
