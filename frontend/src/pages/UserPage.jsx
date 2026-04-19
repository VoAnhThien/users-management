import { useState, useEffect } from "react";
import { studentAPI, lopAPI, monHocAPI, diemAPI, transferAPI, toList, clearUser } from "../api";
import Toast, { useToast } from "../components/Toast";
import ThemeToggle from "../components/ThemeToggle";
import Modal from "../components/Modal";
import "../styles/user.css";

function Spinner() { return <div className="spinner" />; }

const avatarColor = (str) => {
  const s = String(str ?? "");
  return `hsl(${[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360},65%,55%)`;
};
const getMalop = (lop) => !lop ? "" : typeof lop === "object" ? (lop.malop ?? "") : String(lop);
const getStudentMalop = (r) => getMalop(r?.lop) || getMalop(r?.malop);
const fullName = (r)   => [r?.ho, r?.ten].filter(Boolean).join(" ") || "—";

/* ─── Profile (Trang Chủ) ──────────────────────────────────────────────────────── */
function ProfileView({ user, toast }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [lops, setLops] = useState([]);
  const [form, setForm] = useState({ malopmoi: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    studentAPI.getProfile().then(d => setProfile(d)).catch(e => {
        // If getting profile fails (e.g. not a real student), show warn but don't break
        toast(e.message, "error");
    }).finally(() => setLoading(false));
  }, [toast]);

  const openTransferModal = async () => {
    try {
      const data = await lopAPI.getAll();
      setLops(toList(data));
      setShowTransfer(true);
    } catch (e) { toast(e.message, "error"); }
  };

  const submitTransfer = async () => {
    if (!form.malopmoi) return toast("Vui lòng chọn lớp học mới", "warn");
    if (!form.reason.trim()) return toast("Vui lòng nhập lý do chuyển lớp", "warn");
    setSubmitting(true);
    try {
      await transferAPI.submit(form);
      toast("🎉 Đã gửi yêu cầu chuyển lớp thành công! Vui lòng chờ Admin duyệt.");
      setShowTransfer(false);
      setForm({ malopmoi: "", reason: "" });
    } catch (e) { toast(e.message, "error"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="empty-state"><Spinner /></div>;
  if (!profile) return <div className="empty-state"><span className="icon">👤</span><p>Không tìm thấy thông tin Sinh Viên</p></div>;

  return (
    <div className="profile-dashboard">
      <div className="profile-header-banner">
        <div className="profile-avatar-large" style={{ background: avatarColor(profile.ten || profile.ho) }}>
          {(profile.ten || profile.ho || "?")[0].toUpperCase()}
        </div>
      </div>
      <div className="profile-info-card glass-card">
        <div className="profile-info-header">
           <h1 className="profile-name">{fullName(profile)}</h1>
           <span className="badge badge-blue profile-badge">{profile.mssv || "—"}</span>
        </div>
        
        <div className="profile-grid">
          <div className="profile-item">
            <span className="profile-label">Giới tính</span>
            <span className="profile-value">{profile.gioitinh ? "Nam" : "Nữ"}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Ngày sinh</span>
            <span className="profile-value">{profile.ngaysinh || "—"}</span>
          </div>
          <div className="profile-item span-2">
            <span className="profile-label">Địa chỉ</span>
            <span className="profile-value">{profile.diachi || "—"}</span>
          </div>
          <div className="profile-item profile-item-highlight span-2">
            <span className="profile-label">Lớp hiện tại</span>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10}}>
              <span className="profile-value strong-value badge badge-green" style={{fontSize: "14px"}}>{getStudentMalop(profile) || "Chưa có lớp"}</span>
              <button className="btn btn-transfer" onClick={openTransferModal}>
                🔄 Yêu cầu chuyển lớp
              </button>
            </div>
          </div>
        </div>
      </div>

      {showTransfer && (
        <Modal title="Yêu cầu chuyển lớp" onClose={() => setShowTransfer(false)}>
          <div className="form-grid">
            <div className="form-group span-2">
              <div className="alert-glass">
                <span style={{fontSize: "20px"}}>ℹ️</span> 
                <span>Yêu cầu của bạn sẽ được gửi tới Ban quản trị để phê duyệt. Lớp hiện tại của bạn là <strong>{getStudentMalop(profile)}</strong>.</span>
              </div>
            </div>
            <div className="form-group span-2">
              <label className="form-label">Chọn lớp học mới (*)</label>
              <select className="form-select" value={form.malopmoi} onChange={(e) => setForm({...form, malopmoi: e.target.value})}>
                <option value="">-- Chọn lớp --</option>
                {lops.map((l, i) => {
                  const ma = getMalop(l?.malop);
                  if (ma === getStudentMalop(profile)) return null; // Hide current class
                  const ten = l?.tenlop || ma || "Lớp";
                  return <option key={ma || i} value={ma}>{ten} ({ma || "—"})</option>;
                })}
              </select>
            </div>
            <div className="form-group span-2">
              <label className="form-label">Lý do chuyển lớp (*)</label>
              <textarea className="form-input" rows={4} placeholder="Vui lòng nêu rõ lý do..." value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})}></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowTransfer(false)} disabled={submitting}>Huỷ bỏ</button>
            <button className="btn btn-transfer-submit" onClick={submitTransfer} disabled={submitting}>
              {submitting ? <><span className="spinner-sm" /> Đang gửi...</> : "Gửi yêu cầu"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}



/* ─── Lớp ───────────────────────────────────────────────────────────────────── */
function LopView({ toast }) {
  const [rows,setRows]=useState([]); const [loading,setLoading]=useState(false);
  const [search,setSearch]=useState("");

  useEffect(()=>{
    setLoading(true);
    lopAPI.getAll().then(d=>setRows(toList(d))).catch(e=>toast(e.message,"error")).finally(()=>setLoading(false));
  },[toast]);

  const filtered=rows.filter(r=>{
    const q=search.toLowerCase();
    return(r.malop||"").toLowerCase().includes(q)||(r.tenlop||"").toLowerCase().includes(q);
  });

  return(
    <div className="view-container">
      <div className="user-page-header glass-header">
        <div>
           <h2 className="user-page-title">🏫 Danh sách Lớp</h2>
           <p className="user-page-sub">{rows.length} lớp học</p>
        </div>
      </div>
      <div className="readonly-banner">⚠ Bạn đang xem dữ liệu ở chế độ Chỉ đọc</div>
      <div className="search-bar glass-card">
        <span className="search-icon">⌕</span>
        <input className="search-input bg-transparent" placeholder="Tìm mã lớp, tên lớp…" value={search} onChange={e=>setSearch(e.target.value)}/>
        {search&&<button className="search-clear" onClick={()=>setSearch("")}>×</button>}
      </div>
      <div className="table-card glass-card">
        {loading?<div className="empty-state"><Spinner/></div>
        :filtered.length===0?<div className="empty-state"><span className="icon">🏫</span><p>Không có dữ liệu</p></div>
        :(
          <table className="data-table wow-table">
            <thead><tr>{["#","Mã lớp","Tên lớp"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((r,i)=>(
                <tr key={r.malop??i}>
                  <td style={{color:"var(--dim)",width:40, textAlign: "center"}}>{i+1}</td>
                  <td><span className="badge badge-green">{r.malop}</span></td>
                  <td><strong>{r.tenlop}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ─── Môn Học ───────────────────────────────────────────────────────────────── */
function MonHocView({ toast }) {
  const [rows,setRows]=useState([]); const [loading,setLoading]=useState(false);
  const [search,setSearch]=useState("");

  useEffect(()=>{
    setLoading(true);
    monHocAPI.getAll().then(d=>setRows(toList(d))).catch(e=>toast(e.message,"error")).finally(()=>setLoading(false));
  },[toast]);

  const filtered=rows.filter(r=>{
    const q=search.toLowerCase();
    return(r.mamh||"").toLowerCase().includes(q)||(r.tenmh||"").toLowerCase().includes(q);
  });

  return(
    <div className="view-container">
      <div className="user-page-header glass-header">
        <div>
            <h2 className="user-page-title">📚 Danh sách Môn Học</h2>
            <p className="user-page-sub">{rows.length} môn học</p>
        </div>
      </div>
      <div className="readonly-banner">⚠ Bạn đang xem dữ liệu ở chế độ Chỉ đọc</div>
      <div className="search-bar glass-card">
        <span className="search-icon">⌕</span>
        <input className="search-input bg-transparent" placeholder="Tìm mã môn, tên môn…" value={search} onChange={e=>setSearch(e.target.value)}/>
        {search&&<button className="search-clear" onClick={()=>setSearch("")}>×</button>}
      </div>
      <div className="table-card glass-card">
        {loading?<div className="empty-state"><Spinner/></div>
        :filtered.length===0?<div className="empty-state"><span className="icon">📚</span><p>Không có dữ liệu</p></div>
        :(
          <table className="data-table wow-table">
            <thead><tr>{["#","Mã môn","Tên môn học","Tiết LT","Tiết TH"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((r,i)=>(
                <tr key={r.mamh??i}>
                  <td style={{color:"var(--dim)",width:40, textAlign: "center"}}>{i+1}</td>
                  <td><span className="badge" style={{background:"rgba(251,191,36,.12)",color:"var(--yellow)",border:"1px solid rgba(251,191,36,.2)"}}>{r.mamh}</span></td>
                  <td><strong>{r.tenmh}</strong></td>
                  <td style={{textAlign:"center"}}><span className="badge badge-blue">{r.sotietlt??"—"}</span></td>
                  <td style={{textAlign:"center"}}><span className="badge badge-green">{r.sotietth??"—"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ─── Điểm ──────────────────────────────────────────────────────────────────── */
function DiemView({ toast, user }) {
  const [diems,setDiems]=useState([]); const [loading,setLoading]=useState(false);

  useEffect(() => {
    if (!user?.username) return;
    setLoading(true);
    diemAPI.getBySV(user.username)
      .then(data => setDiems(toList(data)))
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [user, toast]);

  return(
    <div className="view-container">
      <div className="user-page-header glass-header">
        <div>
            <h2 className="user-page-title">📊 Bảng Điểm Cá Nhân</h2>
            <p className="user-page-sub">Xem bảng điểm chi tiết của bạn</p>
        </div>
      </div>
      <div className="table-card glass-card">
        {loading?<div className="empty-state"><Spinner/></div>
        :diems.length===0?<div className="empty-state"><span className="icon">📋</span><p>Chưa có điểm nào</p></div>
        :(
          <table className="data-table wow-table">
            <thead><tr>{["Môn học","Học kỳ","Lần","Điểm","Xếp loại"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {diems.map((r,i)=>{
                const mh=r.monHoc;
                const d=Number(r.diem??0);
                const xl=d>=9?"Xuất sắc":d>=8?"Giỏi":d>=7?"Khá":d>=5?"Trung bình":"Không đạt";
                const cl=d>=8?"badge-green":d>=5?"badge-blue":"badge-red";
                return(
                  <tr key={i}>
                    <td>
                      <div style={{fontWeight:600}}>{mh?.tenmh||r.id?.mamh}</div>
                      <div style={{fontSize:11,color:"var(--dim)"}}>{r.id?.mamh}</div>
                    </td>
                    <td style={{textAlign:"center"}}><span className="badge badge-normal">{r.hocky??"—"}</span></td>
                    <td style={{textAlign:"center"}}><span className="badge badge-normal">{r.id?.lan??"—"}</span></td>
                    <td><span className="diem-score" style={{color:d>=8?"var(--green)":d>=5?"var(--yellow)":"var(--red)"}}>{d.toFixed(1)}</span></td>
                    <td><span className={`badge ${cl}`}>{xl}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ─── User Layout ────────────────────────────────────────────────────────────── */
const TABS=[
  {id:"profile", label:"Trang chủ", icon:"🏠"},
  {id:"lop",     label:"Lớp",      icon:"🏫"},
  {id:"monhoc",  label:"Môn Học",  icon:"📚"},
  {id:"diem",    label:"Bảng Điểm",icon:"📊"},
];

export default function UserPage({ user, onLogout }) {
  const [tab,setTab]=useState("profile");
  const {toasts,toast,remove}=useToast();
  const handleLogout=()=>{clearUser();onLogout();};

  return(
    <div className="user-layout wow-layout">
      {/* Dynamic Background Effects */}
      <div className="wow-bg-orb orb-1"></div>
      <div className="wow-bg-orb orb-2"></div>
      
      <Toast toasts={toasts} remove={remove}/>
      <nav className="user-nav glass-nav">
        <div className="user-nav-logo">
          <div className="nav-icon">✨</div>EduManage<span className="logo-sparkle">Plus</span>
        </div>
        <div className="user-nav-tabs">
          {TABS.map(t=>(
            <button key={t.id} className={`user-tab glass-tab ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>
              <span className="tab-icon">{t.icon}</span> <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="user-nav-right">
          <ThemeToggle className="theme-toggle--ghost"/>
          <div className="user-chip glass-chip">
            <div className="user-chip-avatar">{(user?.username||"U")[0].toUpperCase()}</div>
            <div className="user-chip-info">
              <div className="user-chip-name">{user?.name||user?.username||"Sinh viên"}</div>
              <div className="user-chip-role">USER</div>
            </div>
          </div>
          <button className="user-logout" onClick={handleLogout}>⏏ Đăng xuất</button>
        </div>
      </nav>
      <main className="user-main">
        {tab==="profile" &&<ProfileView  toast={toast} user={user} />}
        {tab==="lop"     &&<LopView      toast={toast}/>}
        {tab==="monhoc"  &&<MonHocView   toast={toast}/>}
        {tab==="diem"    &&<DiemView     toast={toast} user={user}/>}
      </main>
    </div>
  );
}