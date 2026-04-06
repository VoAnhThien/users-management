import { useState } from "react";
import { authAPI, setUser } from "../api";
import Toast, { useToast } from "../components/Toast";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/login.css";

export default function Login({ onLogin }) {
  const [tab, setTab]     = useState("login");
  const [show, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const { toasts, toast, remove } = useToast();

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [regForm,   setRegForm]   = useState({ username: "", password: "", confirmPassword: "", role: "user" });

  const setL = (k) => (e) => setLoginForm((f) => ({ ...f, [k]: e.target.value }));
  const setR = (k) => (e) => setRegForm((f)   => ({ ...f, [k]: e.target.value }));

  /* ─── Login ─── */
  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      toast("Vui lòng nhập đầy đủ thông tin", "error"); return;
    }
    setLoading(true);
    try {
      const data = await authAPI.login(loginForm);

      const user = data?.user ?? data;
      localStorage.setItem("user", JSON.stringify(user));
      if (!user?.username) throw new Error("Phản hồi từ server không hợp lệ");

      setUser(user);
      onLogin(user);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Register ─── */
  const handleRegister = async () => {
    if (!regForm.username || !regForm.password) {
      toast("Vui lòng nhập đầy đủ thông tin", "error"); return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      toast("Mật khẩu xác nhận không khớp", "error"); return;
    }
    setLoading(true);
    try {
      await authAPI.register({
        username: regForm.username,
        password: regForm.password,
        role:     regForm.role === "admin" ? "ROLE_ADMIN" : "ROLE_USER",
      });
      toast("Đăng ký thành công! Hãy đăng nhập.", "success");
      setTab("login");
      setLoginForm({ username: regForm.username, password: "" });
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const onKey = (fn) => (e) => { if (e.key === "Enter") fn(); };

  return (
    <div className="login-page">
      <div className="login-theme-corner">
        <ThemeToggle className="theme-toggle--ghost" />
      </div>
      <Toast toasts={toasts} remove={remove} />
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🎓</div>
          <div>
            <div className="login-logo-name">EduManage</div>
            <div className="login-logo-sub">Hệ thống quản lý sinh viên</div>
          </div>
        </div>

        <div className="login-tabs">
          <button className={`login-tab ${tab==="login"?"active":""}`}    onClick={()=>setTab("login")}>Đăng nhập</button>
          <button className={`login-tab ${tab==="register"?"active":""}`} onClick={()=>setTab("register")}>Đăng ký</button>
        </div>

        {/* ── LOGIN ── */}
        {tab === "login" && (
          <>
            <div className="login-field">
              <label className="login-label">Tên đăng nhập</label>
              <input className="login-input" placeholder="username"
                value={loginForm.username} onChange={setL("username")}
                onKeyDown={onKey(handleLogin)} autoComplete="username" />
            </div>
            <div className="login-field">
              <label className="login-label">Mật khẩu</label>
              <div className="login-input-wrap">
                <input className="login-input has-toggle"
                  type={show?"text":"password"} placeholder="••••••••"
                  value={loginForm.password} onChange={setL("password")}
                  onKeyDown={onKey(handleLogin)} autoComplete="current-password" />
                <button className="login-eye" onClick={()=>setShow(!show)}>
                  {show?"🙈":"👁️"}
                </button>
              </div>
            </div>
            <button className="login-btn" onClick={handleLogin} disabled={loading}>
              {loading ? <><span className="spinner-sm" /> Đang đăng nhập…</> : "Đăng nhập →"}
            </button>
          </>
        )}

        {/* ── REGISTER ── */}
        {tab === "register" && (
          <>
            <div className="login-field">
              <label className="login-label">Tên đăng nhập</label>
              <input className="login-input" placeholder="Chọn username"
                value={regForm.username} onChange={setR("username")} autoComplete="username" />
            </div>
            <div className="login-field">
              <label className="login-label">Mật khẩu</label>
              <div className="login-input-wrap">
                <input className="login-input has-toggle"
                  type={show?"text":"password"} placeholder="Mật khẩu"
                  value={regForm.password} onChange={setR("password")} />
                <button className="login-eye" onClick={()=>setShow(!show)}>
                  {show?"🙈":"👁️"}
                </button>
              </div>
            </div>
            <div className="login-field">
              <label className="login-label">Xác nhận mật khẩu</label>
              <input className="login-input" type="password" placeholder="Nhập lại mật khẩu"
                value={regForm.confirmPassword} onChange={setR("confirmPassword")}
                onKeyDown={onKey(handleRegister)} />
            </div>
            <div className="login-field">
              <label className="login-label">Vai trò</label>
              <div className="login-role-row">
                {[{val:"admin",label:"Admin",icon:"⚙️"},{val:"user",label:"Sinh Viên",icon:"🎓"}].map(({val,label,icon})=>(
                  <button key={val}
                    className={`login-role-card ${regForm.role===val?`selected-${val}`:""}`}
                    onClick={()=>setRegForm(f=>({...f,role:val}))}>
                    <span className="icon">{icon}</span>{label}
                  </button>
                ))}
              </div>
            </div>
            <button className="login-btn" onClick={handleRegister} disabled={loading}>
              {loading ? <><span className="spinner-sm" /> Đang đăng ký…</> : "Tạo tài khoản →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}