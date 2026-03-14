import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserList from './qluser'; // Import file bạn vừa viết

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đây chính là chỗ tạo ra đường dẫn BASE_FE/users cho thầy nè */}
        <Route path="/users" element={<UserList />} />
        
        {/* Trang mặc định khi mới vào link Vercel */}
        <Route path="/" element={<h2>Chào mừng thầy đến với bài tập của nhóm!</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;