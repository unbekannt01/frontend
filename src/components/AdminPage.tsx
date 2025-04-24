import styled from "styled-components";

const AdminPage = () => {
  return (
    <AdminContainer>
      <h1>Welcome to the Admin Page</h1>
      <p>You have admin privileges.</p>
    </AdminContainer>
  );
};

const AdminContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #764ba2;
`;

export default AdminPage;
