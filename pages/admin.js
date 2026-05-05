// pages/admin.js
// Admin Control Panel — accessible only to khawer.profession@gmail.com

import { useState, useEffect } from "react";
import Head from "next/head";

const GOLD        = "#C9A84C";
const NAVY        = "#0D1B2A";
const NAVY_MID    = "#162032";
const NAVY_SURFACE= "#1E2D40";
const NAVY_BORDER = "#2B3F57";
const CREAM       = "#F5F1E8";
const RED         = "#DC2626";
const GREEN       = "#4CAF7D";
const TEXT_MUTED  = "#6E8099";

export default function AdminPanel() {
  const [authed,    setAuthed]    = useState(false);
  const [checking,  setChecking]  = useState(true);
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState(null);
  const [tab,       setTab]       = useState("users"); // users | stats | tokens
  const [msg,       setMsg]       = useState("");

  // ── Auth check ──
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("arklaw_user") || "{}");
      if (u?.email?.toLowerCase() === "khawer.profession@gmail.com") {
        setAuthed(true);
        fetchUsers();
      }
    } catch {}
    setChecking(false);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
      else setMsg("Error loading users: " + (data.error || "Unknown"));
    } catch (e) { setMsg("Failed to fetch users: " + e.message); }
    finally { setLoading(false); }
  };

  const updateTokens = async (userId, newTokens) => {
    try {
      const res  = await fetch("/api/auth/save-history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, tokens: newTokens }) });
      const data = await res.json();
      if (res.ok) { setMsg("✅ Tokens updated"); setUsers(prev => prev.map(u => u.id === userId ? { ...u, tokens: newTokens } : u)); }
      else setMsg("❌ " + data.error);
    } catch (e) { setMsg("❌ " + e.message); }
  };

  const deleteUser = async (userId, email) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    try {
      const res  = await fetch("/api/admin/delete-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
      const data = await res.json();
      if (res.ok) { setMsg("✅ User deleted"); setUsers(prev => prev.filter(u => u.id !== userId)); setSelected(null); }
      else setMsg("❌ " + data.error);
    } catch (e) { setMsg("❌ " + e.message); }
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.city?.toLowerCase().includes(search.toLowerCase())
  );

  const totalTokens   = users.reduce((s, u) => s + (u.tokens || 0), 0);
  const activeToday   = users.filter(u => u.last_login && new Date(u.last_login) > new Date(Date.now() - 86400000)).length;
  const pkUsers       = users.filter(u => u.country !== "United States").length;
  const usUsers       = users.filter(u => u.country === "United States").length;

  if (checking) return <div style={{ background: NAVY, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, fontFamily: "Georgia,serif", fontSize: 18 }}>Checking access...</div>;

  if (!authed) return (
    <div style={{ background: NAVY, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#FAF6EE" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 20, color: RED, marginBottom: 8 }}>Access Denied</div>
        <div style={{ fontSize: 13, color: TEXT_MUTED }}>This page is restricted to administrators only.</div>
        <button onClick={() => window.close()} style={{ marginTop: 20, padding: "10px 24px", background: GOLD, color: NAVY, border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700 }}>Close</button>
      </div>
    </div>
  );

  return (
    <>
      <Head><title>ARK LAW AI — Admin Panel</title></Head>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${NAVY}; color: #FAF6EE; font-family: Segoe UI, sans-serif; min-height: 100vh; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${NAVY_MID}; } ::-webkit-scrollbar-thumb { background: ${GOLD}60; border-radius: 3px; }
        table { border-collapse: collapse; width: 100%; }
        th { background: ${NAVY_MID}; color: ${GOLD}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px; text-align: left; }
        td { padding: 9px 12px; font-size: 12px; border-bottom: 1px solid ${NAVY_BORDER}; vertical-align: middle; }
        tr:hover td { background: ${NAVY_SURFACE}; cursor: pointer; }
        input, select { background: ${NAVY_SURFACE}; border: 1px solid ${NAVY_BORDER}; color: #FAF6EE; border-radius: 4px; padding: 6px 10px; font-size: 12px; outline: none; }
        input:focus, select:focus { border-color: ${GOLD}; }
        .tab-btn { padding: 8px 18px; border: none; border-radius: 4px 4px 0 0; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#1B2E1A", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `2px solid ${GOLD}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/ark-logo.png" alt="ARK" style={{ width: 40, height: 40 }} />
          <div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: GOLD }}>ARK LAW AI</div>
            <div style={{ fontSize: 10, color: "#9DB89A" }}>Admin Control Panel</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 11, color: TEXT_MUTED }}>🔑 Logged in as: <span style={{ color: GOLD }}>Khawer Rabbani</span></div>
          <button onClick={() => window.close()} style={{ padding: "6px 14px", background: RED, color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Close</button>
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Users", value: users.length, icon: "👥", color: GOLD },
            { label: "Active Today", value: activeToday, icon: "🟢", color: GREEN },
            { label: "Pakistan Users", value: pkUsers, icon: "🇵🇰", color: "#4CAF7D" },
            { label: "US Users", value: usUsers, icon: "🇺🇸", color: "#BF0A30" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} style={{ background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "Georgia,serif" }}>{value}</div>
              <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 0 }}>
          {[["users","👥 Users"], ["stats","📊 Stats"], ["tokens","⚡ Tokens"]].map(([t, label]) => (
            <button key={t} className="tab-btn"
              style={{ background: tab === t ? NAVY_SURFACE : NAVY_MID, color: tab === t ? GOLD : TEXT_MUTED, borderBottom: tab === t ? `2px solid ${GOLD}` : "2px solid transparent" }}
              onClick={() => setTab(t)}>{label}</button>
          ))}
          <div style={{ flex: 1, borderBottom: `2px solid ${NAVY_BORDER}` }} />
        </div>

        {msg && (
          <div style={{ padding: "8px 14px", background: msg.startsWith("✅") ? "#14532D" : "#7F1D1D", borderRadius: 6, marginTop: 12, fontSize: 12, display: "flex", justifyContent: "space-between" }}>
            <span>{msg}</span>
            <span style={{ cursor: "pointer", opacity: 0.7 }} onClick={() => setMsg("")}>✕</span>
          </div>
        )}

        <div style={{ background: NAVY_SURFACE, border: `1px solid ${NAVY_BORDER}`, borderRadius: "0 6px 6px 6px", padding: 16, marginTop: 0 }}>

          {/* ── USERS TAB ── */}
          {tab === "users" && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, city..." style={{ flex: 1 }} />
                <button onClick={fetchUsers} style={{ padding: "6px 14px", background: GREEN, color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🔄 Refresh</button>
                <div style={{ fontSize: 11, color: TEXT_MUTED }}>{filtered.length} / {users.length} users</div>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: 40, color: TEXT_MUTED }}>Loading users...</div>
              ) : (
                <div style={{ display: "flex", gap: 16 }}>
                  {/* User list */}
                  <div style={{ flex: 1, overflowX: "auto", maxHeight: "60vh", overflowY: "auto" }}>
                    <table>
                      <thead><tr>
                        <th>Name</th><th>Email</th><th>Profession</th><th>City</th><th>Country</th><th>Tokens</th><th>Last Login</th><th>Actions</th>
                      </tr></thead>
                      <tbody>
                        {filtered.map(u => (
                          <tr key={u.id} onClick={() => setSelected(u)} style={{ background: selected?.id === u.id ? `${GOLD}15` : undefined }}>
                            <td style={{ fontWeight: 600 }}>{u.name}</td>
                            <td style={{ color: TEXT_MUTED }}>{u.email}</td>
                            <td>{u.profession}</td>
                            <td>{u.city}</td>
                            <td>{u.country}</td>
                            <td><span style={{ color: u.tokens > 100000 ? GREEN : GOLD, fontWeight: 700 }}>{(u.tokens || 0).toLocaleString()}</span></td>
                            <td style={{ color: TEXT_MUTED, fontSize: 11 }}>{u.last_login ? new Date(u.last_login).toLocaleDateString() : "Never"}</td>
                            <td>
                              <button onClick={(e) => { e.stopPropagation(); deleteUser(u.id, u.email); }}
                                style={{ padding: "3px 8px", background: RED, color: "white", border: "none", borderRadius: 3, cursor: "pointer", fontSize: 10 }}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* User detail panel */}
                  {selected && (
                    <div style={{ width: 280, background: NAVY_MID, borderRadius: 8, border: `1px solid ${NAVY_BORDER}`, padding: 16, flexShrink: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontFamily: "Georgia,serif", fontSize: 14, fontWeight: 700, color: GOLD }}>User Detail</span>
                        <span style={{ cursor: "pointer", color: TEXT_MUTED }} onClick={() => setSelected(null)}>✕</span>
                      </div>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${GOLD}, #3EB489)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 12 }}>{selected.name?.charAt(0)?.toUpperCase()}</div>
                      {[
                        ["Name", selected.name],
                        ["Email", selected.email],
                        ["Profession", selected.profession],
                        ["City", selected.city],
                        ["State/Province", selected.province],
                        ["Country", selected.country],
                        ["Created", selected.created_at ? new Date(selected.created_at).toLocaleDateString() : "—"],
                        ["Last Login", selected.last_login ? new Date(selected.last_login).toLocaleString() : "Never"],
                        ["Chat Sessions", (() => { try { return JSON.parse(selected.chat_history || "[]").length + " sessions"; } catch { return "0 sessions"; } })()],
                      ].map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${NAVY_BORDER}`, padding: "5px 0", fontSize: 11 }}>
                          <span style={{ color: TEXT_MUTED }}>{k}</span>
                          <span style={{ color: "#FAF6EE", fontWeight: 500, textAlign: "right", maxWidth: 140, wordBreak: "break-all" }}>{v || "—"}</span>
                        </div>
                      ))}
                      {/* Token adjustment */}
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 6 }}>⚡ Adjust Tokens</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <input id="tok-input" type="number" defaultValue={selected.tokens} style={{ flex: 1, width: "100%" }} />
                          <button onClick={() => { const v = parseInt(document.getElementById("tok-input").value); if (!isNaN(v)) updateTokens(selected.id, v); }}
                            style={{ padding: "5px 10px", background: GREEN, color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Set</button>
                        </div>
                        <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                          {[100000, 250000, 500000].map(n => (
                            <button key={n} onClick={() => updateTokens(selected.id, n)}
                              style={{ flex: 1, padding: "4px 0", background: NAVY_SURFACE, color: GOLD, border: `1px solid ${GOLD}40`, borderRadius: 3, cursor: "pointer", fontSize: 9, fontWeight: 700 }}>{(n/1000)}K</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STATS TAB ── */}
          {tab === "stats" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: NAVY_MID, borderRadius: 8, padding: 16 }}>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 14, color: GOLD, marginBottom: 12 }}>📊 Profession Breakdown</div>
                {Object.entries(users.reduce((acc, u) => { acc[u.profession || "Unknown"] = (acc[u.profession || "Unknown"] || 0) + 1; return acc; }, {}))
                  .sort((a, b) => b[1] - a[1]).map(([prof, count]) => (
                  <div key={prof} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12 }}>{prof}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: Math.max(4, (count / users.length) * 120), height: 6, background: GREEN, borderRadius: 3 }} />
                      <span style={{ fontSize: 11, color: GOLD, width: 20, textAlign: "right" }}>{count}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: NAVY_MID, borderRadius: 8, padding: 16 }}>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 14, color: GOLD, marginBottom: 12 }}>🌍 Country Breakdown</div>
                {Object.entries(users.reduce((acc, u) => { const c = u.country || "Unknown"; acc[c] = (acc[c] || 0) + 1; return acc; }, {}))
                  .sort((a, b) => b[1] - a[1]).map(([country, count]) => (
                  <div key={country} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12 }}>{country}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: Math.max(4, (count / users.length) * 120), height: 6, background: "#BF0A30", borderRadius: 3 }} />
                      <span style={{ fontSize: 11, color: GOLD, width: 20, textAlign: "right" }}>{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TOKENS TAB ── */}
          {tab === "tokens" && (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, background: NAVY_MID, borderRadius: 8, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: GOLD, fontFamily: "Georgia,serif" }}>{totalTokens.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>Total Tokens Remaining</div>
                </div>
                <div style={{ flex: 1, background: NAVY_MID, borderRadius: 8, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: GREEN, fontFamily: "Georgia,serif" }}>{users.length > 0 ? Math.round(totalTokens / users.length).toLocaleString() : 0}</div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>Avg Tokens per User</div>
                </div>
                <div style={{ flex: 1, background: NAVY_MID, borderRadius: 8, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#BF0A30", fontFamily: "Georgia,serif" }}>{users.filter(u => (u.tokens || 0) < 50000).length}</div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>Low Balance (&lt;50K)</div>
                </div>
              </div>
              <table>
                <thead><tr><th>User</th><th>Email</th><th>Tokens</th><th>% Remaining</th><th>Quick Set</th></tr></thead>
                <tbody>
                  {[...users].sort((a, b) => (a.tokens || 0) - (b.tokens || 0)).map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ color: TEXT_MUTED }}>{u.email}</td>
                      <td><span style={{ color: (u.tokens || 0) > 100000 ? GREEN : (u.tokens || 0) > 50000 ? GOLD : RED, fontWeight: 700 }}>{(u.tokens || 0).toLocaleString()}</span></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 80, height: 6, background: NAVY_BORDER, borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: Math.max(2, ((u.tokens || 0) / 500000) * 100) + "%", height: "100%", background: (u.tokens || 0) > 100000 ? GREEN : GOLD, borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 10, color: TEXT_MUTED }}>{Math.round(((u.tokens || 0) / 500000) * 100)}%</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          {[100000, 500000].map(n => (
                            <button key={n} onClick={() => updateTokens(u.id, n)}
                              style={{ padding: "3px 8px", background: NAVY_BORDER, color: GOLD, border: "none", borderRadius: 3, cursor: "pointer", fontSize: 9, fontWeight: 700 }}>+{n/1000}K</button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
