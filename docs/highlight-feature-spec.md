# 형광펜 하이라이트 기능 — 구현 스펙 (Claude Code용)

이 문서를 `docs/highlight-feature-spec.md`로 저장하고, CLAUDE.md와 함께 읽은 뒤 구현할 것. 4단계 = 4커밋으로 나누고, 각 커밋 전에 `npm run build` 통과를 확인한다. 완료 후 push.

## 기능 요약

수업 모달 본문에서 문장을 드래그하면 선택 영역 바로 위에 팝오버(Variant A)가 떠서 형광펜 3색 중 하나로 저장할 수 있다. 저장된 하이라이트는 재방문 시 형광펜 질감으로 복원되고, 우하단 "형광펜 N" 버튼 → 사이드 서랍에서 모아보다가 클릭하면 해당 수업의 원문 위치로 점프한다. 하이라이트 클릭 시 삭제 툴팁이 뜬다.

## 확정된 기술 결정 (변경하지 말 것)

1. **앵커링**: DOM 참조/오프셋이 아니라 텍스트 인용 앵커 `{ exact, prefix(40자), suffix(40자) }`. 재탐색 폴백 순서: `prefix+exact+suffix` → `prefix+exact` → `exact+suffix` → `exact` 단독. 전부 실패하면 "위치 잃은 하이라이트": 본문에 칠하지 않되 데이터와 모아보기 노출은 유지. (이유: 수업 콘텐츠를 계속 수정하므로 오프셋 방식은 깨진다)
2. **렌더링**: CSS Custom Highlight API가 아니라 `<mark>` 래핑. (이유: `::highlight()`는 background-color 정도만 허용해 형광펜 그라디언트 질감 불가. 본문은 `dangerouslySetInnerHTML`이라 React 관리 밖 → 직접 DOM 조작 안전)
3. **저장 UX**: 낙관적 업데이트. 임시 음수 id(`-Date.now()`)로 즉시 칠하고, 서버 액션 성공 시 실제 id로 치환(state + `data-hid` 모두), 실패 시 롤백 + 토스트.
4. **색상**: `y | g | p` 3색. CSS 토큰: `--hl-y:255,216,74; --hl-g:126,211,161; --hl-p:255,158,146` 형광펜 질감(기울어진 그라디언트, box-decoration-break:clone):

```css
mark.hl{background:transparent;color:inherit;padding:.05em .18em;margin:0 -.06em;
  border-radius:3px;box-decoration-break:clone;cursor:pointer}
mark.hl-y{background-image:linear-gradient(100deg,rgba(var(--hl-y),0) .8%,
  rgba(var(--hl-y),.9) 2.6%,rgba(var(--hl-y),.55) 97%,rgba(var(--hl-y),0) 99%)}
/* g, p 동일 패턴 */
```

## 커밋 1 — 저장 계층

* `lib/schema.ts`: `highlight` 테이블 추가 `id serial PK, user_id text, day int, exact text, prefix text default '', suffix text default '', color text default 'y', created_at timestamptz default now()` + `(user_id, day)` 인덱스
* `lib/actions.ts`: `createHighlight(input) → {id}` (`.returning()` 사용), `deleteHighlight(id)` 검증: 로그인 필수, day 1~TOTAL_DAYS, exact 2~2000자, color ∈ {y,g,p}, 삭제는 본인 것만
* `lib/queries.ts`: `getHighlights(userId)` — 전체 로드 (페이지 진입 시 1회)
* 커밋 메시지: `feat: 하이라이트 저장 계층 — highlight 테이블 + 서버 액션`
* 로컬에서 `npm run db:push` 실행해 테이블 생성 확인

## 커밋 2 — 선택 팝오버 저장 (Variant A)

