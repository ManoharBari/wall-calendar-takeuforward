"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_IMAGES = [
  "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=900&q=75",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=75",
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=900&q=75",
  "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=900&q=75",
  "https://images.unsplash.com/photo-1520962922320-2038eebab146?w=900&q=75",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=75",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=75",
  "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=900&q=75",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=75",
  "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=900&q=75",
  "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=900&q=75",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=75",
];

const HOLIDAYS = {
  "0-1": "New Year's Day",
  "0-26": "Republic Day",
  "2-8": "Holi",
  "3-14": "Ambedkar Jayanti",
  "7-15": "Independence Day",
  "9-2": "Gandhi Jayanti",
  "9-12": "Dussehra",
  "10-1": "Diwali",
  "10-5": "Bhai Dooj",
  "11-25": "Christmas",
};

function getDaysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}
function getFirstDay(y: number, m: number): number {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
}
function dateVal(d: { y: number; m: number; d: number } | null): number {
  return d ? d.y * 10000 + d.m * 100 + d.d : 0;
}
function sameDay(a: { y: number; m: number; d: number } | null, b: { y: number; m: number; d: number } | null): boolean {
  return a && b && a.y === b.y && a.m === b.m && a.d === b.d;
}

interface DateObj {
  y: number;
  m: number;
  d: number;
}

