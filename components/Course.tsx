"use client";

import { useMemo, useState, useTransition } from "react";
import { CURRICULUM, PHASE_STARTS, TOTAL_DAYS, dayInfo, locate } from "@/lib/curriculum";
import { LESSONS } from "@/lib/lessons";
import { toggleDay } from "@/lib/actions";

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

export default function Course({ initialDone }: { initialDone: number[] }) {
  const [done, setDone] = useState<Set<number>>(() => new Set(initialDone));
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [openPhases, setOpenPhases] = useState<Set<number> | null>(null); // null = auto(오늘이 속한 phase)
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [toast, setToast] = useState("");
  const [, startTransition] = useTransition();

  const today = useMemo(() => {
    for (let i = 1; i <= TOTAL_DAYS; i++) if (!done.has(i)) return i;
    return null;
  }, [done]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1600);
  }

  function toggle(n: number) {
    const next = !done.has(n);
    setDone((prev) => {
      const s = new Set(prev);
      if (next) s.add(n);
      else s.delete(n);
      return s;
    });
    startTransition(() => {
      toggleDay(n, next).catch(() => {
        // 실패 시 롤백
        setDone((prev) => {
          const s = new Set(prev);
          if (next) s.delete(n);
          else s.add(n);
          return s;
        });
        showToast("저장 실패 — 네트워크를 확인해 주세요");
      });
    });
  }

  function openLesson(n: number) {
    setAnswers({});
    setOpenDay(n);
    document.body.style.overflow = "hidden";
  }
  function closeLesson() {
    setOpenDay(null);
    document.body.style.overflow = "";
  }
  function markDone() {
    if (openDay !== null && !done.has(openDay)) {
      toggle(openDay);
      showToast(`Day ${openDay} 완료!`);
    }
    closeLesson();
  }
  function markUndone() {
    if (openDay !== null && done.has(openDay)) toggle(openDay);
    closeLesson();
  }

  function isPhaseOpen(pi: number) {
    if (openPhases) return openPhases.has(pi);
    const start = PHASE_STARTS[pi];
    return today !== null && today >= start && today < start + CURRICULUM[pi].days.length;
  }
  function togglePhase(pi: number) {
    setOpenPhases((prev) => {
      const base = prev ?? new Set(CURRICULUM.map((_, i) => i).filter((i) => isPhaseOpen(i)));
      const s = new Set(base);
      if (s.has(pi)) s.delete(pi);
      else s.add(pi);
      return s;
    });
  }

  const lesson = openDay !== null ? LESSONS[openDay] : undefined;
  const openInfo = openDay !== null ? dayInfo(openDay) : null;

  return (
    <main className="wrap">
      <header>
        <div className="eyebrow">EVERY MORNING · 08:00</div>
        <h1>
          CS 기본기 {TOTAL_DAYS}일 <span className="thin">/ 하루 한 주제</span>
        </h1>
        <p className="sub">
          항목을 누르면 수업(설명 + 도식 + 퀴즈)이 열리고, 체크박스나 그리드 셀을 누르면 완료
          처리됩니다. 진행 상황은 계정에 저장됩니다.
        </p>
      </header>

      <section className="map-card" aria-label="진행 현황">
        <div className="map-head">
          <span className="map-title">MEMORY MAP — 0x01…0x{TOTAL_DAYS.toString(16).toUpperCase()}</span>
          <span className="counter">
            <b>{done.size}</b> / {TOTAL_DAYS} 완료
          </span>
        </div>
        <div className="grid" role="group" aria-label="진행 그리드">
          {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`cell${done.has(n) ? " done" : ""}${n === today ? " today" : ""}`}
              aria-label={`Day ${n} ${dayInfo(n).topic}${done.has(n) ? " 완료" : ""} — 눌러서 완료 토글`}
              onClick={() => toggle(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="legend">
          <span><i className="dot dot-done" />완료</span>
          <span><i className="dot dot-todo" />미완료</span>
          <span><i className="dot dot-today" />오늘</span>
        </div>
      </section>

      <section className="today-card">
        <div>
          <div className="today-label">TODAY&apos;S LESSON</div>
          <div className="today-topic">
            {today ? `Day ${today} — ${dayInfo(today).topic}` : `${TOTAL_DAYS}일 완주! 🎉`}
          </div>
        </div>
        {today && (
          <button className="btn solid" onClick={() => openLesson(today)}>
            오늘 수업 열기
          </button>
        )}
      </section>

      <div>
        {CURRICULUM.map((ph, pi) => {
          const start = PHASE_STARTS[pi];
          const doneInPhase = ph.days.filter((_, di) => done.has(start + di)).length;
          const open = isPhaseOpen(pi);
          return (
            <section className={`phase${open ? " open" : ""}`} key={ph.code}>
              <button className="phase-head" onClick={() => togglePhase(pi)}>
                <span className="p-code">{ph.code}</span>
                <span className="p-name">{ph.name}</span>
                <span className="p-progress">{doneInPhase}/{ph.days.length}</span>
                <span className="chev">▶</span>
              </button>
              <div className="days">
                {ph.days.map((d, di) => {
                  const n = start + di;
                  return (
                    <div
                      key={n}
                      role="button"
                      tabIndex={0}
                      className={`day${done.has(n) ? " done" : ""}${d.tag ? " focus-week" : ""}`}
                      onClick={() => openLesson(n)}
                      onKeyDown={(e) => e.key === "Enter" && openLesson(n)}
                    >
                      <span className="d-num">Day {n}</span>
                      <span
                        className="d-check"
                        title="완료 토글"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(n);
                        }}
                      >
                        {done.has(n) ? "✓" : ""}
                      </span>
                      <span className="d-body">
                        <span className="d-topic">
                          {d.topic}
                          {d.tag && <span className="d-tag">{d.tag}</span>}
                          {LESSONS[n] && <span className="d-ready">READY</span>}
                        </span>
                        <br />
                        <span className="d-desc">{d.desc}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <section className="howto">
        <b>매일 아침 루틴</b> — 휴대폰 알람이나 캘린더 반복 일정(매일 08:00)에 이 페이지 주소를
        넣어두세요. 밀린 날은 시간이 날 때 한 번에 여러 개를 이어서 클리어하면 됩니다. 수업 내용이
        아직 없는 날은 Claude에게 <code>Phase N 수업 내용 채워줘</code>라고 요청하세요.
      </section>

      {openDay !== null && openInfo && (
        <div className="overlay show" onClick={(e) => e.target === e.currentTarget && closeLesson()}>
          <div className="lesson">
            <button className="close" aria-label="닫기" onClick={closeLesson}>
              ✕
            </button>
            <div className="l-day">
              DAY {openDay}
              {openInfo.tag ? ` · ${openInfo.tag}` : ""}
            </div>
            <h2>{openInfo.topic}</h2>
            {lesson ? (
              <>
                <div dangerouslySetInnerHTML={{ __html: lesson.body }} />
                {lesson.svg && (
                  <div className="fig" dangerouslySetInnerHTML={{ __html: lesson.svg }} />
                )}
                {lesson.videos && lesson.videos.length > 0 && (
                  <>
                    <h3>추천 강의</h3>
                    <ul className="vids">
                      {lesson.videos.map((v, vi) => (
                        <li key={vi}>
                          <a href={v.url} target="_blank" rel="noreferrer">
                            {v.title}
                          </a>
                          <span className="v-ch"> — {v.channel}</span>
                          {v.note && <span className="v-note"> · {v.note}</span>}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <h3>퀴즈로 확인</h3>
                {lesson.quiz.map((qz, qi) => {
                  const chosen = answers[qi];
                  const answered = chosen !== undefined;
                  return (
                    <div className={`quiz${answered ? " answered" : ""}`} key={qi}>
                      <div className="q" dangerouslySetInnerHTML={{ __html: `Q${qi + 1}. ${qz.q}` }} />
                      <div className="opts">
                        {qz.opts.map((o, oi) => (
                          <button
                            key={oi}
                            className={`opt${answered && oi === qz.ans
                                ? " correct"
                                : answered && oi === chosen
                                  ? " wrong"
                                  : ""
                              }`}
                            onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                            dangerouslySetInnerHTML={{
                              __html: `${String.fromCharCode(9312 + oi)} ${o}`,
                            }}
                          />
                        ))}
                      </div>
                      {answered && (
                        <div className="why" dangerouslySetInnerHTML={{ __html: qz.why }} />
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="placeholder">
                이 수업 내용은 아직 준비되지 않았습니다. Claude에게{" "}
                <code>Phase {ROMAN[locate(openDay)[0]]} 수업 내용 채워줘</code>라고 요청하면 설명 ·
                도식 · 퀴즈가 추가됩니다. 또는 <code>Day {openDay} 시작</code>으로 대화형 수업을 바로
                진행할 수도 있습니다.
              </div>
            )}
            <div className="l-foot">
              {done.has(openDay) ? (
                <button className="btn" onClick={markUndone}>
                  완료 취소
                </button>
              ) : (
                <button className="btn solid" onClick={markDone}>
                  완료하고 닫기 ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast show">{toast}</div>}
    </main>
  );
}
