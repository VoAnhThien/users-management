import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserList from './qluser';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/users" element={<UserList />} />
        
        <Route path="/" element={<h2>Chào mừng thầy đến với bài tập của nhóm!</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;