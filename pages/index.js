import { useState, useEffect } from "react";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  var date = new Date(dateStr);
  var now = new Date();
  var diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return "Il y a " + diffDays + " jours";
  if (diffDays < 30) return "Il y a " + Math.floor(diffDays / 7) + " sem.";
  return "Il y a " + Math.floor(diffDays / 30) + " mois";
}

export default function Dashboard() {
  var s1 = useState(null); var data = s1[0]; var setData = s1[1];
  var s2 = useState(true); var loading = s2[0]; var setLoading = s2[1];
  var s3 = useState(null); var error = s3[0]; var setError = s3[1];
  var s4 = useState(""); var search = s4[0]; var setSearch = s4[1];
  var s5 = useState("all"); var filter = s5[0]; var setFilter = s5[1];

  function fetchData() {
    setLoading(true); setError(null);
    fetch("/api/notion")
      .then(function(r) { return r.json(); })
      .then(function(j) {
        if (j.error) { setError(j.error); setLoading(false); return; }
        setData(j); setLoading(false);
      })
      .catch(function(e) { setError(e.message); setLoading(false); });
  }

  useEffect(function() { fetchData(); }, []);

  var items = (data && data.items) ? data.items : [];
  var filtered = items.filter(function(item) {
    return item.title.toLowerCase().indexOf(search.toLowerCase()) !== -1 && (filter === "all" || item.type === filter);
  });
  var pages = filtered.filter(function(i) { return i.type === "page"; });
  var databases = filtered.filter(function(i) { return i.type === "database"; });

  return (
    <div style={{minHeight:"100vh",background:"#f8f7ff",color:"#1a1a2e",fontFamily:"system-ui,sans-serif",paddingBottom:"60px"}}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: white; border: 1px solid #e8e4f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 10px; transition: all 0.2s; cursor: pointer; }
        .card:hover { border-color: #7c3aed; box-shadow: 0 4px 20px rgba(124,58,237,0.08); transform: translateY(-1px); }
        a { color: inherit; text-decoration: none; }
        input { outline: none; }
        input:focus { border-color: rgba(124,58,237,0.5) !important; }
      `}</style>

      {/* Header */}
      <div style={{borderBottom:"1px solid #e8e4f0",padding:"18px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"rgba(248,247,255,0.95)",backdropFilter:"blur(10px)",zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"34px",height:"34px",background:"linear-gradient(135deg,#7c3aed,#a855f7)",borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"17px",color:"white",boxShadow:"0 4px 12px rgba(124,58,237,0.3)"}}>N</div>
          <div>
            <div style={{fontSize:"16px",fontWeight:700,color:"#1a1a2e"}}>Notion Dashboard</div>
            <div style={{fontSize:"11px",color:"#9ca3af"}}>Données en direct</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          {data && <span style={{fontSize:"11px",color:"#9ca3af"}}>{data.stats.total} éléments</span>}
          <button onClick={fetchData} disabled={loading} style={{background:"#7c3aed",border:"none",color:"white",borderRadius:"8px",padding:"7px 16px",fontSize:"12px",cursor:"pointer",fontWeight:500}}>
            {loading ? "Chargement..." : "↻ Rafraîchir"}
          </button>
        </div>
      </div>

      <div style={{maxWidth:"860px",margin:"0 auto",padding:"32px 24px 0"}}>

        {/* Error */}
        {error && <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"10px",padding:"14px 18px",marginBottom:"20px",color:"#dc2626",fontSize:"13px"}}>⚠️ {error}</div>}

        {/* Stats */}
        {data && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"28px"}}>
            {[
              {icon:"📋",label:"Total",value:data.stats.total,bg:"#f5f3ff",color:"#7c3aed",border:"#ddd6fe"},
              {icon:"📄",label:"Pages",value:data.stats.pages,bg:"#eff6ff",color:"#2563eb",border:"#bfdbfe"},
              {icon:"🗄️",label:"Bases de données",value:data.stats.databases,bg:"#fffbeb",color:"#d97706",border:"#fde68a"},
            ].map(function(s) {
              return (
                <div key={s.label} style={{background:s.bg,border:"1px solid "+s.border,borderRadius:"12px",padding:"18px",textAlign:"center"}}>
                  <div style={{fontSize:"24px",marginBottom:"6px"}}>{s.icon}</div>
                  <div style={{fontSize:"28px",fontWeight:700,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:"11px",color:"#6b7280",marginTop:"3px"}}>{s.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="🔍  Rechercher dans vos pages..."
          value={search}
          onChange={function(e){setSearch(e.target.value);}}
          style={{width:"100%",padding:"12px 16px",background:"white",border:"1px solid #e8e4f0",borderRadius:"10px",color:"#1a1a2e",fontSize:"14px",marginBottom:"12px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}
        />

        {/* Filters */}
        <div style={{display:"flex",gap:"8px",marginBottom:"24px"}}>
          {[["all","Tout"],["page","Pages"],["database","Bases"]].map(function(f) {
            return (
              <button key={f[0]} onClick={function(){setFilter(f[0]);}} style={{fontSize:"12px",padding:"5px 14px",borderRadius:"99px",cursor:"pointer",fontWeight:500,border:filter===f[0]?"1px solid #7c3aed":"1px solid #e8e4f0",background:filter===f[0]?"#7c3aed":"white",color:filter===f[0]?"white":"#6b7280",transition:"all 0.15s"}}>
                {f[1]}
              </button>
            );
          })}
          {data && <span style={{marginLeft:"auto",fontSize:"11px",color:"#9ca3af",alignSelf:"center"}}>{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>}
        </div>

        {/* Loading */}
        {loading && !data && <div style={{textAlign:"center",color:"#9ca3af",padding:"60px 0",fontSize:"14px"}}>Chargement de vos données Notion...</div>}

        {/* Databases */}
        {databases.length > 0 && (
          <div style={{marginBottom:"28px"}}>
            <div style={{fontSize:"11px",color:"#9ca3af",letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600,marginBottom:"12px",display:"flex",alignItems:"center",gap:"8px"}}>
              <span>Bases de données</span>
              <span style={{background:"#f3f4f6",color:"#6b7280",borderRadius:"99px",padding:"1px 8px",fontSize:"10px"}}>{databases.length}</span>
            </div>
            {databases.map(function(item) {
              return (
                <div key={item.id} className="card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{display:"flex",gap:"12px",alignItems:"flex-start"}}>
                      <span style={{fontSize:"22px",lineHeight:1}}>{item.emoji}</span>
                      <div>
                        <a href={item.url} target="_blank" rel="noreferrer" style={{fontSize:"15px",fontWeight:600,color:"#1a1a2e"}}>{item.title}</a>
                        <div style={{fontSize:"11px",color:"#9ca3af",marginTop:"3px"}}>{timeAgo(item.lastEdited)}</div>
                      </div>
                    </div>
                    <span style={{fontSize:"10px",color:"#d97706",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:"5px",padding:"2px 8px",fontWeight:500}}>Base</span>
                  </div>
                  {item.preview && <p style={{fontSize:"13px",color:"#6b7280",marginTop:"10px",marginLeft:"34px",lineHeight:1.65}}>{item.preview}</p>}
                </div>
              );
            })}
          </div>
        )}

        {/* Pages */}
        {pages.length > 0 && (
          <div>
            <div style={{fontSize:"11px",color:"#9ca3af",letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600,marginBottom:"12px",display:"flex",alignItems:"center",gap:"8px"}}>
              <span>Pages</span>
              <span style={{background:"#f3f4f6",color:"#6b7280",borderRadius:"99px",padding:"1px 8px",fontSize:"10px"}}>{pages.length}</span>
            </div>
            {pages.map(function(item) {
              return (
                <div key={item.id} className="card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{display:"flex",gap:"12px",alignItems:"flex-start"}}>
                      <span style={{fontSize:"22px",lineHeight:1}}>{item.emoji}</span>
                      <div>
                        <a href={item.url} target="_blank" rel="noreferrer" style={{fontSize:"15px",fontWeight:600,color:"#1a1a2e"}}>{item.title}</a>
                        <div style={{fontSize:"11px",color:"#9ca3af",marginTop:"3px"}}>{timeAgo(item.lastEdited)}</div>
                      </div>
                    </div>
                    <span style={{fontSize:"10px",color:"#7c3aed",background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:"5px",padding:"2px 8px",fontWeight:500}}>Page</span>
                  </div>
                  {item.preview && <p style={{fontSize:"13px",color:"#6b7280",marginTop:"10px",marginLeft:"34px",lineHeight:1.65}}>{item.preview}</p>}
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{textAlign:"center",color:"#9ca3af",padding:"60px 0",fontSize:"14px"}}>Aucun résultat</div>
        )}

        <div style={{marginTop:"40px",paddingTop:"20px",borderTop:"1px solid #e8e4f0",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:"11px",color:"#d1d5db"}}>Notion Dashboard · Vercel</span>
          <a href="https://www.notion.so" target="_blank" rel="noreferrer" style={{fontSize:"11px",color:"#9ca3af"}}>Ouvrir Notion →</a>
        </div>
      </div>
    </div>
  );
}
