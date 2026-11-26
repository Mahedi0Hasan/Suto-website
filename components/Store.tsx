"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SUTO, type Lang, type Piece, type Text } from "@/lib/config";
import { T, digits, type Key } from "@/lib/i18n";
import { placeOrder, type OrderResult } from "@/lib/supabase";
import { figureSvg, iconSvg } from "./art";

type BagItem = { id: string; size: string; qty: number };
type Zone = "dhaka" | "outside";
type FlatPiece = Piece & { look: number };

const looks = SUTO.looks;
const n = looks.length;
const pieces: FlatPiece[] = looks.flatMap((lk, li) => lk.pieces.map((p) => ({ ...p, look: li })));
const byId: Record<string, FlatPiece> = Object.fromEntries(pieces.map((p) => [p.id, p]));
const FILTERS = ["all", "women", "men", "deshi", "western"] as const;
/* depth → [x %, y %, scale, blur px, opacity] */
const POS = [[0, 0, 1, 0, 1], [24, -7, 0.8, 1.4, 0.9], [-24, -12, 0.66, 2.4, 0.8], [44, -16, 0.55, 3.2, 0.7], [-44, -19, 0.47, 4, 0.6]];

const pieceColor = (p: Piece) => p.color;
const midSize = (p: Piece) => p.sizes[Math.floor((p.sizes.length - 1) / 2)];
const store = {
  get<V>(k: string, d: V): V { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as V) : d; } catch { return d; } },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
const toAsciiDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));

