import { useState, useEffect, useCallback } from "react";
import { studentAPI, lopAPI, monHocAPI, diemAPI, toList, clearToken, clearUser } from "../api";
import Toast, { useToast } from "../components/Toast";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/user.css";

function Spinner() { return <div className="spinner" />; }

const avatarColor = (str = "") =>
  `hsl(${[...str].reduce((a, c) => a + c.charCodeAt(0), 0) % 360},55%,42%)`;

/* ─── Sinh Viên (read-only) ──────────────────────────────────────────────────── */
function SinhVienView({ toast }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    setLoading(true);
    studentAPI.getAll()
      .then(d => setRows(toList(d)))
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return ["hoten","mssv","email","malop"].some(k => (r[k]||"").toLowerCase().includes(q));
  });

  return (
    <>
      <div className="user-page-header">
        <h2 className="user-page-title">🎓 Danh sách Sinh Viên</h2>
        <p className="user-page-sub">{rows.length} sinh viên</p>
      </div>

      <div className="readonly-banner">⚠ Chế độ xem — bạn không có quyền chỉnh sửa dữ liệu</div>

      <div className="search-bar">
        <span className="search-icon">⌕</span>
        <input className="search-input" placeholder="Tìm tên, MSSV, email, lớp…"
          value={search} onChange={e=>setSearch(e.target.value)} />
        {search && <button className="search-clear" onClick={()=>setSearch("")}>×</button>}
      </div>

      <div className="table-card">
        {loading ? <div className="empty-state"><Spinner /></div>
        : filtered.length===0 ? <div className="empty-state"><span className="icon">🎓</span><p>Không có dữ liệu</p></div>
        : (
          <table className="data-table">
            <thead><tr>{["#","Họ và tên","MSSV","Email","SĐT","Lớp","GPA"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((r,i)=>(
                <tr key={r.id??r._id??i}>
                  <td style={{color:"var(--dim)",width:40}}>{i+1}</td>
                  <td>
                    <div className="cell-avatar">
                      <div className="row-avatar" style={{background:avatarColor(r.hoten)}}>{(r.hoten||"?")[0].toUpperCase()}</div>
                      <strong>{r.hoten||"—"}</strong>
                    </div>
                  </td>
                  <td><span className="badge badge-blue">{r.mssv||"—"}</span></td>
                  <td style={{color:"var(--muted)"}}>{r.email||"—"}</td>
                  <td style={{color:"var(--muted)"}}>{r.sdt||r.phone||"—"}</td>
                  <td><span className="badge badge-green">{r.malop||r.lop||"—"}</span></td>
                  <td>
                    {r.gpa!=null
                      ? <span className={`gpa-val ${r.gpa>=3.5?"gpa-hi":r.gpa>=2.5?"gpa-mid":"gpa-lo"}`}>{Number(r.gpa).toFixed(1)}</span>
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* ─── Lớp (read-only) ────────────────────────────────────────────────────────── */
function LopView({ toast }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    setLoading(true);
    lopAPI.getAll()
      .then(d => setRows(toList(d)))
      .catch(e => toast(e.message,"error"))
      .finally(() => setLoading(false));
  }, [toast]);

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return ["malop","tenlop","khoa"].some(k=>(r[k]||"").toLowerCase().includes(q));
  });

  return (
    <>
      <div className="user-page-header">
        <h2 className="user-page-title">🏫 Danh sách Lớp</h2>
        <p className="user-page-sub">{rows.length} lớp học</p>
      </div>

      <div className="readonly-banner">⚠ Chế độ xem — bạn không có quyền chỉnh sửa dữ liệu</div>

      <div className="search-bar">
        <span className="search-icon">⌕</span>
        <input className="search-input" placeholder="Tìm mã lớp, tên lớp, khoa…"
          value={search} onChange={e=>setSearch(e.target.value)} />
        {search && <button className="search-clear" onClick={()=>setSearch("")}>×</button>}
      </div>

      <div className="table-card">
        {loading ? <div className="empty-state"><Spinner /></div>
        : filtered.length===0 ? <div className="empty-state"><span className="icon">🏫</span><p>Không có dữ liệu</p></div>
        : (
          <table className="data-table">
            <thead><tr>{["#","Mã lớp","Tên lớp","Khoa","Niên khoá"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((r,i)=>(
                <tr key={r.id??r._id??i}>
                  <td style={{color:"var(--dim)",width:40}}>{i+1}</td>
                  <td><span className="badge badge-green">{r.malop||"—"}</span></td>
                  <td><strong>{r.tenlop||"—"}</strong></td>
                  <td style={{color:"var(--muted)"}}>{r.khoa||r.faculty||"—"}</td>
                  <td style={{color:"var(--muted)"}}>{r.nienkhoa||r.year||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* ─── Môn Học (read-only) ────────────────────────────────────────────────────── */
function MonHocView({ toast }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    setLoading(true);
    monHocAPI.getAll()
      .then(d => setRows(toList(d)))
      .catch(e => toast(e.message,"error"))
      .finally(() => setLoading(false));
  }, [toast]);

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return ["mamh","tenmh","khoa"].some(k=>(r[k]||"").toLowerCase().includes(q));
  });

  return (
    <>
      <div className="user-page-header">
        <h2 className="user-page-title">📚 Danh sách Môn Học</h2>
        <p className="user-page-sub">{rows.length} môn học</p>
      </div>

      <div className="readonly-banner">⚠ Chế độ xem — bạn không có quyền chỉnh sửa dữ liệu</div>

      <div className="search-bar">
        <span className="search-icon">⌕</span>
        <input className="search-input" placeholder="Tìm mã môn, tên môn, khoa…"
          value={search} onChange={e=>setSearch(e.target.value)} />
        {search && <button className="search-clear" onClick={()=>setSearch("")}>×</button>}
      </div>

      <div className="table-card">
        {loading ? <div className="empty-state"><Spinner /></div>
        : filtered.length===0 ? <div className="empty-state"><span className="icon">📚</span><p>Không có dữ liệu</p></div>
        : (
          <table className="data-table">
            <thead><tr>{["#","Mã môn","Tên môn học","Số TC","Khoa"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((r,i)=>(
                <tr key={r.id??r._id??i}>
                  <td style={{color:"var(--dim)",width:40}}>{i+1}</td>
                  <td><span className="badge" style={{background:"rgba(251,191,36,.12)",color:"var(--yellow)",border:"1px solid rgba(251,191,36,.2)"}}>{r.mamh||"—"}</span></td>
                  <td><strong>{r.tenmh||r.tenmonhoc||"—"}</strong></td>
                  <td style={{textAlign:"center"}}><span className="badge badge-blue">{r.sotc??r.tinchi??"—"}</span></td>
                  <td style={{color:"var(--muted)"}}>{r.khoa||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* ─── Điểm (lookup by MSSV) ─────────────────────────────────────────────────── */
function DiemView({ toast }) {
  const [diems, setDiems]     = useState([]);
  const [monhocs, setMonhocs] = useState([]);
  const [mssv, setMssv]       = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    monHocAPI.getAll().then(d=>setMonhocs(toList(d))).catch(()=>{});
  }, []);

  const lookup = async () => {
    if (!mssv.trim()) { toast("Nhập MSSV để tra cứu","warn"); return; }
    setLoading(true);
    try {
      const data = await diemAPI.getBySV(mssv.trim());
      setDiems(toList(data)); setSearched(true);
    } catch (e) { toast(e.message,"error"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="user-page-header">
        <h2 className="user-page-title">📊 Tra cứu Điểm</h2>
        <p className="user-page-sub">Xem điểm số theo MSSV</p>
      </div>

      <div style={{display:"flex",gap:12,marginBottom:20,maxWidth:460}}>
        <input
          className="diem-search-input"
          placeholder="Nhập MSSV của sinh viên…"
          value={mssv}
          onChange={e=>setMssv(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&lookup()}
        />
        <button className="diem-search-btn" onClick={lookup} disabled={loading}>
          {loading?<span className="spinner-sm"/>:"Tra cứu"}
        </button>
      </div>

      <div className="table-card">
        {loading ? <div className="empty-state"><Spinner /></div>
        : !searched ? <div className="empty-state"><span className="icon">🔍</span><p>Nhập MSSV để xem điểm</p></div>
        : diems.length===0 ? <div className="empty-state"><span className="icon">📋</span><p>Không tìm thấy điểm cho MSSV này</p></div>
        : (
          <table className="data-table">
            <thead><tr>{["Mã MH","Tên môn học","Lần thi","Điểm","Xếp loại"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {diems.map((r,i)=>{
                const mh = monhocs.find(m=>m.mamh===r.mamh);
                const d  = Number(r.diem??r.score??0);
                const xl = d>=9?"Xuất sắc":d>=8?"Giỏi":d>=7?"Khá":d>=5?"Trung bình":"Không đạt";
                const cl = d>=8?"gpa-hi":d>=5?"gpa-mid":"gpa-lo";
                return (
                  <tr key={i}>
                    <td><span className="badge" style={{background:"rgba(251,191,36,.12)",color:"var(--yellow)",border:"1px solid rgba(251,191,36,.2)"}}>{r.mamh||"—"}</span></td>
                    <td><strong>{mh?.tenmh||r.tenmh||"—"}</strong></td>
                    <td style={{textAlign:"center"}}>{r.lan??r.lanthi??1}</td>
                    <td><span className={`gpa-val ${cl}`}>{d.toFixed(1)}</span></td>
                    <td><span className={`badge ${d>=8?"badge-green":d>=5?"badge-blue":"badge-red"}`}>{xl}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* ─── User Layout ────────────────────────────────────────────────────────────── */
const TABS = [
  { id:"sinhvien", label:"Sinh Viên", icon:"🎓" },
  { id:"lop",      label:"Lớp",       icon:"🏫" },
  { id:"monhoc",   label:"Môn Học",   icon:"📚" },
  { id:"diem",     label:"Điểm",      icon:"📊" },
];

export default function UserPage({ user, onLogout }) {
  const [tab, setTab] = useState("sinhvien");
  const { toasts, toast, remove } = useToast();

  const handleLogout = () => { clearToken(); clearUser(); onLogout(); };

  return (
    <div className="user-layout">
      <Toast toasts={toasts} remove={remove} />

      {/* NAVBAR */}
      <nav className="user-nav">
        <div className="user-nav-logo">
          <div className="nav-icon">🎓</div>
          EduManage
        </div>

        <div className="user-nav-tabs">
          {TABS.map(t=>(
            <button key={t.id}
              className={`user-tab ${tab===t.id?"active":""}`}
              onClick={()=>setTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="user-nav-right">
          <ThemeToggle className="theme-toggle--ghost" />
          <div className="user-chip">
            <div className="user-chip-avatar">{(user?.username||"U")[0].toUpperCase()}</div>
            <div>
              <div className="user-chip-name">{user?.username||"Sinh viên"}</div>
              <div className="user-chip-role">USER</div>
            </div>
          </div>
          <button className="user-logout" onClick={handleLogout}>⏏ Đăng xuất</button>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="user-main">
        {tab==="sinhvien" && <SinhVienView toast={toast} />}
        {tab==="lop"      && <LopView      toast={toast} />}
        {tab==="monhoc"   && <MonHocView   toast={toast} />}
        {tab==="diem"     && <DiemView     toast={toast} />}
      </main>
    </div>
  );
}