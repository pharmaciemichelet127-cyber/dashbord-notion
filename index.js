import { useState, useEffect, useCallback } from "react";
import Head from "next/head";

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 5) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;
  return `Il y a ${Math.floor(diffDays / 30)} mois`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function ItemCard({ item, index }) {
  const [expanded, setExpanded] = useState(false);
  const hasProps = Object.keys(item.properties || {}).length > 0;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px",
        padding: "18px 20px",
        transition: "all 0.2s",
        animation: `fadeUp 0.4s ease ${index * 50}ms both`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = "1px solid rgba(168,85,247,0.3)";
        e.currentTarget.style.background = "rgba(168,85,247,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
        e.currentTarget.style.background = "rgba(255,255,255,0.025)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: "24px", lineHeight: 1, flexShrink: 0, marginTop: "1px" }}>{item.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#f1f0ff",
                fontFamily: "'Fraunces', serif",
                fontSize: "15px",
                fontWeight: 600,
                textDecoration: "none",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                letterSpacing: "-0.02em",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#c084fc")}
              onMouseLeave={(e) => (e.target.style.color = "#f1f0ff")}
            >
              {item.title}
            </a>
            <div style={{ fontSize: "11px", color: "#4b5563", marginTop: "3px", fontFamily: "'DM Mono', monospace" }}>
              {timeAgo(item.lastEdited)} · {item.parentType === "workspace" ? "Workspace" : item.parentType === "database_id" ? "Dans une base" : "Sous-page"}
            </div>
          </div>
        </div>
        <span
          style={{
            fontSize: "10px",
            color: item.type === "database" ? "#fbbf24" : "#a78bfa",
            background: item.type === "database" ? "rgba(251,191,36,0.1)" : "rgba(167,139,250,0.1)",
            border: `1px solid ${item.type === "database" ? "rgba(251,191,36,0.25)" : "rgba(167,139,250,0.25)"}`,
            borderRadius: "5px",
            padding: "2px 8px",
            fontFamily: "'DM Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            flexShrink: 0,
          }}
        >
          {item.type === "database" ? "Base" : "Page"}
        </span>
      </div>

      {item.preview && (
        <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.65, marginTop: "10px", marginLeft: "36px" }}>
          {item.preview}
        </p>
      )}

      {hasProps && (
        <div style={{ marginLeft: "36px", marginTop: "10px" }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "none",
              border: "none",
              color: "#7c3aed",
              fontSize: "11px",
              cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
              padding: 0,
            }}
          >
            {expanded ? "▾ Masquer les propriétés" : `▸ ${Object.keys(item.properties).length} propriétés`}
          </button>
          {expanded && (
            <div
              style={{
                marginTop: "10px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "6px",
              }}
            >
              {Object.entries(item.properties).map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "8px",
                    padding: "6px 10px",
                  }}
                >
                  <div style={{ fontSize: "10px", color: "#4b5563", fontFamily: "'DM Mono', monospace", marginBottom: "2px" }}>{key}</div>
                  <div style={{ fontSize: "12px", color: "#c4b5fd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, delay }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px",
        padding: "20px",
        textAlign: "center",
        animation: `fadeUp 0.5s ease ${delay}ms both`,
      }}
    >
      <div style={{ fontSize: "26px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "28px", fontFamily: "'Fraunces', serif", fontWeight: 700, color, letterSpacing: "-0.03em" }}>{value}</div>
      <div style={{ fontSize: "11px", color: "#4b5563", fontFamily: "'DM Mono', monospace", marginTop: "4px" }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notion");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur API");
      }
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = (data?.items || []).filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.preview?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || item.type === filter;
    return matchSearch && matchFilter;
  });

  const grouped = {
    databases: filtered.filter((i) => i.type === "database"),
    pages: filtered.filter((i) => i.type === "page"),
  };

  return (
    <>
      <Head>
        <title>Notion Dashboard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0a0a12; }
          @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 4px; }
        `}</style>
      </Head>

      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0a12 0%, #0d0920 60%, #07090f 100%)", fontFamily: "'DM Sans', sans-serif", color: "#f1f0ff", paddingBottom: "60px" }}>

        {/* Ambient glow */}
        <div style={{ position: "fixed", top: "-150px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        {/* Header */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "22px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, backdropFilter: "blur(20px)", background: "rgba(10,10,18,0.85)", zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #7c3aed, #c084fc)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "16px", boxShadow: "0 0 16px rgba(124,58,237,0.4)" }}>N</div>
            <div>
              <h1 style={{ fontSize: "16px", fontFamily: "'Fraunces', serif", fontWeight: 600, letterSpacing: "-0.03em" }}>Notion Dashboard</h1>
              <div style={{ fontSize: "10px", color: "#4b5563", fontFamily: "'DM Mono', monospace" }}>Données en direct</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {lastRefresh && (
              <span style={{ fontSize: "10px", color: "#4b5563", fontFamily: "'DM Mono', monospace" }}>
                Mis à jour {timeAgo(lastRefresh)}
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              style={{
                background: "rgba(124,58,237,0.15)",
                border: "1px solid rgba(124,58,237,0.3)",
                color: "#a78bfa",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "12px",
                cursor: loading ? "wait" : "pointer",
                fontFamily: "'DM Mono', monospace",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "rgba(124,58,237,0.25)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.15)"; }}
            >
              <span style={{ display: "inline-block", animation: loading ? "spin 1s linear infinite" : "none" }}>↻</span>
              {loading ? "Chargement…" : "Rafraîchir"}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: error ? "#f87171" : "#4ade80", animation: "pulse 2s infinite", boxShadow: `0 0 6px ${error ? "#f87171" : "#4ade80"}` }} />
              <span style={{ fontSize: "10px", color: "#4b5563", fontFamily: "'DM Mono', monospace" }}>{error ? "Erreur" : "Connecté"}</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 24px 0", position: "relative", zIndex: 1 }}>

          {error && (
            <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", color: "#fca5a5", fontSize: "13px" }}>
              ⚠️ Erreur : {error}
            </div>
          )}

          {/* Stats */}
          {data && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "32px" }}>
              <StatCard icon="📋" label="Total" value={data.stats.total} color="#a78bfa" delay={0} />
              <StatCard icon="📄" label="Pages" value={data.stats.pages} color="#60a5fa" delay={80} />
              <StatCard icon="🗄️" label="Bases" value={data.stats.databases} color="#fbbf24" delay={160} />
              <StatCard icon="⚡" label="Dernière modif." value={timeAgo(data.stats.lastEdited)} color="#4ade80" delay={240} />
            </div>
          )}

          {/* Search + Filters */}
          <div style={{ marginBottom: "24px", animation: "fadeUp 0.5s ease 0.3s both" }}>
            <input
              type="text"
              placeholder="🔍  Rechercher dans vos pages et bases…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "12px 18px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "10px", color: "#f1f0ff",
                fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
                outline: "none", marginBottom: "12px",
              }}
              onFocus={(e) => (e.target.style.border = "1px solid rgba(168,85,247,0.45)")}
              onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.09)")}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              {[["all", "Tout"], ["page", "Pages"], ["database", "Bases"]].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFilter(val)}
                  style={{
                    fontSize: "11px", padding: "4px 14px", borderRadius: "99px", cursor: "pointer", fontFamily: "'DM Mono', monospace", transition: "all 0.15s",
                    border: filter === val ? "1px solid rgba(168,85,247,0.5)" : "1px solid rgba(255,255,255,0.08)",
                    background: filter === val ? "rgba(168,85,247,0.15)" : "transparent",
                    color: filter === val ? "#c084fc" : "#4b5563",
                  }}
                >
                  {label}
                </button>
              ))}
              {data && <span style={{ marginLeft: "auto", fontSize: "11px", color: "#374151", fontFamily: "'DM Mono', monospace", alignSelf: "center" }}>{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>}
            </div>
          </div>

          {/* Loading skeleton */}
          {loading && !data && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "18px 20px", height: "80px", animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          )}

          {/* Content */}
          {!loading && data && (
            <>
              {grouped.databases.length > 0 && (
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <h2 style={{ fontSize: "11px", color: "#4b5563", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Bases de données — {grouped.databases.length}
                    </h2>
                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.04)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {grouped.databases.map((item, i) => <ItemCard key={item.id} item={item} index={i} />)}
                  </div>
                </div>
              )}

              {grouped.pages.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <h2 style={{ fontSize: "11px", color: "#4b5563", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Pages — {grouped.pages.length}
                    </h2>
                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.04)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {grouped.pages.map((item, i) => <ItemCard key={item.id} item={item} index={i} />)}
                  </div>
                </div>
              )}

              {filtered.length === 0 && (
                <div style={{ textAlign: "center", color: "#374151", padding: "60px 0", fontFamily: "'DM Mono', monospace", fontSize: "13px" }}>
                  Aucun résultat pour « {search} »
                </div>
              )}
            </>
          )}

          <div style={{ marginTop: "48px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px", color: "#1f2937", fontFamily: "'DM Mono', monospace" }}>Notion Dashboard · Vercel + Next.js</span>
            <a href="https://www.notion.so" target="_blank" rel="noopener noreferrer" style={{ fontSize: "10px", color: "#374151", fontFamily: "'DM Mono', monospace", textDecoration: "none" }}>Ouvrir Notion →</a>
          </div>
        </div>
      </div>
    </>
  );
}