export default function WallCalendar() {
  const now = new Date();
  const [yr, setYr] = useState(now.getFullYear());
  const [mo, setMo] = useState(now.getMonth());
  const [start, setStart] = useState<DateObj | null>(null);
  const [end, setEnd] = useState<DateObj | null>(null);
  const [hover, setHover] = useState<DateObj | null>(null);
  const [picking, setPicking] = useState(false);
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wc-notes") || "{}");
    } catch {
      return {};
    }
  });
  const [noteText, setNoteText] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [anim, setAnim] = useState(false);
  const [animDir, setAnimDir] = useState(1);
  const [dark, setDark] = useState(false);
  const [showHol, setShowHol] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem("wc-notes", JSON.stringify(notes));
    } catch {}
  }, [notes]);

  const go = useCallback(
    (dir: number) => {
      if (anim) return;
      setAnimDir(dir);
      setAnim(true);
      setTimeout(() => {
        setMo((m) => {
          if (dir === 1) {
            if (m === 11) {
              setYr((y) => y + 1);
              return 0;
            }
            return m + 1;
          } else {
            if (m === 0) {
              setYr((y) => y - 1);
              return 11;
            }
            return m - 1;
          }
        });
        setAnim(false);
      }, 260);
    },
    [anim],
  );

  const clickDay = useCallback(
    (d) => {
      const dt = { y: yr, m: mo, d };
      if (!picking || (start && end)) {
        setStart(dt);
        setEnd(null);
        setPicking(true);
      } else {
        if (sameDay(dt, start)) {
          setPicking(false);
          return;
        }
        const [s, e] = dateVal(dt) > dateVal(start) ? [start, dt] : [dt, start];
        setStart(s);
        setEnd(e);
        setPicking(false);
        const k = `${s.y}-${s.m}-${s.d}__${e.y}-${e.m}-${e.d}`;
        setActiveKey(k);
        setNoteText(notes[k] || "");
      }
    },
    [picking, start, end, yr, mo, notes],
  );

  const saveNote = () => {
    if (!activeKey) return;
    setNotes((n) => ({ ...n, [activeKey]: noteText }));
  };

  const deleteNote = (k) => {
    setNotes((n) => {
      const x = { ...n };
      delete x[k];
      return x;
    });
    if (activeKey === k) {
      setActiveKey(null);
      setNoteText("");
    }
  };

  const clear = () => {
    setStart(null);
    setEnd(null);
    setPicking(false);
    setHover(null);
    setActiveKey(null);
    setNoteText("");
  };

  const dim = getDaysInMonth(yr, mo);
  const fd = getFirstDay(yr, mo);
  const cells = Array.from(
    { length: Math.ceil((fd + dim) / 7) * 7 },
    (_, i) => {
      const d = i - fd + 1;
      return d >= 1 && d <= dim ? d : null;
    },
  );

  const tod = { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
  const effEnd = picking && hover ? hover : end;
  const [lo, hi] =
    start && effEnd
      ? dateVal(start) <= dateVal(effEnd)
        ? [start, effEnd]
        : [effEnd, start]
      : [start, null];

  const C = dark
    ? {
        bg: "#0d1117",
        card: "#161b22",
        border: "#30363d",
        text: "#e6edf3",
        muted: "#7d8590",
        accent: "#2f81f7",
        accentBg: "#1c2d4c",
        range: "#0d2840",
        hero: "brightness(0.65)",
        sat: "#79c0ff",
        sun: "#ff7b72",
        note: "#1c2128",
        noteLine: "#21262d",
        coil: "#484f58",
        holColor: "#f0883e",
        today: "#f0883e",
        badge: "#2f81f7",
      }
    : {
        bg: "#eef2f8",
        card: "#ffffff",
        border: "#dce3ee",
        text: "#1c2533",
        muted: "#8895a7",
        accent: "#1a6ed8",
        accentBg: "#daeeff",
        range: "#cde5ff",
        hero: "brightness(0.88)",
        sat: "#1a6ed8",
        sun: "#d63031",
        note: "#f0f5ff",
        noteLine: "#d8e4f5",
        coil: "#b0bcc9",
        holColor: "#d96c00",
        today: "#e67e22",
        badge: "#1a6ed8",
      };

  const noteEntries = Object.entries(notes).filter(([, v]) => v?.trim());

  const fmtKey = (k) => {
    const [a, b] = k.split("__");
    const pa = a?.split("-"),
      pb = b?.split("-");
    if (!pa || !pb) return k;
    return `${MONTHS[+pa[1]]?.slice(0, 3)} ${pa[2]} → ${MONTHS[+pb[1]]?.slice(0, 3)} ${pb[2]}`;
  };

  const fmtDate = (d) => (d ? `${MONTHS[d.m]} ${d.d}, ${d.y}` : "");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        padding: "clamp(10px,3vw,28px)",
        fontFamily: "Georgia,serif",
        transition: "background .3s",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          maxWidth: 1040,
          margin: "0 auto 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: 2,
            color: C.muted,
            fontFamily: "sans-serif",
            textTransform: "uppercase",
          }}
        >
          Wall Calendar
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn
            dark={dark}
            active={showHol}
            onClick={() => setShowHol((v) => !v)}
          >
            {showHol ? "Hide Holidays" : "Show Holidays"}
          </Btn>
          <Btn dark={dark} onClick={() => setDark((v) => !v)}>
            {dark ? "☀ Light" : "◑ Dark"}
          </Btn>
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          background: C.card,
          borderRadius: 18,
          border: `1px solid ${C.border}`,
          overflow: "hidden",
          boxShadow: dark
            ? "0 12px 48px rgba(0,0,0,.5)"
            : "0 8px 40px rgba(60,100,180,.10)",
        }}
      >
        {/* Binding */}
        <div
          style={{
            background: C.card,
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "center",
            gap: "clamp(8px,2vw,18px)",
            padding: "9px 0 7px",
          }}
        >
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: `2.5px solid ${C.coil}`,
                background: "transparent",
              }}
            />
          ))}
        </div>

        {/* Hero */}
        <div
          style={{
            position: "relative",
            height: "clamp(170px,28vw,270px)",
            overflow: "hidden",
            background: "#222",
          }}
        >
          <img
            src={MONTH_IMAGES[mo]}
            alt={MONTHS[mo]}
            fill
            style={{
              objectFit: "cover",
              display: "block",
              filter: C.hero,
              opacity: anim ? 0 : 1,
              transform: anim
                ? `translateX(${animDir > 0 ? "-30px" : "30px"})`
                : "none",
              transition: "opacity .26s ease, transform .26s ease",
            }}
          />
          {/* Diagonal overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(130deg, transparent 42%, ${C.accent}f0 42%)`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              padding: "18px 26px",
            }}
          >
            <div
              style={{
                color: "rgba(255,255,255,.85)",
                fontSize: "clamp(18px,3.5vw,34px)",
                fontFamily: "Arial Black,sans-serif",
                fontWeight: 900,
                lineHeight: 1.1,
              }}
            >
              {yr}
            </div>
            <div
              style={{
                color: "#fff",
                fontSize: "clamp(26px,5vw,50px)",
                fontFamily: "Arial Black,sans-serif",
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: -1,
              }}
            >
              {MONTHS[mo].toUpperCase()}
            </div>
          </div>
          <NavBtn side="left" onClick={() => go(-1)}>
            ‹
          </NavBtn>
          <NavBtn side="right" onClick={() => go(1)}>
            ›
          </NavBtn>
        </div>

        {/* Lower */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "clamp(130px,20%,210px) 1fr",
          }}
        >
          {/* Notes sidebar */}
          <div
            style={{
              background: C.note,
              borderRight: `1px solid ${C.border}`,
              padding: "18px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              minHeight: 320,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: 1.8,
                textTransform: "uppercase",
                color: C.muted,
                fontFamily: "sans-serif",
                marginBottom: 2,
              }}
            >
              Notes
            </div>

            {start && end ? (
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: C.accent,
                    fontFamily: "sans-serif",
                    fontWeight: "bold",
                    marginBottom: 6,
                  }}
                >
                  {fmtDate(lo)} → {fmtDate(hi)}
                </div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onBlur={saveNote}
                  placeholder="Write a note…"
                  style={{
                    width: "100%",
                    minHeight: 80,
                    background: "transparent",
                    border: "none",
                    borderBottom: `1.5px solid ${C.noteLine}`,
                    outline: "none",
                    resize: "none",
                    color: C.text,
                    fontFamily: "Georgia,serif",
                    fontSize: 12,
                    lineHeight: 1.9,
                    padding: "4px 0",
                    boxSizing: "border-box",
                  }}
                />
                <Btn
                  dark={dark}
                  active
                  onClick={saveNote}
                  style={{ fontSize: 10, padding: "3px 10px", marginTop: 5 }}
                >
                  Save
                </Btn>
              </div>
            ) : (
              <div
                style={{
                  fontSize: 11,
                  color: C.muted,
                  fontFamily: "sans-serif",
                  lineHeight: 1.6,
                }}
              >
                Select a date range to add notes
              </div>
            )}

            {noteEntries.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: C.muted,
                    fontFamily: "sans-serif",
                  }}
                >
                  Saved
                </div>
                {noteEntries.map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: "7px 9px",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        color: C.accent,
                        fontFamily: "sans-serif",
                        fontWeight: "bold",
                        marginBottom: 3,
                      }}
                    >
                      {fmtKey(k)}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.text,
                        fontFamily: "sans-serif",
                        lineHeight: 1.5,
                        wordBreak: "break-word",
                      }}
                    >
                      {v.slice(0, 70)}
                      {v.length > 70 ? "…" : ""}
                    </div>
                    <button
                      onClick={() => deleteNote(k)}
                      style={{
                        position: "absolute",
                        top: 3,
                        right: 7,
                        background: "none",
                        border: "none",
                        color: C.muted,
                        cursor: "pointer",
                        fontSize: 15,
                        lineHeight: 1,
                        padding: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: "auto" }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    borderBottom: `1px solid ${C.noteLine}`,
                    height: 20,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Grid */}
          <div
            style={{
              padding: "18px clamp(10px,3vw,26px)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {/* Status bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                minHeight: 22,
                flexWrap: "wrap",
              }}
            >
              {start ? (
                <>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "sans-serif",
                      color: C.accent,
                      fontWeight: "bold",
                    }}
                  >
                    {fmtDate(start)}
                    {end
                      ? ` → ${fmtDate(end)}`
                      : picking
                        ? " → click end date"
                        : ""}
                  </span>
                  <Btn
                    dark={dark}
                    onClick={clear}
                    style={{ fontSize: 10, padding: "2px 8px" }}
                  >
                    Clear
                  </Btn>
                </>
              ) : (
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "sans-serif",
                    color: C.muted,
                  }}
                >
                  Click a day to start selecting a range
                </span>
              )}
            </div>

            {/* Weekday row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7,1fr)",
                gap: 2,
              }}
            >
              {WEEKDAYS.map((d, i) => (
                <div
                  key={d}
                  style={{
                    textAlign: "center",
                    fontSize: 11,
                    fontFamily: "sans-serif",
                    fontWeight: "bold",
                    letterSpacing: 0.5,
                    padding: "5px 0",
                    color: i === 5 ? C.sat : i === 6 ? C.sun : C.muted,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7,1fr)",
                gap: 2,
                opacity: anim ? 0 : 1,
                transform: anim
                  ? `translateX(${animDir > 0 ? "-20px" : "20px"})`
                  : "none",
                transition: "opacity .26s ease,transform .26s ease",
              }}
              onMouseLeave={() => setHover(null)}
            >
              {cells.map((day, i) => {
                if (!day) return <div key={`e${i}`} />;
                const dt = { y: yr, m: mo, d: day };
                const isToday = sameDay(dt, tod);
                const isStart = sameDay(dt, lo);
                const isEnd = hi && sameDay(dt, hi);
                const inRange =
                  lo &&
                  hi &&
                  dateVal(dt) > dateVal(lo) &&
                  dateVal(dt) < dateVal(hi);
                const wi = i % 7;
                const holKey = `${mo}-${day}`;
                const hol = showHol ? HOLIDAYS[holKey] : null;
                const hasNote = noteEntries.some(([k]) => {
                  const [a, b] = k.split("__");
                  const pa = a?.split("-"),
                    pb = b?.split("-");
                  if (!pa || !pb) return false;
                  const dv = dateVal(dt),
                    ds = +pa[0] * 10000 + +pa[1] * 100 + +pa[2],
                    de = +pb[0] * 10000 + +pb[1] * 100 + +pb[2];
                  return dv >= ds && dv <= de;
                });
                let bg = "transparent",
                  col = isToday
                    ? C.today
                    : wi === 5
                      ? C.sat
                      : wi === 6
                        ? C.sun
                        : C.text;
                let br = 7;
                if (isStart || isEnd) {
                  bg = C.accent;
                  col = "#fff";
                } else if (inRange) {
                  bg = C.range;
                  col = dark ? "#93c5fd" : "#1e3a5f";
                }
                if (isStart && hi) br = "7px 0 0 7px";
                else if (isEnd) br = "0 7px 7px 0";
                else if (inRange) br = 0;
                return (
                  <div
                    key={day}
                    onClick={() => clickDay(day)}
                    onMouseEnter={() => {
                      if (picking) setHover({ y: yr, m: mo, d: day });
                    }}
                    style={{
                      position: "relative",
                      textAlign: "center",
                      padding: "7px 2px 5px",
                      borderRadius: br,
                      background: bg,
                      cursor: "pointer",
                      transition: "background .1s",
                      userSelect: "none",
                    }}
                  >
                    {isToday && !isStart && !isEnd && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 2,
                          borderRadius: 5,
                          border: `2px solid ${C.today}`,
                          pointerEvents: "none",
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: 13,
                        fontFamily: "sans-serif",
                        fontWeight:
                          isToday || isStart || isEnd ? "bold" : "normal",
                        color: col,
                        lineHeight: 1,
                      }}
                    >
                      {day}
                    </span>
                    {hol && (
                      <div
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: isStart || isEnd ? "#fff" : C.holColor,
                          margin: "2px auto 0",
                        }}
                        title={hol}
                      />
                    )}
                    {hasNote && !hol && (
                      <div
                        style={{
                          width: 3,
                          height: 3,
                          borderRadius: "50%",
                          background:
                            isStart || isEnd ? "rgba(255,255,255,.7)" : C.badge,
                          margin: "2px auto 0",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 2,
              }}
            >
              {[
                { color: C.accent, label: "Start/End" },
                { color: C.range, label: "In range" },
                { color: C.today, label: "Today", ring: true },
                ...(showHol
                  ? [{ color: C.holColor, label: "Holiday", dot: true }]
                  : []),
                { color: C.badge, label: "Has note", dot: true },
              ].map(({ color, label, ring, dot }) => (
                <div
                  key={label}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: ring ? 0 : dot ? 0 : 3,
                      background: ring || dot ? "transparent" : color,
                      border: ring ? `2px solid ${color}` : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {dot && (
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: color,
                        }}
                      />
                    )}
                    {ring && (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 2,
                          border: `2px solid ${color}`,
                        }}
                      />
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "sans-serif",
                      color: C.muted,
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:600px){
          [data-lower]{grid-template-columns:1fr!important}
          [data-notes]{border-right:none!important;border-bottom:1px solid ${C.border}}
        }
      `}</style>
    </div>
  );
}

function Btn({ dark, active, children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "#1a6ed8" : "transparent",
        border: `1px solid ${active ? "#1a6ed8" : dark ? "#3a3f52" : "#c8d4e8"}`,
        color: active ? "#fff" : dark ? "#c0c8e0" : "#4a5568",
        borderRadius: 6,
        padding: "5px 12px",
        fontSize: 11,
        fontFamily: "sans-serif",
        cursor: "pointer",
        transition: "all .15s",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function NavBtn({ side, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        top: "50%",
        [side]: 14,
        transform: "translateY(-50%)",
        background: "rgba(0,0,0,.38)",
        border: "1px solid rgba(255,255,255,.2)",
        color: "#fff",
        width: 36,
        height: 36,
        borderRadius: "50%",
        fontSize: 24,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
        backdropFilter: "blur(3px)",
      }}
    >
      {children}
    </button>
  );
}
