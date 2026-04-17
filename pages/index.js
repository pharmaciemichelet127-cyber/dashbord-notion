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
  var stateData = useState(null);
  var data = stateData[0]; var setData = stateData[1];
  var stateLoading = useState(true);
  var loading = stateLoading[0]; var setLoading = stateLoading[1];
  var stateError = useState(null);
  var error = stateError[0]; var setError = stateError[1];
  var stateSearch = useState("");
  var search = stateSearch[0]; var setSearch = stateSearch[1];
  var stateFilter = useState("all");
  var filter = stateFilter[0]; var setFilter = stateFilter[1];

  function fetchData() {
    setLoading(true);
    setError(null);
    fetch("/api/notion")
      .then(function(res) { return res.json(); })
      .then(function(json) {
        if (json.error) { setError(json.error); setLoading(false); return; }
        setData(json);
        setLoading(false);
      })
      .catch(function(e) {
        setError(e.message);
        setLoading(false);
      });
  }

  useEffect(function() { fetchData(); }, []);

  var items = (data && data.items) ? data.items : [];
  var filtered = items.filter(function(item) {
    var matchSearch = item.title.toLowerCase().indexOf(search.toLowerCase()) !== -1;
    var matchFilter = filter === "all" || item.type === filter;
    return matchSearch && matchFilter;
  });

  var pages = filtered.filter(function(i) { return i.type === "page"; });
  var databases = filtered.filter(function(i) { return i.type === "database"; });

  return (
    <div style={{minHeight:"100vh",background:"#0a0a12",color:"#f1f0ff",fontFamily:"system-ui,sans-serif",paddingBottom:"60px"}}>
      <style>{".card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px 20px;margin-bottom:10px;transition:all 0.2s;} .card:hover{background:rgba(168,85,247,0.06);border-color:rgba(168,85,247,0.3);} *{box-sizing:border-box;margin:0;padding:0;}"}</style>

      <div style={{borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"20px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,backdropFilter:"blur(20px)",background:"rgba(10,10,18,0.9)",zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",background:"linear-gradient(135deg,#7c3aed,#c084fc)",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"16px"}}>N</div>
          <div>
            <div style={{fontSize:"16px",fontWeight:600}}>Notion Dashboard</div>
            <div style={{fontSize:"11px",color:"#6b7280"}}>Donnees en direct</div>
          </div>
        </div>
        <button onClick={fetchData} disabled={loading} style={{background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)",color:"#a78bfa",borderRadius:"8px",padding:"6px 14px",fontSize:"12px",cursor:"pointer"}}>
          {loading ? "Chargement..." : "Rafraichir"}
        </button>
      </div>

      <div style={{maxWidth:"860px",margin:"0 auto",padding:"32px 24px 0"}}>
        {error && <div style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",borderRadius:"10px",padding:"14px 18px",marginBottom:"24px",color:"#fca5a5",fontSize:"13px"}}>Erreur: {error}</div>}

        {data && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"28px"}}>
            <div style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"18px",textAlign:"center"}}>
              <div style={{fontSize:"22px",marginBottom:"6px"}}>📋</div>
              <div style={{fontSize:"26px",fontWeight:700,color:"#a78bfa"}}>{data.stats.total}</div>
              <div style={{fontSize:"11px",color:"#6b7280",marginTop:"2px"}}>Total</div>
            </div>
            <div style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"18px",textAlign:"center"}}>
              <div style={{fontSize:"22px",marginBottom:"6px"}}>📄</div>
              <div style={{fontSize:"26px",fontWeight:700,color:"#60a5fa"}}>{data.stats.pages}</div>
              <div style={{fontSize:"11px",color:"#6b7280",marginTop:"2px"}}>Pages</div>
            </div>
            <div style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"18px",textAlign:"center"}}>
              <div style={{fontSize:"22px",marginBottom:"6px"}}>🗄️</div>
              <div style={{fontSize:"26px",fontWeight:700,color:"#fbbf24"}}>{data.stats.databases}</div>
              <div style={{fontSize:"11px",color:"#6b7280",marginTop:"2px"}}>Bases</div>
            </div>
          </div>
        )}

        <input type="text" placeholder="Rechercher..." value={search} onChange={function(e){setSearch(e.target.value);}} style={{width:"100%",padding:"11px 16px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:"10px",color:"#f1f0ff",fontSize:"13px",marginBottom:"12px",outline:"none"}} />

        <div style={{display:"flex",gap:"8px",marginBottom:"24px"}}>
          {[["all","Tout"],["page","Pages"],["database","Bases"]].map(function(f) {
            return <button key={f[0]} onClick={function(){setFilter(f[0]);}} style={{fontSize:"11px",padding:"4px 14px",borderRadius:"99px",cursor:"pointer",border:filter===f[0]?"1px solid rgba(168,85,247,0.5)":"1px solid rgba(255,255,255,0.08)",background:filter===f[0]?"rgba(168,85,247,0.15)":"transparent",color:filter===f[0]?"#c084fc":"#6b7280"}}>{f[1]}</button>;
          })}
        </div>

        {loading && !data && <div style={{textAlign:"center",color:"#4b5563",padding:"60px 0",fontSize:"13px"}}>Chargement...</div>}

        {databases.length > 0 && (
          <div style={{marginBottom:"24px"}}>
            <div style={{fontSize:"11px",color:"#4b5563",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"12px"}}>Bases de donnees — {databases.length}</div>
            {databases.map(function(item) {
              return (
                <div key={item.id} className="card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{display:"flex",gap:"10px"}}>
                      <span style={{fontSize:"20px"}}>{item.emoji}</span>
                      <div>
                        <a href={item.url} target="_blank" rel="noreferrer" style={{fontSize:"15px",fontWeight:600,color:"#f1f0ff"}}>{item.title}</a>
                        <div style={{fontSize:"11px",color:"#4b5563",marginTop:"2px"}}>{timeAgo(item.lastEdited)}</div>
                      </div>
                    </div>
                    <span style={{fontSize:"10px",color:"#fbbf24",background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.25)",borderRadius:"5px",padding:"2px 8px"}}>Base</span>
                  </div>
                  {item.preview && <p style={{fontSize:"12px",color:"#6b7280",marginTop:"8px",marginLeft:"30px",lineHeight:1.6}}>{item.preview}</p>}
                </div>
              );
            })}
          </div>
        )}

        {pages.length > 0 && (
          <div>
            <div style={{fontSize:"11px",color:"#4b5563",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"12px"}}>Pages — {pages.length}</div>
            {pages.map(function(item) {
              return (
                <div key={item.id} className="card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{display:"flex",gap:"10px"}}>
                      <span style={{fontSize:"20px"}}>{item.emoji}</span>
                      <div>
                        <a href={item.url} target="_blank" rel="noreferrer" style={{fontSize:"15px",fontWeight:600,color:"#f1f0ff"}}>{item.title}</a>
                        <div style={{fontSize:"11px",color:"#4b5563",marginTop:"2px"}}>{timeAgo(item.lastEdited)}</div>
                      </div>
                    </div>
                    <span style={{fontSize:"10px",color:"#a78bfa",background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.25)",borderRadius:"5px",padding:"2px 8px"}}>Page</span>
                  </div>
                  {item.preview && <p style={{fontSize:"12px",color:"#6b7280",marginTop:"8px",marginLeft:"30px",lineHeight:1.6}}>{item.preview}</p>}
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && <div style={{textAlign:"center",color:"#374151",padding:"60px 0",fontSize:"13px"}}>Aucun resultat</div>}
      </div>
    </div>
  );
}
