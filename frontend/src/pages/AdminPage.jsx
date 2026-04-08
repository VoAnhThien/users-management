import { useState, useEffect, useCallback } from "react";
import { studentAPI, lopAPI, monHocAPI, diemAPI, toList, clearUser } from "../api";
import Modal, { ConfirmDialog } from "../components/Modal";
import Toast, { useToast } from "../components/Toast";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/admin.css";
import "../styles/modal.css";

const avatarColor = (str) => {
  const s = String(str ?? "");
  return `hsl(${[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360},55%,42%)`;
};
const getMalop = (lop) =>
  !lop ? "" : typeof lop === "object" ? (lop.malop ?? "") : String(lop);
const getStudentMalop = (r) => getMalop(r?.lop) || getMalop(r?.malop);
const asText = (v) => (v == null ? "" : typeof v === "object" ? "" : String(v));
const fullName  = (r)   => [r?.ho, r?.ten].filter(Boolean).join(" ") || "—";

function Spinner() { return <div className="spinner" />; }

const SV_EMPTY = { mssv:"", ho:"", ten:"", diachi:"", gioitinh:true, ngaysinh:"", lop:"", nghihoc:false };

function SinhVienTab({ toast }) {
  const [rows, setRows]       = useState([]);
  const [lops, setLops]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState("");
  const [mode, setMode]       = useState(null);
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
  const openEdit = (r) => { setSel(r); setForm({...r, lop: getStudentMalop(r)}); setMode("edit"); };
  const openDel  = (r) => { setSel(r); setMode("del"); };
  const close    = ()  => setMode(null);
  const setF     = (k) => (e) => setForm((f) => ({...f, [k]: e.target.value}));

  const save = async () => {
  setSaving(true);
  try {
    const { lop, ...rest } = form;
    
    // ⬇️ GỬI OBJECT LOP THAY VÌ CHỈ STRING
    const payload = { 
      ...rest, 
      lop: lop ? { malop: lop } : null  // ⬅️ GỬI OBJECT
    };

    if (mode === "add")  await studentAPI.create(payload);
    if (mode === "edit") await studentAPI.update(sel.mssv, payload);
    toast(mode === "add" ? "Thêm sinh viên thành công!" : "Cập nhật thành công!");
    close(); load();
  } catch (e) { toast(e.message, "error"); }
  finally { setSaving(false); }
};

  const del = async () => {
    try {
      await studentAPI.remove(sel.mssv);
      toast("Đã xoá sinh viên!", "info"); close(); load();
    } catch (e) { toast(e.message, "error"); }
  };

  const filtered = rows.filter((r) => {
    const q   = search.toLowerCase();
    const ten = fullName(r).toLowerCase();
    const lop = getStudentMalop(r).toLowerCase();
    return ten.includes(q) || (r.mssv||"").toLowerCase().includes(q) || lop.includes(q);
  });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2 className="page-title"><span className="dot"></span> Sinh Viên</h2>
          <p className="page-subtitle">{rows.length} sinh viên · {filtered.length} hiển thị</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Thêm sinh viên</button>
      </div>

      <div className="search-bar">
        <span className="search-icon">⌕</span>
        <input className="search-input" placeholder="Tìm tên, MSSV, lớp…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && <button className="search-clear" onClick={() => setSearch("")}>×</button>}
      </div>

      <div className="table-card">
        {loading ? <div className="empty-state"><Spinner /></div>
        : filtered.length === 0 ? <div className="empty-state"><span className="icon">🎓</span><p>Không có dữ liệu</p></div>
        : (
          <table className="data-table">
            <thead><tr>
              {["#","Họ và tên","MSSV","Ngày sinh","Giới tính","Lớp","Địa chỉ","Nghỉ học",""].map(h=><th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.mssv ?? i}>
                  <td style={{color:"var(--dim)",width:40}}>{i+1}</td>
                  <td>
                    <div className="cell-avatar">
                      <div className="row-avatar" style={{background:avatarColor(r.ten||r.ho)}}>
                        {(r.ten||r.ho||"?")[0].toUpperCase()}
                      </div>
                      <strong>{fullName(r)}</strong>
                    </div>
                  </td>
                  <td><span className="badge badge-blue">{r.mssv||"—"}</span></td>
                  <td style={{color:"var(--muted)"}}>{r.ngaysinh||"—"}</td>
                  <td>
                    <span className={`badge ${r.gioitinh?"badge-blue":"badge-red"}`}>
                      {r.gioitinh?"Nam":"Nữ"}
                    </span>
                  </td>
                  <td><span className="badge badge-green">{getStudentMalop(r) || "—"}</span></td>
                  <td style={{color:"var(--muted)",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {r.diachi||"—"}
                  </td>
                  <td>
                    <span className={`badge ${r.nghihoc?"badge-red":"badge-green"}`}>
                      {r.nghihoc?"Có":"Không"}
                    </span>
                  </td>
                  <td>
                    <div className="action-cell">
                      <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(r)}>✎ Sửa</button>
                      <button className="btn btn-danger btn-sm"    onClick={()=>openDel(r)}>✕ Xoá</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(mode==="add"||mode==="edit") && (
        <Modal title={mode==="add"?"Thêm sinh viên":"Chỉnh sửa sinh viên"} onClose={close}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Họ</label>
              <input className="form-input" placeholder="Nguyễn Văn" value={form.ho||""} onChange={setF("ho")} />
            </div>
            <div className="form-group">
              <label className="form-label">Tên</label>
              <input className="form-input" placeholder="An" value={form.ten||""} onChange={setF("ten")} />
            </div>
            <div className="form-group">
              <label className="form-label">MSSV</label>
              <input className="form-input" placeholder="SV001" value={form.mssv||""} onChange={setF("mssv")}
                disabled={mode==="edit"} style={mode==="edit"?{opacity:.6}:{}} />
            </div>
            <div className="form-group">
              <label className="form-label">Ngày sinh</label>
              <input className="form-input" type="date" value={form.ngaysinh||""} onChange={setF("ngaysinh")} />
            </div>
            <div className="form-group span-2">
              <label className="form-label">Địa chỉ</label>
              <input className="form-input" placeholder="180 Cao Lỗ, P4, Q8" value={form.diachi||""} onChange={setF("diachi")} />
            </div>
            <div className="form-group">
              <label className="form-label">Giới tính</label>
              <select className="form-select" value={form.gioitinh?"true":"false"}
                onChange={(e)=>setForm(f=>({...f,gioitinh:e.target.value==="true"}))}>
                <option value="true">Nam</option>
                <option value="false">Nữ</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Lớp</label>
              <select className="form-select" value={form.lop||""} onChange={setF("lop")}>
                <option value="">-- Chọn lớp --</option>
                {lops.map((l, i)=> {
                  const ma = getMalop(l?.malop);
                  const ten = asText(l?.tenlop) || ma || "Lớp";
                  return <option key={ma || i} value={ma}>{ten} ({ma || "—"})</option>;
                })}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nghỉ học</label>
              <select className="form-select" value={form.nghihoc?"true":"false"}
                onChange={(e)=>setForm(f=>({...f,nghihoc:e.target.value==="true"}))}>
                <option value="false">Không</option>
                <option value="true">Có</option>
              </select>
            </div>
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
          message={`Xoá sinh viên <strong>${fullName(sel)}</strong> (${sel.mssv})?<br/>Không thể hoàn tác.`}
          onConfirm={del} onCancel={close}
        />
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   LỚP — Fields: malop, tenlop
════════════════════════════════════════════════════════════════ */
const LOP_EMPTY = { malop:"", tenlop:"" };

function LopTab({ toast }) {
  const [rows,setRows]=useState([]); const [loading,setLoading]=useState(false);
  const [saving,setSaving]=useState(false); const [search,setSearch]=useState("");
  const [mode,setMode]=useState(null); const [sel,setSel]=useState(null);
  const [form,setForm]=useState(LOP_EMPTY);

  const load=useCallback(async()=>{
    setLoading(true);
    try{setRows(toList(await lopAPI.getAll()));}
    catch(e){toast(e.message,"error");}
    finally{setLoading(false);}
  },[toast]);
  useEffect(()=>{load();},[load]);

  const setF=(k)=>(e)=>setForm(f=>({...f,[k]:e.target.value}));
  const save=async()=>{
    setSaving(true);
    try{
      if(mode==="add") await lopAPI.create(form);
      if(mode==="edit") await lopAPI.update(sel.malop,form);
      toast(mode==="add"?"Thêm lớp thành công!":"Cập nhật thành công!");
      setMode(null);load();
    }catch(e){toast(e.message,"error");}
    finally{setSaving(false);}
  };
  const del=async()=>{
    try{await lopAPI.remove(sel.malop);toast("Đã xoá lớp!","info");setMode(null);load();}
    catch(e){toast(e.message,"error");}
  };
  const filtered=rows.filter(r=>{
    const q=search.toLowerCase();
    const ma = getMalop(r?.malop).toLowerCase();
    const ten = asText(r?.tenlop).toLowerCase();
    return ma.includes(q) || ten.includes(q);
  });

  return(
    <>
      <div className="admin-topbar">
        <div><h2 className="page-title"><span className="dot" style={{color:"var(--green)"}}>●</span> Lớp học</h2>
          <p className="page-subtitle">{rows.length} lớp · {filtered.length} hiển thị</p></div>
        <button className="btn btn-primary" onClick={()=>{setForm(LOP_EMPTY);setMode("add");}}>+ Thêm lớp</button>
      </div>
      <div className="search-bar">
        <span className="search-icon">⌕</span>
        <input className="search-input" placeholder="Tìm mã lớp, tên lớp…" value={search} onChange={e=>setSearch(e.target.value)}/>
        {search&&<button className="search-clear" onClick={()=>setSearch("")}>×</button>}
      </div>
      <div className="table-card">
        {loading?<div className="empty-state"><Spinner/></div>
        :filtered.length===0?<div className="empty-state"><span className="icon">🏫</span><p>Không có dữ liệu</p></div>
        :(
          <table className="data-table">
            <thead><tr>{["#","Mã lớp","Tên lớp",""].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((r,i)=>(
                <tr key={getMalop(r?.malop) || i}>
                  <td style={{color:"var(--dim)",width:40}}>{i+1}</td>
                  <td><span className="badge badge-green">{getMalop(r?.malop) || "—"}</span></td>
                  <td><strong>{asText(r?.tenlop) || "—"}</strong></td>
                  <td><div className="action-cell">
                    <button className="btn btn-secondary btn-sm" onClick={()=>{setSel(r);setForm({...r});setMode("edit");}}>✎ Sửa</button>
                    <button className="btn btn-danger btn-sm"    onClick={()=>{setSel(r);setMode("del");}}>✕ Xoá</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {(mode==="add"||mode==="edit")&&(
        <Modal title={mode==="add"?"Thêm lớp":"Chỉnh sửa lớp"} onClose={()=>setMode(null)}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Mã lớp</label>
              <input className="form-input" placeholder="D22TH011" value={form.malop||""} onChange={setF("malop")}
                disabled={mode==="edit"} style={mode==="edit"?{opacity:.6}:{}}/>
            </div>
            <div className="form-group">
              <label className="form-label">Tên lớp</label>
              <input className="form-input" placeholder="Công nghệ thông tin 11 - Khóa 2022" value={form.tenlop||""} onChange={setF("tenlop")}/>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={()=>setMode(null)} disabled={saving}>Huỷ</button>
            <button className="btn btn-primary"   onClick={save}              disabled={saving}>
              {saving?<><span className="spinner-sm"/> Đang lưu…</>:mode==="add"?"Thêm mới":"Cập nhật"}
            </button>
          </div>
        </Modal>
      )}
      {mode==="del"&&sel&&<ConfirmDialog message={`Xoá lớp <strong>${sel.tenlop}</strong>?`} onConfirm={del} onCancel={()=>setMode(null)}/>}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   MÔN HỌC — Fields: mamh, tenmh, sotietlt, sotietth
════════════════════════════════════════════════════════════════ */
const MH_EMPTY = { mamh:"", tenmh:"", sotietlt:"", sotietth:"" };

function MonHocTab({ toast }) {
  const [rows,setRows]=useState([]); const [loading,setLoading]=useState(false);
  const [saving,setSaving]=useState(false); const [search,setSearch]=useState("");
  const [mode,setMode]=useState(null); const [sel,setSel]=useState(null);
  const [form,setForm]=useState(MH_EMPTY);

  const load=useCallback(async()=>{
    setLoading(true);
    try{setRows(toList(await monHocAPI.getAll()));}
    catch(e){toast(e.message,"error");}
    finally{setLoading(false);}
  },[toast]);
  useEffect(()=>{load();},[load]);

  const setF=(k)=>(e)=>setForm(f=>({...f,[k]:e.target.value}));
  const save=async()=>{
    setSaving(true);
    try{
      if(mode==="add") await monHocAPI.create(form);
      if(mode==="edit") await monHocAPI.update(sel.mamh,form);
      toast(mode==="add"?"Thêm môn học thành công!":"Cập nhật thành công!");
      setMode(null);load();
    }catch(e){toast(e.message,"error");}
    finally{setSaving(false);}
  };
  const del=async()=>{
    try{await monHocAPI.remove(sel.mamh);toast("Đã xoá môn học!","info");setMode(null);load();}
    catch(e){toast(e.message,"error");}
  };
  const filtered=rows.filter(r=>{
    const q=search.toLowerCase();
    return(r.mamh||"").toLowerCase().includes(q)||(r.tenmh||"").toLowerCase().includes(q);
  });

  return(
    <>
      <div className="admin-topbar">
        <div><h2 className="page-title"><span className="dot" style={{color:"var(--yellow)"}}>●</span> Môn học</h2>
          <p className="page-subtitle">{rows.length} môn · {filtered.length} hiển thị</p></div>
        <button className="btn btn-primary" onClick={()=>{setForm(MH_EMPTY);setMode("add");}}>+ Thêm môn học</button>
      </div>
      <div className="search-bar">
        <span className="search-icon">⌕</span>
        <input className="search-input" placeholder="Tìm mã môn, tên môn…" value={search} onChange={e=>setSearch(e.target.value)}/>
        {search&&<button className="search-clear" onClick={()=>setSearch("")}>×</button>}
      </div>
      <div className="table-card">
        {loading?<div className="empty-state"><Spinner/></div>
        :filtered.length===0?<div className="empty-state"><span className="icon">📚</span><p>Không có dữ liệu</p></div>
        :(
          <table className="data-table">
            <thead><tr>{["#","Mã MH","Tên môn học","Tiết LT","Tiết TH",""].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((r,i)=>(
                <tr key={r.mamh??i}>
                  <td style={{color:"var(--dim)",width:40}}>{i+1}</td>
                  <td><span className="badge" style={{background:"rgba(251,191,36,.12)",color:"var(--yellow)",border:"1px solid rgba(251,191,36,.25)"}}>{r.mamh}</span></td>
                  <td><strong>{r.tenmh}</strong></td>
                  <td style={{textAlign:"center"}}><span className="badge badge-blue">{r.sotietlt??"—"}</span></td>
                  <td style={{textAlign:"center"}}><span className="badge badge-green">{r.sotietth??"—"}</span></td>
                  <td><div className="action-cell">
                    <button className="btn btn-secondary btn-sm" onClick={()=>{setSel(r);setForm({...r});setMode("edit");}}>✎ Sửa</button>
                    <button className="btn btn-danger btn-sm"    onClick={()=>{setSel(r);setMode("del");}}>✕ Xoá</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {(mode==="add"||mode==="edit")&&(
        <Modal title={mode==="add"?"Thêm môn học":"Chỉnh sửa môn học"} onClose={()=>setMode(null)}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Mã môn học</label>
              <input className="form-input" placeholder="JAVA01" value={form.mamh||""} onChange={setF("mamh")}
                disabled={mode==="edit"} style={mode==="edit"?{opacity:.6}:{}}/>
            </div>
            <div className="form-group">
              <label className="form-label">Tên môn học</label>
              <input className="form-input" placeholder="Lập trình Java" value={form.tenmh||""} onChange={setF("tenmh")}/>
            </div>
            <div className="form-group">
              <label className="form-label">Tiết lý thuyết</label>
              <input className="form-input" type="number" min="0" placeholder="30" value={form.sotietlt||""} onChange={setF("sotietlt")}/>
            </div>
            <div className="form-group">
              <label className="form-label">Tiết thực hành</label>
              <input className="form-input" type="number" min="0" placeholder="15" value={form.sotietth||""} onChange={setF("sotietth")}/>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={()=>setMode(null)} disabled={saving}>Huỷ</button>
            <button className="btn btn-primary"   onClick={save}              disabled={saving}>
              {saving?<><span className="spinner-sm"/> Đang lưu…</>:mode==="add"?"Thêm mới":"Cập nhật"}
            </button>
          </div>
        </Modal>
      )}
      {mode==="del"&&sel&&<ConfirmDialog message={`Xoá môn <strong>${sel.tenmh}</strong>?`} onConfirm={del} onCancel={()=>setMode(null)}/>}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   ĐIỂM
   Response: { diem, hocky, id:{lan,mamh,mssv}, monHoc:{mamh,tenmh,...}, sinhVien:{ho,ten,mssv,...} }
════════════════════════════════════════════════════════════════ */
const DIEM_EMPTY = { mssv:"", mamh:"", lan:1, diem:"", hocky:1 };

function DiemTab({ toast }) {
  const [diems,setDiems]=useState([]); const [monhocs,setMonhocs]=useState([]);
  const [mssvInput,setMssvInput]=useState(""); const [mssvLoaded,setMssvLoaded]=useState("");
  const [loading,setLoading]=useState(false); const [saving,setSaving]=useState(false);
  const [mode,setMode]=useState(null); const [sel,setSel]=useState(null);
  const [form,setForm]=useState(DIEM_EMPTY);

  useEffect(()=>{monHocAPI.getAll().then(d=>setMonhocs(toList(d))).catch(()=>{});},[]);

  const lookup=async()=>{
    if(!mssvInput.trim()){toast("Nhập MSSV để tìm điểm","warn");return;}
    setLoading(true);
    try{
      const data=await diemAPI.getBySV(mssvInput.trim());
      setDiems(toList(data)); setMssvLoaded(mssvInput.trim());
    }catch(e){toast(e.message,"error");}
    finally{setLoading(false);}
  };

  const openEdit=(r)=>{
    setSel(r);
    setForm({mssv:r.id?.mssv,mamh:r.id?.mamh,lan:r.id?.lan,diem:r.diem,hocky:r.hocky});
    setMode("edit");
  };
  const setF=(k)=>(e)=>setForm(f=>({...f,[k]:e.target.value}));

  const save=async()=>{
    setSaving(true);
    try{
      if(mode==="add") await diemAPI.create(form);
      if(mode==="edit") await diemAPI.update(sel.id.mssv,sel.id.mamh,sel.id.lan,form);
      toast(mode==="add"?"Thêm điểm thành công!":"Cập nhật điểm thành công!");
      setMode(null); lookup();
    }catch(e){toast(e.message,"error");}
    finally{setSaving(false);}
  };

  return(
    <>
      <div className="admin-topbar">
        <div><h2 className="page-title"><span className="dot" style={{color:"var(--red)"}}>●</span> Điểm số</h2>
          <p className="page-subtitle">Tra cứu và quản lý điểm theo sinh viên</p></div>
        {mssvLoaded&&<button className="btn btn-primary" onClick={()=>{setForm({...DIEM_EMPTY,mssv:mssvLoaded});setMode("add");}}>+ Thêm điểm</button>}
      </div>

      <div style={{display:"flex",gap:12,marginBottom:20,maxWidth:460}}>
        <input className="search-input" style={{flex:1,paddingLeft:14}} placeholder="Nhập MSSV để tra cứu điểm…"
          value={mssvInput} onChange={e=>setMssvInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&lookup()}/>
        <button className="btn btn-primary" onClick={lookup} disabled={loading}>
          {loading?<span className="spinner-sm"/>:"Tra cứu"}
        </button>
      </div>

      <div className="table-card">
        {!mssvLoaded?<div className="empty-state"><span className="icon">🔍</span><p>Nhập MSSV để xem điểm</p></div>
        :loading?<div className="empty-state"><Spinner/></div>
        :diems.length===0?<div className="empty-state"><span className="icon">📋</span><p>Chưa có điểm nào cho {mssvLoaded}</p></div>
        :(
          <table className="data-table">
            <thead><tr>{["Sinh viên","Môn học","Học kỳ","Lần","Điểm","Xếp loại",""].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {diems.map((r,i)=>{
                const sv=r.sinhVien; const mh=r.monHoc;
                const d=Number(r.diem??0);
                const xl=d>=9?"Xuất sắc":d>=8?"Giỏi":d>=7?"Khá":d>=5?"TB":"Không đạt";
                const cl=d>=8?"badge-green":d>=5?"badge-blue":"badge-red";
                return(
                  <tr key={i}>
                    <td>
                      <div className="cell-avatar">
                        <div className="row-avatar" style={{background:avatarColor(sv?.ten||""),width:28,height:28,fontSize:12}}>
                          {(sv?.ten||"?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{fontWeight:600}}>{fullName(sv)||r.id?.mssv}</div>
                          <div style={{fontSize:11,color:"var(--dim)"}}>{r.id?.mssv}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{fontWeight:600}}>{mh?.tenmh||r.id?.mamh}</div>
                      <div style={{fontSize:11,color:"var(--dim)"}}>{r.id?.mamh}</div>
                    </td>
                    <td style={{textAlign:"center"}}>{r.hocky??"—"}</td>
                    <td style={{textAlign:"center"}}>{r.id?.lan??"—"}</td>
                    <td><span style={{fontWeight:700,fontSize:16,color:d>=8?"var(--green)":d>=5?"var(--yellow)":"var(--red)"}}>{d.toFixed(1)}</span></td>
                    <td><span className={`badge ${cl}`}>{xl}</span></td>
                    <td><button className="btn btn-secondary btn-sm" onClick={()=>openEdit(r)}>✎ Sửa</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {(mode==="add"||mode==="edit")&&(
        <Modal title={mode==="add"?"Thêm điểm":"Sửa điểm"} onClose={()=>setMode(null)}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">MSSV</label>
              <input className="form-input" value={form.mssv||""} onChange={setF("mssv")} placeholder="SV001"
                disabled={mode==="edit"} style={mode==="edit"?{opacity:.6}:{}}/>
            </div>
            <div className="form-group">
              <label className="form-label">Lần thi</label>
              <input className="form-input" type="number" min="1" value={form.lan||1} onChange={setF("lan")}
                disabled={mode==="edit"} style={mode==="edit"?{opacity:.6}:{}}/>
            </div>
            <div className="form-group span-2">
              <label className="form-label">Môn học</label>
              <select className="form-select" value={form.mamh||""} onChange={setF("mamh")}
                disabled={mode==="edit"} style={mode==="edit"?{opacity:.6}:{}}>
                <option value="">-- Chọn môn --</option>
                {monhocs.map(m=><option key={m.mamh} value={m.mamh}>{m.tenmh} ({m.mamh})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Học kỳ</label>
              <input className="form-input" type="number" min="1" max="10" value={form.hocky||1} onChange={setF("hocky")}/>
            </div>
            <div className="form-group">
              <label className="form-label">Điểm (0–10)</label>
              <input className="form-input" type="number" min="0" max="10" step="0.5" value={form.diem||""} onChange={setF("diem")} placeholder="8.5"/>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={()=>setMode(null)} disabled={saving}>Huỷ</button>
            <button className="btn btn-primary"   onClick={save}              disabled={saving}>
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
  {id:"sinhvien",label:"Sinh Viên",icon:"🎓"},
  {id:"lop",     label:"Lớp",      icon:"🏫"},
  {id:"monhoc",  label:"Môn Học",  icon:"📚"},
  {id:"diem",    label:"Điểm",     icon:"📊"},
];

export default function AdminPage({ user, onLogout }) {
  const [tab,setTab]=useState("sinhvien");
  const {toasts,toast,remove}=useToast();
  const handleLogout=()=>{clearUser();onLogout();};

  return(
    <div className="admin-layout">
      <Toast toasts={toasts} remove={remove}/>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎓</div>
          <span className="sidebar-logo-text">EduManage</span>
        </div>
        <span className="sidebar-section-label">Quản lý</span>
        {TABS.map(t=>(
          <button key={t.id} className={`sidebar-item ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>
            <span className="sidebar-icon">{t.icon}</span>{t.label}
          </button>
        ))}
        <div className="sidebar-spacer"/>
        <div style={{padding:"0 4px 12px"}}><ThemeToggle/></div>
        <div className="sidebar-user">
          <div className="sidebar-user-row">
            <div className="sidebar-avatar">{(user?.username||"A")[0].toUpperCase()}</div>
            <div>
              <div className="sidebar-user-name">{user?.name||user?.username||"Admin"}</div>
              <div className="sidebar-user-role">ADMIN</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>⏏ Đăng xuất</button>
        </div>
      </aside>
      <main className="admin-main">
        {tab==="sinhvien"&&<SinhVienTab toast={toast}/>}
        {tab==="lop"     &&<LopTab      toast={toast}/>}
        {tab==="monhoc"  &&<MonHocTab   toast={toast}/>}
        {tab==="diem"    &&<DiemTab     toast={toast}/>}
      </main>
    </div>
  );
}