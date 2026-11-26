"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { SUTO, type Lang } from "@/lib/config";
import { digits } from "@/lib/i18n";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let client: SupabaseClient | null = null;
const sb = () => (client ??= url && key ? createClient(url, key, { auth: { storageKey: "suto-admin", persistSession: true } }) : null);

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type Status = (typeof STATUSES)[number];
type Item = { id: number; product_id: string; size: string; qty: number; unit_price: number; line_total: number };
type Order = {
  id: string; order_code: string; customer_name: string; phone: string; address: string; zone: "dhaka" | "outside";
  note: string | null; subtotal: number; delivery_fee: number; total: number; status: Status; lang: string; created_at: string;
  suto_order_items: Item[];
};

const names = Object.fromEntries(SUTO.looks.flatMap((l) => l.pieces.map((p) => [p.id, p.name])));
/* what each status moves to next */
const NEXT: Record<Status, Status[]> = {
  pending: ["confirmed", "cancelled"], confirmed: ["shipped", "cancelled"], shipped: ["delivered"], delivered: [], cancelled: ["pending"],
};

const W = {
  title: { en: "Orders", bn: "অর্ডার" }, signin: { en: "Admin sign in", bn: "অ্যাডমিন লগইন" },
  email: { en: "Email", bn: "ইমেইল" }, password: { en: "Password", bn: "পাসওয়ার্ড" }, go: { en: "Sign in", bn: "লগইন" },
  bad_login: { en: "Email or password is wrong.", bn: "ইমেইল বা পাসওয়ার্ড ভুল।" },
  not_staff: { en: "This account is not an admin. Ask the owner to give it admin access.", bn: "এই অ্যাকাউন্ট অ্যাডমিন নয়। মালিককে অ্যাডমিন অ্যাক্সেস দিতে বলুন।" },
  signout: { en: "Sign out", bn: "লগআউট" }, refresh: { en: "Refresh", bn: "রিফ্রেশ" }, search: { en: "Search code, name or phone", bn: "কোড, নাম বা ফোন খুঁজুন" },
  all: { en: "All", bn: "সব" }, pending: { en: "Pending", bn: "নতুন" }, confirmed: { en: "Confirmed", bn: "নিশ্চিত" }, shipped: { en: "Shipped", bn: "পাঠানো হয়েছে" },
  delivered: { en: "Delivered", bn: "ডেলিভারি হয়েছে" }, cancelled: { en: "Cancelled", bn: "বাতিল" },
  today: { en: "Orders today", bn: "আজকের অর্ডার" }, waiting: { en: "Waiting to confirm", bn: "নিশ্চিত করা বাকি" }, revenue: { en: "Sales this month", bn: "এ মাসের বিক্রি" },
  none: { en: "No orders here yet.", bn: "এখানে এখনও কোনো অর্ডার নেই।" }, mark: { en: "Mark as", bn: "করুন:" },
  dhaka: { en: "Inside Dhaka", bn: "ঢাকার ভেতরে" }, outside: { en: "Outside Dhaka", bn: "ঢাকার বাইরে" },
  delivery: { en: "Delivery", bn: "ডেলিভারি" }, total: { en: "Total", bn: "মোট" }, note: { en: "Note", bn: "নোট" },
  no_config: { en: "Supabase keys are missing.", bn: "Supabase key বসানো নেই।" }, failed: { en: "Could not change the status.", bn: "স্ট্যাটাস বদলানো যায়নি।" },
  store: { en: "← Store", bn: "← দোকান" },
} as const;

