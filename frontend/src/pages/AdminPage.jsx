import { useState, useEffect, useCallback } from "react";
import { studentAPI, lopAPI, monHocAPI, diemAPI, toList, clearToken, clearUser } from "../api";
import Modal, { ConfirmDialog } from "../components/Modal";
import Toast, { useToast } from "../components/Toast";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/admin.css";
import "../styles/modal.css";

/* ─── helpers ──────────────────────────────────────────────────────────────── */
const avatarColor = (str = "") =>
  `hsl(${[...str].reduce((a, c) => a + c.charCodeAt(0), 0) % 360},55%,42%)`;

function Spinner() { return <div className="spinner" />; }

/* ════════════════════════════════════════════════════════════════
   SINH VIÊN
════════════════════════════════════════════════════════════════ */
const SV_EMPTY = { mssv: "", hoten: "", email: "", sdt: "", malop: "", gpa: "" };

function SinhVienTab({ toast }) {
  const [rows, setRows]     = useState([]);
  const [lops, setLops]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState("");
  const [mode, setMode]       = useState(null);   // null | "add" | "edit" | "del"
  const [sel, setSel]         = useState(null);
  const [form, setForm]       = useState(SV_EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sv, lp] = await Promise.all([studentAPI.getAll(), lopAPI.getAll()]);
      setRows(toList(sv)); setLops(toList(lp));
    } catch (e) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = ()  => { setForm(SV_EMPTY); setMode("add"); };
  const openEdit = (r) => { setSel(r); setForm({ ...r }); setMode("edit"); };
  const openDel  = (r) => { setSel(r); setMode("del"); };
  const close    = ()  => setMode(null);
  const setF     = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      if (mode === "add")  await studentAPI.create(form);
      if (mode === "edit") await studentAPI.update(sel.id ?? sel._id, form);
      toast(mode === "add" ? "Thêm sinh viên thành công!" : "Cập nhật thành công!");
      close(); load();
    } catch (e) { toast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const del = async () => {
    try {
      await studentAPI.remove(sel.id ?? sel._id);
      toast("Đã xoá sinh viên!", "info"); close(); load();
    } catch (e) { toast(e.message, "error"); }
  };

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return ["hoten","mssv","email","malop"].some(k => (r[k]||"").toLowerCase().includes(q));
  });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2 className="page-title"><span className="dot">●</span> Sinh Viên</h2>
          <p className="page-subtitle">{rows.length} sinh viên · {filtered.length} hiển thị</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Thêm sinh viên</button>
      </div>

      <div className="search-bar">
        <span className="search-icon">⌕</span>
        <input className="search-input" placeholder="Tìm tên, MSSV, email, lớp…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && <button className="search-clear" onClick={() => setSearch("")}>×</button>}
      </div>

      <div className="table-card">
        {loading ? (
          <div className="empty-state"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><span className="icon">🎓</span><p>Không có dữ liệu</p></div>
        ) : (
          <table className="data-table">
            <thead><tr>
              {["#","Họ và tên","MSSV","Email","SĐT","Lớp","GPA",""].map(h=><th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id ?? r._id ?? i}>
                  <td style={{color:"var(--dim)",width:40}}>{i+1}</td>
                  <td>
                    <div className="cell-avatar">
                      <div className="row-avatar" style={{background: avatarColor(r.hoten)}}>{(r.hoten||"?")[0].toUpperCase()}</div>
                      <strong>{r.hoten || "—"}</strong>
                    </div>
                  </td>
                  <td><span className="badge badge-blue">{r.mssv||"—"}</span></td>
                  <td style={{color:"var(--muted)"}}>{r.email||"—"}</td>
                  <td style={{color:"var(--muted)"}}>{r.sdt||r.phone||"—"}</td>
                  <td><span className="badge badge-green">{r.malop||r.lop||"—"}</span></td>
                  <td>
                    {r.gpa != null ? (
                      <span className={`gpa-val ${r.gpa>=3.5?"gpa-hi":r.gpa>=2.5?"gpa-mid":"gpa-lo"}`}>
                        {Number(r.gpa).toFixed(1)}
                      </span>
                    ) : "—"}
                  </td>
                  <td>
                    <div className="action-cell">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(r)}>✎ Sửa</button>
                      <button className="btn btn-danger    btn-sm" onClick={() => openDel(r)}>✕ Xoá</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form modal */}
      {(mode==="add"||mode==="edit") && (
        <Modal title={mode==="add"?"Thêm sinh viên":"Chỉnh sửa sinh viên"} onClose={close}>
          <div className="form-grid">
            {[
              {k:"hoten", l:"Họ và tên",       p:"Nguyễn Văn A"},
              {k:"mssv",  l:"MSSV",             p:"22110001"},
              {k:"email", l:"Email",             p:"sv@edu.vn"},
              {k:"sdt",   l:"Số điện thoại",    p:"0901234567"},
              {k:"gpa",   l:"GPA",               p:"3.5"},
            ].map(({k,l,p}) => (
              <div key={k} className="form-group">
                <label className="form-label">{l}</label>
                <input className="form-input" placeholder={p} value={form[k]||""} onChange={setF(k)} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Lớp</label>
              <select className="form-select" value={form.malop||""} onChange={setF("malop")}>
                <option value="">-- Chọn lớp --</option>
                {lops.map((l) => (
                  <option key={l.malop||l.id} value={l.malop||l.id}>{l.tenlop||l.malop}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={close} disabled={saving}>Huỷ</button>
            <button className="btn btn-primary"   onClick={save}  disabled={saving}>
              {saving ? <><span className="spinner-sm" /> Đang lưu…</> : mode==="add"?"Thêm mới":"Cập nhật"}
            </button>
          </div>
        </Modal>
      )}

      {mode==="del" && sel && (
        <ConfirmDialog
          message={`Bạn có chắc muốn xoá sinh viên <strong>${sel.hoten}</strong>?<br/>Hành động này không thể hoàn tác.`}
          onConfirm={del} onCancel={close}
        />
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   LỚP
════════════════════════════════════════════════════════════════ */
const LOP_EMPTY = { malop: "", tenlop: "", khoa: "", nienkhoa: "" };

function LopTab({ toast }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState("");
  const [mode, setMode]       = useState(null);
  const [sel, setSel]         = useState(null);
  const [form, setForm]       = useState(LOP_EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(toList(await lopAPI.getAll())); }
    catch (e) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = ()  => { setForm(LOP_EMPTY); setMode("add"); };
  const openEdit = (r) => { setSel(r); setForm({...r}); setMode("edit"); };
  const openDel  = (r) => { setSel(r); setMode("del"); };
  const close    = ()  => setMode(null);
  const setF     = (k) => (e) => setForm((f)=>({...f,[k]:e.target.value}));

  const save = async () => {
    setSaving(true);
    try {
      if (mode==="add")  await lopAPI.create(form);
      if (mode==="edit") await lopAPI.update(sel.id??sel._id??sel.malop, form);
      toast(mode==="add"?"Thêm lớp thành công!":"Cập nhật thành công!"); close(); load();
    } catch (e) { toast(e.message,"error"); }
    finally { setSaving(false); }
  };

  const del = async () => {
    try {
      await lopAPI.remove(sel.id??sel._id??sel.malop);
      toast("Đã xoá lớp!","info"); close(); load();
    } catch (e) { toast(e.message,"error"); }
  };

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return ["malop","tenlop","khoa"].some(k=>(r[k]||"").toLowerCase().includes(q));
  });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2 className="page-title"><span className="dot" style={{color:"var(--green)"}}>●</span> Lớp học</h2>
          <p className="page-subtitle">{rows.length} lớp · {filtered.length} hiển thị</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Thêm lớp</button>
      </div>

      <div className="search-bar">
        <span className="search-icon">⌕</span>
        <input className="search-input" placeholder="Tìm mã lớp, tên lớp, khoa…"
          value={search} onChange={(e)=>setSearch(e.target.value)} />
        {search && <button className="search-clear" onClick={()=>setSearch("")}>×</button>}
      </div>

      <div className="table-card">
        {loading ? <div className="empty-state"><Spinner /></div>
        : filtered.length===0 ? <div className="empty-state"><span className="icon">🏫</span><p>Không có dữ liệu</p></div>
        : (
          <table className="data-table">
            <thead><tr>{["#","Mã lớp","Tên lớp","Khoa","Niên khoá",""].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((r,i)=>(
                <tr key={r.id??r._id??i}>
                  <td style={{color:"var(--dim)",width:40}}>{i+1}</td>
                  <td><span className="badge badge-green">{r.malop||"—"}</span></td>
                  <td><strong>{r.tenlop||"—"}</strong></td>
                  <td style={{color:"var(--muted)"}}>{r.khoa||r.faculty||"—"}</td>
                  <td style={{color:"var(--muted)"}}>{r.nienkhoa||r.year||"—"}</td>
                  <td>
                    <div className="action-cell">
                      <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(r)}>✎ Sửa</button>
                      <button className="btn btn-danger    btn-sm" onClick={()=>openDel(r)}>✕ Xoá</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(mode==="add"||mode==="edit") && (
        <Modal title={mode==="add"?"Thêm lớp":"Chỉnh sửa lớp"} onClose={close}>
          <div className="form-grid">
            {[
              {k:"malop",     l:"Mã lớp",    p:"CNTT2022A"},
              {k:"tenlop",    l:"Tên lớp",   p:"Công nghệ thông tin 2022 A"},
              {k:"khoa",      l:"Khoa",       p:"Khoa CNTT"},
              {k:"nienkhoa",  l:"Niên khoá", p:"2022-2026"},
            ].map(({k,l,p})=>(
              <div key={k} className="form-group">
                <label className="form-label">{l}</label>
                <input className="form-input" placeholder={p} value={form[k]||""} onChange={setF(k)} />
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={close} disabled={saving}>Huỷ</button>
            <button className="btn btn-primary"   onClick={save}  disabled={saving}>
              {saving?<><span className="spinner-sm"/> Đang lưu…</>:mode==="add"?"Thêm mới":"Cập nhật"}
            </button>
          </div>
        </Modal>
      )}

      {mode==="del"&&sel&&(
        <ConfirmDialog
          message={`Xoá lớp <strong>${sel.tenlop}</strong>?`}
          onConfirm={del} onCancel={close}
        />
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   MÔN HỌC
════════════════════════════════════════════════════════════════ */
const MH_EMPTY = { mamh: "", tenmh: "", sotc: "", khoa: "" };

function MonHocTab({ toast }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState("");
  const [mode, setMode]       = useState(null);
  const [sel, setSel]         = useState(null);
  const [form, setForm]       = useState(MH_EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(toList(await monHocAPI.getAll())); }
    catch (e) { toast(e.message,"error"); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(()=>{ load(); },[load]);

  const openAdd  = ()  => { setForm(MH_EMPTY); setMode("add"); };
  const openEdit = (r) => { setSel(r); setForm({...r}); setMode("edit"); };
  const openDel  = (r) => { setSel(r); setMode("del"); };
  const close    = ()  => setMode(null);
  const setF     = (k) => (e) => setForm((f)=>({...f,[k]:e.target.value}));

  const save = async () => {
    setSaving(true);
    try {
      if (mode==="add")  await monHocAPI.create(form);
      if (mode==="edit") await monHocAPI.update(sel.id??sel._id??sel.mamh, form);
      toast(mode==="add"?"Thêm môn học thành công!":"Cập nhật thành công!"); close(); load();
    } catch (e) { toast(e.message,"error"); }
    finally { setSaving(false); }
  };

  const del = async () => {
    try {
      await monHocAPI.remove(sel.id??sel._id??sel.mamh);
      toast("Đã xoá môn học!","info"); close(); load();
    } catch (e) { toast(e.message,"error"); }
  };

  const filtered = rows.filter(r=>{
    const q = search.toLowerCase();
    return ["mamh","tenmh","khoa"].some(k=>(r[k]||"").toLowerCase().includes(q));
  });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2 className="page-title"><span className="dot" style={{color:"var(--yellow)"}}>●</span> Môn học</h2>
          <p className="page-subtitle">{rows.length} môn · {filtered.length} hiển thị</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Thêm môn học</button>
      </div>

      <div className="search-bar">
        <span className="search-icon">⌕</span>
        <input className="search-input" placeholder="Tìm mã môn, tên môn, khoa…"
          value={search} onChange={(e)=>setSearch(e.target.value)} />
        {search&&<button className="search-clear" onClick={()=>setSearch("")}>×</button>}
      </div>

      <div className="table-card">
        {loading ? <div className="empty-state"><Spinner /></div>
        : filtered.length===0 ? <div className="empty-state"><span className="icon">📚</span><p>Không có dữ liệu</p></div>
        : (
          <table className="data-table">
            <thead><tr>{["#","Mã MH","Tên môn học","Số TC","Khoa",""].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((r,i)=>(
                <tr key={r.id??r._id??i}>
                  <td style={{color:"var(--dim)",width:40}}>{i+1}</td>
                  <td><span className="badge" style={{background:"rgba(251,191,36,.12)",color:"var(--yellow)",border:"1px solid rgba(251,191,36,.25)"}}>{r.mamh||"—"}</span></td>
                  <td><strong>{r.tenmh||r.tenmonhoc||"—"}</strong></td>
                  <td style={{textAlign:"center"}}><span className="badge badge-blue">{r.sotc??r.tinchi??"—"}</span></td>
                  <td style={{color:"var(--muted)"}}>{r.khoa||"—"}</td>
                  <td>
                    <div className="action-cell">
                      <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(r)}>✎ Sửa</button>
                      <button className="btn btn-danger    btn-sm" onClick={()=>openDel(r)}>✕ Xoá</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(mode==="add"||mode==="edit")&&(
        <Modal title={mode==="add"?"Thêm môn học":"Chỉnh sửa môn học"} onClose={close}>
          <div className="form-grid">
            {[
              {k:"mamh",  l:"Mã môn học",   p:"CNTT001"},
              {k:"tenmh", l:"Tên môn học",  p:"Lập trình Web"},
              {k:"sotc",  l:"Số tín chỉ",  p:"3"},
              {k:"khoa",  l:"Khoa",          p:"Khoa CNTT"},
            ].map(({k,l,p})=>(
              <div key={k} className="form-group">
                <label className="form-label">{l}</label>
                <input className="form-input" placeholder={p} value={form[k]||""} onChange={setF(k)} />
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={close} disabled={saving}>Huỷ</button>
            <button className="btn btn-primary"   onClick={save}  disabled={saving}>
              {saving?<><span className="spinner-sm"/> Đang lưu…</>:mode==="add"?"Thêm mới":"Cập nhật"}
            </button>
          </div>
        </Modal>
      )}

      {mode==="del"&&sel&&(
        <ConfirmDialog
          message={`Xoá môn học <strong>${sel.tenmh||sel.tenmonhoc}</strong>?`}
          onConfirm={del} onCancel={close}
        />
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   ĐIỂM
════════════════════════════════════════════════════════════════ */
const DIEM_EMPTY = { mssv: "", mamh: "", lan: 1, diem: "" };

function DiemTab({ toast }) {
  const [diems, setDiems]     = useState([]);
  const [monhocs, setMonhocs] = useState([]);
  const [mssv, setMssv]       = useState("");
  const [mssvSearch, setMssvSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [mode, setMode]       = useState(null);
  const [sel, setSel]         = useState(null);
  const [form, setForm]       = useState(DIEM_EMPTY);

  useEffect(() => {
    monHocAPI.getAll().then(d=>setMonhocs(toList(d))).catch(()=>{});
  }, []);

  const search = async () => {
    if (!mssvSearch.trim()) { toast("Nhập MSSV để tìm điểm", "warn"); return; }
    setLoading(true);
    try {
      const data = await diemAPI.getBySV(mssvSearch.trim());
      setDiems(toList(data));
      setMssv(mssvSearch.trim());
    } catch (e) { toast(e.message,"error"); }
    finally { setLoading(false); }
  };

  const openAdd  = ()  => { setForm({...DIEM_EMPTY, mssv}); setMode("add"); };
  const openEdit = (r) => { setSel(r); setForm({...r}); setMode("edit"); };
  const close    = ()  => setMode(null);
  const setF     = (k) => (e) => setForm((f)=>({...f,[k]:e.target.value}));

  const save = async () => {
    setSaving(true);
    try {
      if (mode==="add")  await diemAPI.create(form);
      if (mode==="edit") await diemAPI.update(sel.mssv, sel.mamh, sel.lan, form);
      toast(mode==="add"?"Thêm điểm thành công!":"Cập nhật điểm thành công!");
      close(); if (mssv) search();
    } catch (e) { toast(e.message,"error"); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2 className="page-title"><span className="dot" style={{color:"var(--red)"}}>●</span> Điểm số</h2>
          <p className="page-subtitle">Tra cứu và quản lý điểm theo sinh viên</p>
        </div>
        {mssv && <button className="btn btn-primary" onClick={openAdd}>+ Thêm điểm</button>}
      </div>

      {/* MSSV search */}
      <div style={{display:"flex",gap:12,marginBottom:20,maxWidth:460}}>
        <input
          className="search-input" style={{flex:1,paddingLeft:14}}
          placeholder="Nhập MSSV để tra cứu điểm…"
          value={mssvSearch}
          onChange={(e)=>setMssvSearch(e.target.value)}
          onKeyDown={(e)=>e.key==="Enter"&&search()}
        />
        <button className="btn btn-primary" onClick={search} disabled={loading}>
          {loading?<span className="spinner-sm"/>:"Tra cứu"}
        </button>
      </div>

      <div className="table-card">
        {!mssv ? (
          <div className="empty-state"><span className="icon">🔍</span><p>Nhập MSSV để xem điểm</p></div>
        ) : loading ? (
          <div className="empty-state"><Spinner /></div>
        ) : diems.length===0 ? (
          <div className="empty-state"><span className="icon">📋</span><p>Chưa có điểm nào cho {mssv}</p></div>
        ) : (
          <table className="data-table">
            <thead><tr>{["MSSV","Mã MH","Tên môn","Lần","Điểm",""].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {diems.map((r,i)=>{
                const mh = monhocs.find(m=>m.mamh===r.mamh);
                const d = Number(r.diem??r.score??0);
                return (
                  <tr key={i}>
                    <td><span className="badge badge-blue">{r.mssv||mssv}</span></td>
                    <td><span className="badge" style={{background:"rgba(251,191,36,.12)",color:"var(--yellow)",border:"1px solid rgba(251,191,36,.2)"}}>{r.mamh||"—"}</span></td>
                    <td style={{color:"var(--muted)"}}>{mh?.tenmh||r.tenmh||"—"}</td>
                    <td style={{textAlign:"center"}}>{r.lan??r.lanthi??1}</td>
                    <td>
                      <span className={`gpa-val ${d>=8?"gpa-hi":d>=5?"gpa-mid":"gpa-lo"}`}>
                        {d.toFixed(1)}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(r)}>✎ Sửa</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {(mode==="add"||mode==="edit")&&(
        <Modal title={mode==="add"?"Thêm điểm":"Sửa điểm"} onClose={close}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">MSSV</label>
              <input className="form-input" value={form.mssv||""} onChange={setF("mssv")} placeholder="22110001" />
            </div>
            <div className="form-group">
              <label className="form-label">Lần thi</label>
              <input className="form-input" type="number" min="1" value={form.lan||1} onChange={setF("lan")} />
            </div>
            <div className="form-group form-group span-2">
              <label className="form-label">Môn học</label>
              <select className="form-select" value={form.mamh||""} onChange={setF("mamh")}>
                <option value="">-- Chọn môn --</option>
                {monhocs.map(m=><option key={m.mamh} value={m.mamh}>{m.tenmh||m.tenmonhoc} ({m.mamh})</option>)}
              </select>
            </div>
            <div className="form-group span-2">
              <label className="form-label">Điểm (0 – 10)</label>
              <input className="form-input" type="number" min="0" max="10" step="0.5" value={form.diem||""} onChange={setF("diem")} placeholder="8.5" />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={close} disabled={saving}>Huỷ</button>
            <button className="btn btn-primary"   onClick={save}  disabled={saving}>
              {saving?<><span className="spinner-sm"/> Đang lưu…</>:mode==="add"?"Thêm điểm":"Cập nhật"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   ADMIN LAYOUT
════════════════════════════════════════════════════════════════ */
const TABS = [
  { id:"sinhvien", label:"Sinh Viên", icon:"🎓" },
  { id:"lop",      label:"Lớp",       icon:"🏫" },
  { id:"monhoc",   label:"Môn Học",   icon:"📚" },
  { id:"diem",     label:"Điểm",      icon:"📊" },
];

export default function AdminPage({ user, onLogout }) {
  const [tab, setTab] = useState("sinhvien");
  const { toasts, toast, remove } = useToast();

  const handleLogout = () => { clearToken(); clearUser(); onLogout(); };

  return (
    <div className="admin-layout">
      <Toast toasts={toasts} remove={remove} />

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header-row">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">🎓</div>
            <span className="sidebar-logo-text">EduManage</span>
          </div>
          <ThemeToggle className="theme-toggle--ghost" />
        </div>

        <span className="sidebar-section-label">Quản lý</span>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`sidebar-item ${tab===t.id?"active":""}`}
            onClick={() => setTab(t.id)}
          >
            <span className="sidebar-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}

        <div className="sidebar-spacer" />

        <div className="sidebar-user">
          <div className="sidebar-user-row">
            <div className="sidebar-avatar">{(user?.username||"A")[0].toUpperCase()}</div>
            <div>
              <div className="sidebar-user-name">{user?.username || "Admin"}</div>
              <div className="sidebar-user-role">ADMIN</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>⏏ Đăng xuất</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        <div className="admin-main-inner">
          {tab==="sinhvien" && <SinhVienTab toast={toast} />}
          {tab==="lop"      && <LopTab      toast={toast} />}
          {tab==="monhoc"   && <MonHocTab   toast={toast} />}
          {tab==="diem"     && <DiemTab     toast={toast} />}
        </div>
      </main>
    </div>
  );
}