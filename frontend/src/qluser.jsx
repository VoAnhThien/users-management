import { useEffect, useState } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('https://be-xdudweb.onrender.com/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Lỗi fetch data:", err));
  }, []);

  return (
    <table border="1" style={{ width: '50%', textAlign: 'left', marginTop: '20px', borderCollapse: 'collapse' }}>
  <thead style={{ backgroundColor: '#f2f2f2' }}>
    <tr>
      <th style={{ padding: '10px' }}>ID</th>
      <th style={{ padding: '10px' }}>Name</th>
    </tr>
  </thead>
  <tbody>
    {users.map(user => (
      <tr key={user.id}>
        <td style={{ padding: '10px' }}>{user.id}</td>
        <td style={{ padding: '10px' }}>{user.name}</td>
      </tr>
    ))}
  </tbody>
</table>
  )
}
export default UserList;