export default function Admin() {
  const [lang, setLang] = useState<Lang>("en");
  const t = (k: keyof typeof W) => W[k][lang];
  const d = (v: string | number) => digits(v, lang);
  const money = (v: number) => SUTO.currency + d(v.toLocaleString("en-IN"));
  const when = (iso: string) => d(new Date(iso).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }));

  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [staff, setStaff] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"all" | Status>("pending");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try { const l = localStorage.getItem("suto_lang"); if (l) setLang(JSON.parse(l)); } catch { /* ignore */ }
    const c = sb();
    if (!c) { setReady(true); return; }
    c.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = c.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const load = useCallback(async () => {
    const c = sb(); if (!c) return;
    setLoading(true);
    const { data, error } = await c.from("suto_orders").select("*, suto_order_items(*)").order("created_at", { ascending: false }).limit(500);
    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    const c = sb();
    if (!c || !session) { setStaff(null); return; }
    c.rpc("is_staff").then(({ data }) => { setStaff(Boolean(data)); if (data) load(); });
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [session, load]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    const c = sb(); if (!c) { setErr(t("no_config")); return; }
    const { error } = await c.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setErr(t("bad_login")); else setPassword("");
  };
  const setStatus = async (o: Order, s: Status) => {
    const c = sb(); if (!c) return;
    setBusy(o.id); setErr("");
    const { error } = await c.rpc("suto_set_order_status", { p_order_id: o.id, p_status: s });
    if (error) setErr(t("failed")); else setOrders((all) => all.map((x) => (x.id === o.id ? { ...x, status: s } : x)));
    setBusy(null);
  };

  const stats = useMemo(() => {
    const now = new Date(), dhaka = (x: Date) => x.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
    const today = dhaka(now), month = today.slice(0, 7);
    return {
      today: orders.filter((o) => dhaka(new Date(o.created_at)) === today).length,
      waiting: orders.filter((o) => o.status === "pending").length,
      revenue: orders.filter((o) => o.status !== "cancelled" && dhaka(new Date(o.created_at)).startsWith(month)).reduce((a, o) => a + o.total, 0),
    };
  }, [orders]);
  const shown = orders.filter((o) => (tab === "all" || o.status === tab) &&
    (!q.trim() || `${o.order_code} ${o.customer_name} ${o.phone}`.toLowerCase().includes(q.trim().toLowerCase())));

  const Top = (
    <header className="look-bg">
      <a className="logo" href="/">{SUTO.brand}</a>
      <nav style={{ marginInlineStart: "auto" }}><a href="/" style={{ display: "inline-block" }}>{t("store")}</a></nav>
      <button className="hbtn" onClick={() => { const l = lang === "en" ? "bn" : "en"; setLang(l); try { localStorage.setItem("suto_lang", JSON.stringify(l)); } catch { /* ignore */ } }}>
        {lang === "en" ? "বাংলা" : "English"}
      </button>
      {session && <button className="hbtn" onClick={() => sb()?.auth.signOut()}>{t("signout")}</button>}
    </header>
  );

  if (!ready) return <>{Top}</>;

  if (!session) return (
    <>{Top}
      <main className="band admin">
        <form className="login" onSubmit={signIn}>
          <h1>{t("signin")}</h1>
          <div className="field"><label htmlFor="a-email">{t("email")}</label><input id="a-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="field"><label htmlFor="a-pass">{t("password")}</label><input id="a-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <button className="btn full" type="submit" style={{ "--bfg": "var(--ink)", "--bbg": "var(--bg)" } as React.CSSProperties}><span className="lbl">{t("go")}</span></button>
          {err && <p className="err" role="alert">{err}</p>}
        </form>
      </main>
    </>
  );

  if (staff === false) return (<>{Top}<main className="band admin"><p className="login">{t("not_staff")}</p></main></>);

  return (
    <>{Top}
      <main className="band admin">
        <div className="wrap">
          <div className="ahead">
            <h1>{t("title")}</h1>
            <button className="chip" onClick={load} disabled={loading}>{loading ? "…" : t("refresh")}</button>
          </div>
          <div className="stats">
            <div><span>{t("today")}</span><b>{d(stats.today)}</b></div>
            <div><span>{t("waiting")}</span><b>{d(stats.waiting)}</b></div>
            <div><span>{t("revenue")}</span><b>{money(stats.revenue)}</b></div>
          </div>
          <div className="atools">
            <div className="chips">
              {(["all", ...STATUSES] as const).map((s) => (
                <button key={s} className="chip" aria-pressed={tab === s} onClick={() => setTab(s)}>
                  {t(s)} · {d(s === "all" ? orders.length : orders.filter((o) => o.status === s).length)}
                </button>
              ))}
            </div>
            <input className="search" type="search" placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t("search")} />
          </div>
          {err && <p className="err" role="alert">{err}</p>}
          {shown.length === 0 ? <p className="empty">{t("none")}</p> : (
            <div className="olist">
              {shown.map((o) => (
                <article className="order" key={o.id}>
                  <div className="otop">
                    <div><b className="ocode">{o.order_code}</b><span className="when">{when(o.created_at)}</span></div>
                    <span className={`badge s-${o.status}`}>{t(o.status)}</span>
                  </div>
                  <div className="ocols">
                    <div className="who">
                      <b>{o.customer_name}</b>
                      <a href={`tel:${o.phone}`}>{o.phone}</a>
                      <span>{o.address}</span>
                      <span className="muted">{t(o.zone)}</span>
                      {o.note && <span className="muted">{t("note")}: {o.note}</span>}
                    </div>
                    <ul className="oitems">
                      {o.suto_order_items.map((i) => (
                        <li key={i.id}><span>{names[i.product_id]?.[lang] ?? i.product_id} · {d(i.size)} × {d(i.qty)}</span><b>{money(i.line_total)}</b></li>
                      ))}
                      <li className="muted"><span>{t("delivery")}</span><b>{money(o.delivery_fee)}</b></li>
                      <li className="tot"><span>{t("total")}</span><b>{money(o.total)}</b></li>
                    </ul>
                  </div>
                  {NEXT[o.status].length > 0 && (
                    <div className="oact">
                      <span className="muted">{t("mark")}</span>
                      {NEXT[o.status].map((s) => (
                        <button key={s} className={`chip act s-${s}`} disabled={busy === o.id} onClick={() => setStatus(o, s)}>{t(s)}</button>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