* 신규 `lib/highlight-anchor.ts` (순수 유틸, 4개 export):
  * `extractAnchor(container, range)`: TreeWalker(SHOW_TEXT)로 range의 시작/끝을 container.textContent 기준 오프셋으로 환산 → exact/prefix/suffix 추출
  * `locateAnchor(fullText, anchor)`: 위 폴백 순서로 `[start,end] | null`
  * `paintRange(container, start, end, color, hid)`: 구간과 겹치는 텍스트 노드들을 먼저 전부 수집한 뒤(walker 무효화 방지) `splitText`로 경계 자르고 각각 mark로 래핑. 이미 `mark.hl` 내부인 텍스트 노드는 건너뜀(중복 방지). 여러 mark가 같은 `data-hid` 공유
  * `unpaint(container, hid?)`: 해당(또는 전체) mark 언랩 + `parent.normalize()`
* `components/Course.tsx`:
  * props에 `initialHighlights: HighlightRow[]` 추가, `app/page.tsx`에서 `Promise.all([getCompletedDays, getHighlights])`로 로드해 전달
  * 본문 div에 `ref` + `onMouseUp`(선택 감지 → `setTimeout 0` 후 팝오버 위치 계산) + `onClick`(mark 클릭 → 삭제 툴팁)
  * 팝오버: `position:fixed`, 선택 rect의 `(left+width/2, top)`에서 `translate(-50%,-115%)`. 잉크색 배경 pill + "하이라이트" 라벨 + 3색 스와치. 스와치는 `onMouseDown={e=>e.preventDefault()}` (클릭 시 선택 해제 방지 — 빠뜨리면 저장이 안 됨)
  * 모달 닫을 때 팝오버/툴팁/pendingRange 정리
* 커밋: `feat: 선택 팝오버로 하이라이트 저장 (Variant A)`

## 커밋 3 — 재방문 복원

* `useEffect([openDay, hls])`: 모달 본문에 대해 `unpaint(전체)` → 해당 day의 하이라이트를 `locateAnchor`로 재탐색해 전부 다시 칠하기 (겹침/중복은 전체 리페인트로 해결)
* `focusHid` ref 준비: 값이 있으면 페인트 직후 해당 mark로 `scrollIntoView({behavior:'smooth',block:'center'})` + 플래시 애니메이션(`hl-flash`, 주황 글로우 2회)
* 커밋: `feat: 재방문 시 하이라이트 복원 렌더링`

## 커밋 4 — 모아보기 서랍 + 점프

* 하이라이트가 1개 이상일 때 우하단 고정 버튼 `형광펜 N` (형광펜 칩 아이콘 + 개수 강조색)
* 클릭 → 우측 사이드 서랍(스크림 포함, `min(360px, 92vw)`): day 오름차순 정렬, 각 항목에 `DAY N · 주제`(mono, 강조색) + 인용문(해당 색 mark, 90자 말줄임)
* 항목 클릭 → 서랍 닫고 `focusHid` 설정 후: 같은 day가 열려 있으면 리페인트만 트리거, 아니면 `openLesson(day)` → 커밋 3의 이펙트가 스크롤+플래시 수행
* 커밋: `feat: 하이라이트 모아보기 서랍 + 원문 점프`

## 수동 QA 체크리스트 (구현 후 브라우저에서)

* [ ] 여러 문단·`<b>`/`<code>` 경계를 걸친 드래그 저장 (cross-node 래핑)
* [ ] 새로고침 후 하이라이트 복원, 다른 day에는 안 칠해짐
* [ ] 같은 문장이 두 번 나올 때 올바른 쪽에 칠해짐 (prefix/suffix 덕분)
* [ ] 삭제 후 새로고침해도 안 살아남
* [ ] 서랍 점프: 닫힌 수업 → 열리며 스크롤+플래시 / 열린 수업 → 즉시 점프
* [ ] 팝오버가 뷰포트 상단 근처 선택에서 화면 밖으로 안 나감 (나가면 아래쪽 표시로 보정)
* [ ] 모바일 long-press 선택 동작 확인 (어색하면 별도 이슈로)

## 주의

* day 번호 체계와 Lesson 타입은 `lib/curriculum.ts`, `lib/lessons/types.ts`가 원천 — 건드리지 말 것
* 퀴즈 영역(.quiz)과 코드 블록도 하이라이트 허용 (제외하지 않기로 결정)
* 시크릿·env는 절대 커밋 금지
