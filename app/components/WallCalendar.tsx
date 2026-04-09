"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

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

const MONTH_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=900&q=75",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=75",
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=900&q=75",
  "https://images.unsplash.com/photo-1490750967868-88df5691166a?w=900&q=75",
  "https://images.unsplash.com/photo-1520962922320-2038eebab146?w=900&q=75",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=75",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=75",
  "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=900&q=75",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=75",
  "https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=900&q=75",
  "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=900&q=75",
  "https://images.unsplash.com/photo-1482003297000-b7663a1673f9?w=900&q=75",
];

/** key format: "month-day"  (month = 0-indexed) */
const HOLIDAYS: Record<string, string> = {
  "0-1": "New Year's Day",
  "0-26": "Republic Day",
  "2-8": "Holi",
  "3-14": "Dr. Ambedkar Jayanti",
  "7-15": "Independence Day",
  "9-2": "Gandhi Jayanti",
  "9-12": "Dussehra",
  "10-1": "Diwali",
  "10-5": "Bhai Dooj",
  "11-25": "Christmas Day",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalDate {
  y: number;
  m: number; // 0-indexed
  d: number;
}

type NotesMap = Record<string, string>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

function firstDayOfMonth(y: number, m: number) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1; // Mon = 0
}

function dateValue(d: CalDate | null): number {
  return d ? d.y * 10000 + d.m * 100 + d.d : 0;
}

function sameDay(a: CalDate | null, b: CalDate | null) {
  return !!a && !!b && a.y === b.y && a.m === b.m && a.d === b.d;
}

function fmtDate(d: CalDate | null) {
  if (!d) return "";
  return `${MONTHS[d.m].slice(0, 3)} ${d.d}, ${d.y}`;
}

function fmtNoteKey(key: string) {
  const [a, b] = key.split("__");
  const pa = a?.split("-");
  const pb = b?.split("-");
  if (!pa || !pb || pa.length < 3 || pb.length < 3) return key;
  return `${MONTHS[+pa[1]]?.slice(0, 3)} ${pa[2]} → ${MONTHS[+pb[1]]?.slice(0, 3)} ${pb[2]}`;
}

function keyToDate(key: string): CalDate | null {
  const parts = key.split("-");
  if (parts.length !== 3) return null;
  return { y: +parts[0], m: +parts[1], d: +parts[2] };
}

// ─── Theme colours ────────────────────────────────────────────────────────────

function getColors(dark: boolean) {
  return dark
    ? {
        bg: "#0d1117",
        card: "#161b22",
        brd: "#30363d",
        txt: "#e6edf3",
        mu: "#7d8590",
        ac: "#2f81f7",
        rng: "#0d2840",
        sat: "#79c0ff",
        sun: "#ff7b72",
        note: "#1c2128",
        nl: "#21262d",
        coil: "#484f58",
        hol: "#f0883e",
        tod: "#f0883e",
        hero: "brightness(.65)",
      }
    : {
        bg: "#e8eef8",
        card: "#ffffff",
        brd: "#dce3ee",
        txt: "#1c2533",
        mu: "#8895a7",
        ac: "#1a6ed8",
        rng: "#cde5ff",
        sat: "#1a6ed8",
        sun: "#c0392b",
        note: "#f0f5ff",
        nl: "#d8e4f5",
        coil: "#b0bcc9",
        hol: "#d96c00",
        tod: "#e67e22",
        hero: "brightness(.88)",
      };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface BtnProps {
  active?: boolean;
  dark: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  extraStyle?: React.CSSProperties;
}

function Btn({ active, dark, onClick, children, extraStyle }: BtnProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "#1a6ed8" : "transparent",
        border: `1px solid ${active ? "#1a6ed8" : dark ? "#3a3f52" : "#c4d0e8"}`,
        color: active ? "#fff" : dark ? "#c0c8e0" : "#4a5568",
        borderRadius: 6,
        padding: "5px 12px",
        fontSize: 11,
        fontFamily: "sans-serif",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all .15s",
        ...extraStyle,
      }}
    >
      {children}
    </button>
  );
}

interface NavArrowProps {
  side: "left" | "right";
  onClick: () => void;
  children: React.ReactNode;
}