export default function Store() {
  const [lang, setLang] = useState<Lang>("en");
  const tr = (k: Key) => T[k][lang];
  const L = (o: Text) => o[lang];
  const money = (v: number) => SUTO.currency + digits(v.toLocaleString("en-IN"), lang);
  const d = (v: string | number) => digits(v, lang);

  /* ---------- runway state ---------- */
  const [cur, setCur] = useState(0);
  const [leaving, setLeaving] = useState<number[]>([]);
  const [snap, setSnap] = useState<number[]>([]);
  const [walking, setWalking] = useState(false);
  const curRef = useRef(0);
  const busy = useRef(false);
  const reduce = useRef(false);
  const [numKey, setNumKey] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);

  /* ---------- shop state ---------- */
  const [sel, setSel] = useState<Record<string, string>>(() => Object.fromEntries(pieces.map((p) => [p.id, midSize(p)])));
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [bag, setBag] = useState<BagItem[]>([]);
  const [zone, setZone] = useState<Zone>("dhaka");
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"bag" | "form" | "done">("bag");
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
  const [errors, setErrors] = useState<Partial<Record<"name" | "phone" | "address" | "server", Key>>>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [bump, setBump] = useState(0);
  const [toast, setToast] = useState("");

  /* load saved choices once */
  useEffect(() => {
    reduce.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setLang(store.get<Lang>("suto_lang", "en"));
    setBag(store.get<BagItem[]>("suto_bag", []).filter((i) => byId[i.id] && byId[i.id].sizes.includes(i.size)));
    setZone(store.get<Zone>("suto_zone", "dhaka"));
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) store.set("suto_bag", bag); }, [bag, loaded]);
  useEffect(() => { if (loaded) store.set("suto_zone", zone); }, [zone, loaded]);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.body.classList.toggle("bn", lang === "bn");
    if (loaded) store.set("suto_lang", lang);
  }, [lang, loaded]);

  /* page colour follows the look in front */
  useEffect(() => {
    const s = document.documentElement.style;
    s.setProperty("--look", looks[cur].bg);
    s.setProperty("--lookInk", looks[cur].ink);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", looks[cur].bg);
  }, [cur]);

  const go = useCallback((target: number) => {
    const t = (target + n) % n, old = curRef.current;
    if (t === old || busy.current) return;
    busy.current = true;
    const fwd = (t - old + n) % n <= n / 2;
    curRef.current = t;
    setWalking(true);
    setNumKey((k) => k + 1);
    if (fwd) {
      const lv: number[] = [];
      for (let k = old; k !== t; k = (k + 1) % n) lv.push(k);
      setLeaving(lv); setCur(t);
      setTimeout(() => {
        setSnap(lv); setLeaving([]);
        requestAnimationFrame(() => requestAnimationFrame(() => setSnap([])));
      }, 820);
    } else {
      setSnap([t]); setLeaving([t]); setCur(t);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setSnap([]);
        requestAnimationFrame(() => setLeaving([]));
      }));
    }
    setTimeout(() => { busy.current = false; setWalking(false); }, reduce.current ? 50 : 880);
  }, []);

  /* drag, swipe and keys */
  const sx = useRef<number | null>(null);
  useEffect(() => {
    const up = (e: PointerEvent) => {
      if (sx.current === null) return;
      const dx = e.clientX - sx.current; sx.current = null;
      if (Math.abs(dx) > 45) go(curRef.current + (dx < 0 ? 1 : -1));
      else {
        const m = (e.target as HTMLElement).closest<HTMLElement>(".model");
        if (m && !m.classList.contains("front")) go(Number(m.dataset.k));
      }
    };
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.matches("input,textarea")) return;
      if (e.key === "ArrowRight") go(curRef.current + 1);
      if (e.key === "ArrowLeft") go(curRef.current - 1);
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Enter" && el.classList.contains("model")) go(Number(el.dataset.k));
    };
    addEventListener("pointerup", up); addEventListener("keydown", key);
    return () => { removeEventListener("pointerup", up); removeEventListener("keydown", key); };
  }, [go]);

  /* button effects: ripple on tap, magnetic pull on desktop */
  useEffect(() => {
    const down = (e: PointerEvent) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>(".btn");
      if (!b || reduce.current) return;
      const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2, sp = document.createElement("span");
      sp.className = "ripple";
      sp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
      b.appendChild(sp); setTimeout(() => sp.remove(), 650);
    };
    const move = (e: PointerEvent) => {
      document.querySelectorAll<HTMLElement>(".mag").forEach((b) => {
        const r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const near = Math.abs(dx) < r.width / 2 + 40 && Math.abs(dy) < r.height / 2 + 40;
        b.style.transform = near ? `translate(${dx * 0.18}px,${dy * 0.25}px)` : "";
      });
    };
    document.addEventListener("pointerdown", down);
    const fine = matchMedia("(pointer:fine)").matches && !reduce.current;
    if (fine) document.addEventListener("pointermove", move);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("pointermove", move); };
  }, []);

  /* ---------- bag ---------- */
  const flashDone = (key: string) => {
    setDone((s) => ({ ...s, [key]: true }));
    setTimeout(() => setDone((s) => ({ ...s, [key]: false })), 1400);
  };
  const showToast = useRef<ReturnType<typeof setTimeout>>(undefined);
  const say = (s: string) => { setToast(s); clearTimeout(showToast.current); showToast.current = setTimeout(() => setToast(""), 2200); };
  const addItems = (items: { id: string; size: string }[]) => {
    setBag((b) => {
      const next = b.map((i) => ({ ...i }));
      items.forEach(({ id, size }) => {
        const it = next.find((i) => i.id === id && i.size === size);
        if (it) it.qty = Math.min(20, it.qty + 1); else next.push({ id, size, qty: 1 });
      });
      return next;
    });
    setBump((x) => x + 1);
    if (step === "done") setStep("bag");
  };
  const changeQty = (ix: number, delta: number) => {
    setBag((b) => b.flatMap((i, k) => (k !== ix ? [i] : i.qty + delta < 1 ? [] : [{ ...i, qty: Math.min(20, i.qty + delta) }])));
    setBump((x) => x + 1);
  };
  const count = bag.reduce((a, i) => a + i.qty, 0);
  const subtotal = bag.reduce((a, i) => a + byId[i.id].price * i.qty, 0);
  const fee = bag.length ? SUTO.delivery[zone] : 0;

  const openCart = () => { setOpen(true); if (step === "done") setStep("bag"); };

  /* ---------- checkout ---------- */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = toAsciiDigits(form.phone).replace(/[\s-]/g, "");
    const errs: typeof errors = {};
    if (form.name.trim().length < 2) errs.name = "err_name";
    if (!/^(\+?88)?01[3-9]\d{8}$/.test(phone)) errs.phone = "err_phone";
    if (form.address.trim().length < 5) errs.address = "err_address";
    setErrors(errs);
    if (Object.keys(errs).length || !bag.length) return;
    setSending(true);
    try {
      const res = await placeOrder({ name: form.name.trim(), phone, address: form.address.trim(), note: form.note.trim(), zone, lang, items: bag });
      setResult(res); setBag([]); setStep("done"); setForm((f) => ({ ...f, note: "" }));
    } catch (err) {
      const m = err instanceof Error ? err.message : "";
      setErrors({ server: m.includes("not_configured") ? "err_config" : m.includes("too_fast") ? "err_fast" : m.includes("invalid_phone") ? "err_phone" : "err_generic" });
    } finally { setSending(false); }
  };

  /* ---------- derived ---------- */
  const lk = looks[cur];
  const lookTotal = lk.pieces.reduce((a, p) => a + p.price, 0);
  const shown = useMemo(() => pieces.filter((p) => filter === "all" || looks[p.look].gender === filter || looks[p.look].style === filter), [filter]);
  const figures = useMemo(() => looks.map((l) => (l.outfit ? figureSvg(l.outfit) : "")), []);
  const icons = useMemo(() => pieces.map((p) => iconSvg(p.kind, pieceColor(p))), []);

  const Sizes = ({ p }: { p: Piece }) => (
    <div className="sizes" role="group" aria-label={tr("size")}>
      {p.sizes.map((s) => (
        <button key={s} className="size" aria-pressed={sel[p.id] === s} onClick={() => setSel((x) => ({ ...x, [p.id]: s }))}>
          <span>{d(s)}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className={open ? "open" : ""}>
      <header className="look-bg">
        <a className="logo" href="#top">{SUTO.brand}</a>
        <nav>
          <a href="#runway">{tr("nav_runway")}</a>
          <a href="#collection">{tr("nav_collection")}</a>
          <a href="#story">{tr("nav_about")}</a>
        </nav>
        <button className="hbtn mag" onClick={() => setLang(lang === "en" ? "bn" : "en")} aria-label="Switch language">
          {lang === "en" ? "বাংলা" : "English"}
        </button>
        <button className="hbtn mag" onClick={openCart}>
          <span>{tr("bag")}</span>
          <span className={`count${bump ? " bump" : ""}`} key={bump}>{d(count)}</span>
        </button>
      </header>

      <main id="top">
        <section className="hero look-bg" id="runway" aria-label="Runway">
          <div className="stage" onPointerDown={(e) => { if (!(e.target as HTMLElement).closest("button")) sx.current = e.clientX; }}>
            <h1>{L(SUTO.tagline)}</h1>
            <div className="bignum" aria-hidden="true"><span key={numKey} className={numKey ? "roll" : ""}>{d(String(cur + 1).padStart(2, "0"))}</span></div>
            <div className="floor" />
            <div>
              {looks.map((l, k) => {
                const depth = (k - cur + n) % n, p = POS[Math.min(depth, POS.length - 1)];
                const cls = ["model", depth === 0 && "front", walking && "walk", leaving.includes(k) && "leave", snap.includes(k) && "snap"].filter(Boolean).join(" ");
                return (
                  <div key={k} className={cls} data-k={k} role="button" tabIndex={depth ? 0 : -1} aria-label={L(l.name)}
                    style={{ "--x": `${p[0]}%`, "--y": `${p[1]}%`, "--s": p[2], "--b": `${p[3]}px`, "--o": depth < POS.length ? p[4] : 0, zIndex: 10 - depth } as React.CSSProperties}>
                    {l.image ? <img src={l.image} alt={L(l.name)} draggable={false} loading={k < 2 ? "eager" : "lazy"} /> : <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: figures[k] }} />}
                    {l.pieces.map((pc) => (
                      <button key={pc.id} className="dot" aria-label={L(pc.name)} style={{ left: `${pc.dot[0] / 2}%`, top: `${pc.dot[1] / 5.2}%` }}
                        onClick={() => { setFlash(pc.id); setTimeout(() => setFlash(null), 900); }} />
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="controls">
              <button className="arrow mag" onClick={() => go(cur - 1)} aria-label="Previous look">←</button>
              <div className="ticks">
                {looks.map((_, k) => <button key={k} className="tick" aria-current={k === cur} aria-label={`${tr("look")} ${k + 1}`} onClick={() => go(k)} />)}
              </div>
              <button className="arrow mag" onClick={() => go(cur + 1)} aria-label="Next look">→</button>
            </div>
          </div>

          <div className="sheet">
            <p className="num">{tr("look")} {d(cur + 1)} / {d(n)}</p>
            <h2>{L(lk.name)}</h2>
            <p className="note">{L(lk.note)}</p>
            <ul className="pieces">
              {lk.pieces.map((p) => (
                <li key={p.id} className={flash === p.id ? "flash" : ""}>
                  <span className="sw" style={{ background: pieceColor(p) }} />
                  <span className="pname">{L(p.name)}</span>
                  <span className="price">{money(p.price)}</span>
                  <Sizes p={p} />
                </li>
              ))}
            </ul>
            <button className={`btn solid mag full${done.look ? " done" : ""}`}
              onClick={() => { addItems(lk.pieces.map((p) => ({ id: p.id, size: sel[p.id] }))); flashDone("look"); say(tr("look_added")); }}>
              <span className="lbl">{tr("add_look")} — {money(lookTotal)}</span><span className="ok" aria-hidden="true">✓</span>
            </button>
            <p className="hint" style={{ position: "static", marginTop: 14 }}>{tr("drag")}</p>
          </div>
        </section>

        <section className="band" id="collection">
          <div className="wrap">
            <div className="head">
              <h2>{tr("coll_title")}</h2>
              <div className="chips">
                {FILTERS.map((f) => <button key={f} className="chip" aria-pressed={f === filter} onClick={() => setFilter(f)}>{tr(f)}</button>)}
              </div>
            </div>
            <div className="grid">
              {shown.map((p) => (
                <article className="card" key={p.id}>
                  {looks[p.look].image ? (
                    <div className="pic photo" role="img" aria-label={L(p.name)}
                      style={{ backgroundColor: looks[p.look].bg, backgroundImage: `url(${looks[p.look].image})`, backgroundPosition: `${(p.dot[0] / 200) * 100}% ${(p.dot[1] / 520) * 100}%` }} />
                  ) : (
                    <div className="pic" style={{ background: looks[p.look].bg }} dangerouslySetInnerHTML={{ __html: icons[pieces.indexOf(p)] }} />
                  )}
                  <div className="body">
                    <div className="row"><b>{L(p.name)}</b><span className="price">{money(p.price)}</span></div>
                    <span className="from">{tr("from_look")} {L(looks[p.look].name)}</span>
                    <Sizes p={p} />
                    <button className={`btn mag${done[p.id] ? " done" : ""}`}
                      onClick={() => { addItems([{ id: p.id, size: sel[p.id] }]); flashDone(p.id); say(`${L(p.name)} ${tr("added")}`); }}>
                      <span className="lbl">{tr("add")}</span><span className="ok" aria-hidden="true">✓</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <p className="sample">{tr("sample")}</p>
          </div>
        </section>

        <section className="band" id="story">
          <div className="wrap story">
            <div>
              <h2>{tr("story_title")}</h2>
              <p>{tr("story_1")}</p>
              <p>{tr("story_2")}</p>
            </div>
            <svg className="stitch" viewBox="0 0 480 300" aria-hidden="true">
              <circle cx="380" cy="80" r="46" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="380" cy="80" r="30" fill="currentColor" opacity=".18" />
              <path d="M380 126 C 330 200, 210 60, 140 160 S 40 250, 10 220" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M20 280 H460" stroke="currentColor" strokeWidth="3" strokeDasharray="14 10" strokeLinecap="round" />
              <path d="M20 250 H300" stroke="currentColor" strokeWidth="3" strokeDasharray="14 10" strokeLinecap="round" opacity=".45" />
              <path d="M440 30 l-46 40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <circle cx="444" cy="26" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </section>
      </main>

      <footer className="look-bg">
        <div className="wrap">
          <div className="fgrid">
            <div><div className="fbig">{SUTO.brand}</div><p>{L(SUTO.tagline)}</p></div>
            <div><h4>{tr("f_shop")}</h4><ul><li><a href="#runway">{tr("nav_runway")}</a></li><li><a href="#collection">{tr("nav_collection")}</a></li><li><a href="#story">{tr("nav_about")}</a></li></ul></div>
            <div><h4>{tr("f_help")}</h4><ul><li><a href="#story">{tr("f_delivery")}</a></li><li><a href="#story">{tr("f_returns")}</a></li><li><a href="#story">{tr("f_sizes")}</a></li></ul></div>
            <div><h4>{tr("f_contact")}</h4><ul>
              <li>{L(SUTO.contact.city)}</li>
              <li><a href={`tel:${SUTO.contact.phone.replace(/[^+\d]/g, "")}`}>{d(SUTO.contact.phone)}</a></li>
              <li><a href={`mailto:${SUTO.contact.email}`}>{SUTO.contact.email}</a></li>
            </ul></div>
          </div>
          <div className="copy"><span>© {d(new Date().getFullYear())} {SUTO.brand}</span><span>{tr("sample")}</span></div>
        </div>
      </footer>

      <div className="scrim" onClick={() => setOpen(false)} />
      <aside className="drawer" aria-label="Shopping bag" inert={!open}>
        <div className="dhead">
          <h3>{step === "form" ? tr("your_details") : tr("bag")}</h3>
          <button className="hbtn" style={{ borderColor: "var(--line)" }} onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>

        {step === "done" && result ? (
          <div className="success" role="status">
            <div className="tick">✓</div>
            <h3>{tr("thanks")}</h3>
            <p style={{ margin: 0, color: "var(--mute)" }}>{tr("order_no")}</p>
            <div className="code">{result.order_code}</div>
            <p style={{ margin: 0 }}>{tr("total")}: <b>{money(result.total)}</b></p>
            <p style={{ margin: 0, color: "var(--mute)" }}>{tr("call_soon")}</p>
            <button className="btn mag" style={{ "--bfg": "var(--ink)", "--bbg": "var(--bg)" } as React.CSSProperties}
              onClick={() => { setOpen(false); setStep("bag"); }}>
              <span className="lbl">{tr("keep_shopping")}</span><span className="ok" aria-hidden="true">✓</span>
            </button>
          </div>
        ) : step === "form" ? (
          <form className="form" onSubmit={submit} noValidate>
            <button type="button" className="linkbtn" onClick={() => setStep("bag")}>← {tr("back")}</button>
            {(["name", "phone", "address"] as const).map((f) => (
              <div className="field" key={f}>
                <label htmlFor={`f-${f}`}>{tr(`f_${f}` as Key)}</label>
                {f === "address" ? (
                  <textarea id={`f-${f}`} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} autoComplete="street-address" maxLength={300} />
                ) : (
                  <input id={`f-${f}`} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                    inputMode={f === "phone" ? "tel" : "text"} autoComplete={f === "phone" ? "tel" : "name"} maxLength={f === "phone" ? 16 : 80}
                    placeholder={f === "phone" ? "01XXXXXXXXX" : ""} />
                )}
                {errors[f] && <span className="err">{tr(errors[f]!)}</span>}
              </div>
            ))}
            <div className="field">
              <label htmlFor="f-note">{tr("f_note")}</label>
              <input id="f-note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={500} />
            </div>
            <div className="seg">
              {(["dhaka", "outside"] as const).map((z) => (
                <button type="button" key={z} className="chip" aria-pressed={z === zone} onClick={() => setZone(z)}>{tr(z)} · {money(SUTO.delivery[z])}</button>
              ))}
            </div>
            <p className="pay">{tr("pay")}</p>
            <div className="line"><span>{tr("subtotal")}</span><b>{money(subtotal)}</b></div>
            <div className="line"><span>{tr("delivery")}</span><b>{money(fee)}</b></div>
            <div className="line" style={{ fontSize: 18 }}><span>{tr("total")}</span><b>{money(subtotal + fee)}</b></div>
            <button type="submit" className="btn mag full" disabled={sending} style={{ "--bfg": "var(--ink)", "--bbg": "var(--bg)", marginBottom: 20 } as React.CSSProperties}>
              <span className="lbl">{sending ? tr("placing") : tr("place")}</span><span className="ok" aria-hidden="true">✓</span>
            </button>
            {errors.server && <p className="msg" role="alert" style={{ color: "#c2412d" }}>{tr(errors.server)}</p>}
          </form>
        ) : (
          <>
            <ul className="items">
              {bag.length ? bag.map((it, ix) => {
                const p = byId[it.id];
                return (
                  <li key={`${it.id}-${it.size}`}>
                    <span className="sw" style={{ background: pieceColor(p), boxShadow: "inset 0 0 0 1px rgba(0,0,0,.2)" }} />
                    <div><b>{L(p.name)}</b><div className="meta">{tr("size")}: {d(it.size)} · {L(looks[p.look].name)}</div></div>
                    <span className="price">{money(p.price * it.qty)}</span>
                    <div className="qty">
                      <button onClick={() => changeQty(ix, -1)} aria-label="−">−</button>
                      <span style={{ minWidth: 28, textAlign: "center" }}>{d(it.qty)}</span>
                      <button onClick={() => changeQty(ix, 1)} aria-label="+">+</button>
                      <button className="rm" onClick={() => changeQty(ix, -it.qty)}>{tr("remove")}</button>
                    </div>
                  </li>
                );
              }) : <li className="empty" style={{ display: "block" }}>{tr("empty")}</li>}
            </ul>
            <div className="dfoot">
              <div className="seg">
                {(["dhaka", "outside"] as const).map((z) => (
                  <button key={z} className="chip" aria-pressed={z === zone} onClick={() => setZone(z)}>{tr(z)} · {money(SUTO.delivery[z])}</button>
                ))}
              </div>
              <div className="line"><span>{tr("subtotal")}</span><b>{money(subtotal)}</b></div>
              <div className="line"><span>{tr("delivery")}</span><b>{money(fee)}</b></div>
              <div className="line" style={{ fontSize: 18 }}><span>{tr("total")}</span><b>{money(subtotal + fee)}</b></div>
              <button className="btn mag full" disabled={!bag.length} onClick={() => { setErrors({}); setStep("form"); }}>
                <span className="lbl">{tr("checkout")}</span><span className="ok" aria-hidden="true">✓</span>
              </button>
            </div>
          </>
        )}
      </aside>
      <div className={`toast${toast ? " show" : ""}`} role="status">{toast}</div>
    </div>
  );
}