function NavArrow({ side, onClick, children }: NavArrowProps) {
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
        backdropFilter: "blur(4px)",
        fontFamily: "sans-serif",
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WallCalendar() {
  const now = new Date();

  const [yr, setYr] = useState(now.getFullYear());
  const [mo, setMo] = useState(now.getMonth());

  const [rangeStart, setRangeStart] = useState<CalDate | null>(null);
  const [rangeEnd, setRangeEnd] = useState<CalDate | null>(null);
  const [hoverDate, setHoverDate] = useState<CalDate | null>(null);
  const [picking, setPicking] = useState(false);

  const [notes, setNotes] = useState<NotesMap>({});
  const [noteText, setNoteText] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const [anim, setAnim] = useState(false);
  const [animDir, setAnimDir] = useState<1 | -1>(1);
  const [dark, setDark] = useState(false);
  const [showHolidays, setShowHolidays] = useState(true);

  // ── Persistence ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wc-data");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.notes) setNotes(data.notes);
        if (typeof data.dark === "boolean") setDark(data.dark);
        if (data.rangeStart) setRangeStart(data.rangeStart);
        if (data.rangeEnd) setRangeEnd(data.rangeEnd);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "wc-data",
        JSON.stringify({ notes, dark, rangeStart, rangeEnd }),
      );
    } catch {
      // ignore
    }
  }, [notes, dark, rangeStart, rangeEnd]);

  useEffect(() => {
    setNoteText(activeKey ? (notes[activeKey] ?? "") : "");
  }, [activeKey, notes]);

  // ── Navigation ──
  const navigate = useCallback(
    (dir: 1 | -1) => {
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
      }, 250);
    },
    [anim],
  );

  // ── Selection ──
  const clickDay = useCallback(
    (day: number) => {
      const dt: CalDate = { y: yr, m: mo, d: day };
      if (!picking || (rangeStart && rangeEnd)) {
        setRangeStart(dt);
        setRangeEnd(null);
        setPicking(true);
      } else {
        if (sameDay(dt, rangeStart)) {
          setPicking(false);
          return;
        }
        const [s, e] =
          dateValue(dt) > dateValue(rangeStart)
            ? [rangeStart!, dt]
            : [dt, rangeStart!];
        setRangeStart(s);
        setRangeEnd(e);
        setPicking(false);
        const key = `${s.y}-${s.m}-${s.d}__${e.y}-${e.m}-${e.d}`;
        setActiveKey(key);
      }
    },
    [picking, rangeStart, rangeEnd, yr, mo],
  );

  const saveNote = () => {
    if (!activeKey) return;
    setNotes((n) => ({ ...n, [activeKey]: noteText }));
  };

  const deleteNote = (key: string) => {
    setNotes((n) => {
      const x = { ...n };
      delete x[key];
      return x;
    });
    if (activeKey === key) {
      setActiveKey(null);
      setNoteText("");
    }
  };

  const clearSelection = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setPicking(false);
    setHoverDate(null);
    setActiveKey(null);
    setNoteText("");
  };

  // ── Derived state ──
  const dim = daysInMonth(yr, mo);
  const first = firstDayOfMonth(yr, mo);
  const totalCells = Math.ceil((first + dim) / 7) * 7;
  const cells: (number | null)[] = Array.from(
    { length: totalCells },
    (_, i) => {
      const d = i - first + 1;
      return d >= 1 && d <= dim ? d : null;
    },
  );

  const today: CalDate = {
    y: now.getFullYear(),
    m: now.getMonth(),
    d: now.getDate(),
  };
  const effEnd = picking && hoverDate ? hoverDate : rangeEnd;
  const [lo, hi] =
    rangeStart && effEnd
      ? dateValue(rangeStart) <= dateValue(effEnd)
        ? [rangeStart, effEnd]
        : [effEnd, rangeStart]
      : [rangeStart, null];

  const noteEntries = Object.entries(notes).filter(([, v]) => v?.trim());

  const C = getColors(dark);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Responsive style */}
      <style>{`
        .wc-lower { display: grid; grid-template-columns: clamp(120px, 19%, 200px) 1fr; }
        @media (max-width: 600px) {
          .wc-lower { grid-template-columns: 1fr !important; }
          .wc-notes { border-right: none !important; border-bottom: 1px solid ${C.brd} !important; }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          padding: "clamp(8px, 2.5vw, 24px)",
          fontFamily: "Georgia, serif",
          transition: "background .3s",
        }}
      >
        {/* ── Toolbar ── */}
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 11,
              letterSpacing: 2,
              color: C.mu,
              fontFamily: "sans-serif",
              textTransform: "uppercase",
            }}
          >
            Wall Calendar
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn
              dark={dark}
              active={showHolidays}
              onClick={() => setShowHolidays((v) => !v)}
            >
              {showHolidays ? "Hide Holidays" : "Show Holidays"}
            </Btn>
            <Btn dark={dark} onClick={() => setDark((v) => !v)}>
              {dark ? "☀ Light" : "◑ Dark"}
            </Btn>
          </div>
        </div>

        {/* ── Calendar card ── */}
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            background: C.card,
            borderRadius: 16,
            border: `1px solid ${C.brd}`,
            overflow: "hidden",
            boxShadow: dark
              ? "0 10px 40px rgba(0,0,0,.5)"
              : "0 8px 36px rgba(60,100,180,.10)",
          }}
        >
          {/* Spiral binding */}
          <div
            style={{
              background: C.card,
              borderBottom: `1px solid ${C.brd}`,
              display: "flex",
              justifyContent: "center",
              gap: "clamp(6px, 1.8vw, 16px)",
              padding: "8px 0 6px",
            }}
          >
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: "50%",
                  border: `2.5px solid ${C.coil}`,
                  background: "transparent",
                }}
              />
            ))}
          </div>

          {/* Hero image */}
          <div
            style={{
              position: "relative",
              height: "clamp(160px, 26vw, 260px)",
              overflow: "hidden",
              background: "#1a1a2e",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MONTH_IMAGES[mo]}
              alt={MONTHS[mo]}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                filter: C.hero,
                opacity: anim ? 0 : 1,
                transform: anim
                  ? `translateX(${animDir > 0 ? "-28px" : "28px"})`
                  : "none",
                transition: "opacity .25s ease, transform .25s ease",
              }}
            />
            {/* Diagonal accent overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(130deg, transparent 42%, ${C.ac}f2 42%)`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                padding: "16px 24px",
              }}
            >
              <div
                style={{
                  color: "rgba(255,255,255,.85)",
                  fontSize: "clamp(16px, 3.2vw, 32px)",
                  fontFamily: "Arial Black, sans-serif",
                  fontWeight: 900,
                  lineHeight: 1.1,
                }}
              >
                {yr}
              </div>
              <div
                style={{
                  color: "#fff",
                  fontSize: "clamp(24px, 4.8vw, 48px)",
                  fontFamily: "Arial Black, sans-serif",
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: -1,
                }}
              >
                {MONTHS[mo].toUpperCase()}
              </div>
            </div>
            <NavArrow side="left" onClick={() => navigate(-1)}>
              ‹
            </NavArrow>
            <NavArrow side="right" onClick={() => navigate(1)}>
              ›
            </NavArrow>
          </div>

          {/* Lower section */}
          <div className="wc-lower">
            {/* Notes sidebar */}
            <div
              className="wc-notes"
              style={{
                background: C.note,
                borderRight: `1px solid ${C.brd}`,
                padding: "16px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 9,
                minHeight: 300,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 1.8,
                  textTransform: "uppercase",
                  color: C.mu,
                  fontFamily: "sans-serif",
                  marginBottom: 1,
                }}
              >
                Notes
              </div>

              {rangeStart && rangeEnd ? (
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      color: C.ac,
                      fontFamily: "sans-serif",
                      fontWeight: "bold",
                      marginBottom: 5,
                    }}
                  >
                    {fmtDate(lo)} → {fmtDate(hi)}
                  </div>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onBlur={saveNote}
                    placeholder="Write a note for this range…"
                    style={{
                      width: "100%",
                      minHeight: 75,
                      background: "transparent",
                      border: "none",
                      borderBottom: `1.5px solid ${C.nl}`,
                      outline: "none",
                      resize: "none",
                      color: C.txt,
                      fontFamily: "Georgia, serif",
                      fontSize: 12,
                      lineHeight: 1.9,
                      padding: "3px 0",
                      boxSizing: "border-box",
                    }}
                  />
                  <Btn
                    dark={dark}
                    active
                    onClick={saveNote}
                    extraStyle={{
                      fontSize: 10,
                      padding: "3px 10px",
                      marginTop: 5,
                    }}
                  >
                    Save
                  </Btn>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 11,
                    color: C.mu,
                    fontFamily: "sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  Select a date range to add notes
                </div>
              )}

              {/* Saved notes */}
              {noteEntries.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                    marginTop: 2,
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      color: C.mu,
                      fontFamily: "sans-serif",
                    }}
                  >
                    Saved
                  </div>
                  {noteEntries.map(([key, val]) => (
                    <div
                      key={key}
                      style={{
                        background: C.card,
                        border: `1px solid ${C.brd}`,
                        borderRadius: 7,
                        padding: "6px 8px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          color: C.ac,
                          fontFamily: "sans-serif",
                          fontWeight: "bold",
                          marginBottom: 2,
                        }}
                      >
                        {fmtNoteKey(key)}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.txt,
                          fontFamily: "sans-serif",
                          lineHeight: 1.5,
                          wordBreak: "break-word",
                        }}
                      >
                        {val.slice(0, 60)}
                        {val.length > 60 ? "…" : ""}
                      </div>
                      <button
                        onClick={() => deleteNote(key)}
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 6,
                          background: "none",
                          border: "none",
                          color: C.mu,
                          cursor: "pointer",
                          fontSize: 14,
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

              {/* Decorative ruled lines */}
              <div style={{ marginTop: "auto" }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    style={{ borderBottom: `1px solid ${C.nl}`, height: 20 }}
                  />
                ))}
              </div>
            </div>

            {/* Calendar grid */}
            <div
              style={{
                padding: "16px clamp(8px, 2.5vw, 22px)",
                display: "flex",
                flexDirection: "column",
                gap: 9,
              }}
            >
              {/* Status bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  minHeight: 20,
                  flexWrap: "wrap",
                }}
              >
                {rangeStart ? (
                  <>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "sans-serif",
                        color: C.ac,
                        fontWeight: "bold",
                      }}
                    >
                      {fmtDate(rangeStart)}
                      {rangeEnd
                        ? ` → ${fmtDate(rangeEnd)}`
                        : picking
                          ? " → click end date"
                          : ""}
                    </span>
                    <Btn
                      dark={dark}
                      onClick={clearSelection}
                      extraStyle={{ fontSize: 10, padding: "2px 7px" }}
                    >
                      Clear
                    </Btn>
                  </>
                ) : (
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "sans-serif",
                      color: C.mu,
                    }}
                  >
                    Click a day to start selecting a range
                  </span>
                )}
              </div>

              {/* Weekday headers */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
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
                      color: i === 5 ? C.sat : i === 6 ? C.sun : C.mu,
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
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 2,
                  opacity: anim ? 0 : 1,
                  transform: anim
                    ? `translateX(${animDir > 0 ? "-18px" : "18px"})`
                    : "none",
                  transition: "opacity .25s ease, transform .25s ease",
                }}
                onMouseLeave={() => setHoverDate(null)}
              >
                {cells.map((day, i) => {
                  if (!day) return <div key={`e${i}`} />;

                  const dt: CalDate = { y: yr, m: mo, d: day };
                  const isToday = sameDay(dt, today);
                  const isStart = sameDay(dt, lo);
                  const isEnd = !!hi && sameDay(dt, hi);
                  const inRange =
                    !!lo &&
                    !!hi &&
                    dateValue(dt) > dateValue(lo) &&
                    dateValue(dt) < dateValue(hi);
                  const wi = i % 7;
                  const holiday = showHolidays
                    ? HOLIDAYS[`${mo}-${day}`]
                    : undefined;

                  const hasNote = noteEntries.some(([key]) => {
                    const [a, b] = key.split("__");
                    const s = keyToDate(a);
                    const e = keyToDate(b);
                    if (!s || !e) return false;
                    const v = dateValue(dt);
                    return v >= dateValue(s) && v <= dateValue(e);
                  });

                  let bg = "transparent";
                  let col = isToday
                    ? C.tod
                    : wi === 5
                      ? C.sat
                      : wi === 6
                        ? C.sun
                        : C.txt;
                  let br: string | number = 6;

                  if (isStart || isEnd) {
                    bg = C.ac;
                    col = "#fff";
                  } else if (inRange) {
                    bg = C.rng;
                    col = dark ? "#93c5fd" : "#1e3a5f";
                  }

                  if (isStart && hi) br = "6px 0 0 6px";
                  else if (isEnd) br = "0 6px 6px 0";
                  else if (inRange) br = 0;

                  return (
                    <div
                      key={day}
                      onClick={() => clickDay(day)}
                      onMouseEnter={() => {
                        if (picking) setHoverDate({ y: yr, m: mo, d: day });
                      }}
                      title={holiday}
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
                            borderRadius: 4,
                            border: `2px solid ${C.tod}`,
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
                      {holiday && (
                        <div
                          title={holiday}
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: isStart || isEnd ? "#fff" : C.hol,
                            margin: "2px auto 0",
                          }}
                        />
                      )}
                      {hasNote && !holiday && (
                        <div
                          style={{
                            width: 3,
                            height: 3,
                            borderRadius: "50%",
                            background:
                              isStart || isEnd ? "rgba(255,255,255,.7)" : C.ac,
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
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 2,
                }}
              >
                {[
                  { color: C.ac, label: "Start / End" },
                  {
                    color: C.rng,
                    label: "In range",
                    text: dark ? "#93c5fd" : "#1e3a5f",
                  },
                  { color: C.tod, label: "Today", ring: true },
                  ...(showHolidays
                    ? [{ color: C.hol, label: "Holiday", dot: true }]
                    : []),
                  { color: C.ac, label: "Has note", dot: true },
                ].map(({ color, label, ring, dot }) => (
                  <div
                    key={label}
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: ring ? "50%" : dot ? "50%" : 2,
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
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: "sans-serif",
                        color: C.mu,
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

        {/* Footer */}
        <div
          style={{
            maxWidth: 1040,
            margin: "8px auto 0",
            textAlign: "center",
            fontSize: 10,
            color: C.mu,
            fontFamily: "sans-serif",
          }}
        >
          Notes auto-save to localStorage · Holiday markers are illustrative
        </div>
      </div>
    </>
  );
}
