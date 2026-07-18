export type DayEntry = { topic: string; desc: string; tag?: string };
export type Phase = { code: string; name: string; days: DayEntry[] };

export const CURRICULUM: Phase[] = [
  {
    code: "PHASE I",
    name: "컴퓨터 구조 · 운영체제",
    days: [
      { topic: "CPU 동작 원리와 명령어 사이클", desc: "fetch–decode–execute, 레지스터, 파이프라이닝" },
      { topic: "메모리 계층과 캐시", desc: "L1/L2/L3, 지역성(locality), 캐시 미스 비용" },
      { topic: "프로세스 vs 스레드", desc: "주소 공간, 스택/힙 공유, 멀티프로세싱 대비" },
      { topic: "CPU 스케줄링", desc: "FCFS, RR, MLFQ — 공정성과 응답성의 트레이드오프" },
      { topic: "가상 메모리와 페이징", desc: "페이지 테이블, TLB, 페이지 폴트" },
      { topic: "동기화 프리미티브", desc: "뮤텍스, 세마포어, 경쟁 상태(race condition)" },
      { topic: "데드락", desc: "4가지 필요조건, 예방·회피·탐지 전략" },
      { topic: "컨텍스트 스위칭", desc: "비용의 실체와 스레드 풀이 존재하는 이유" },
      { topic: "시스템 콜과 커널 모드", desc: "유저/커널 경계, 인터럽트" },
      { topic: "I/O 모델", desc: "blocking vs non-blocking, epoll/kqueue — Node의 뿌리" },
    ],
  },
  {
    code: "PHASE II",
    name: "자료구조 · 알고리즘 + 집중 블록",
    days: [
      { topic: "복잡도 I — Big-O의 정확한 정의", desc: "O·Ω·Θ의 수학적 의미, 상수·저차항을 버리는 근거, 'O = 최악'이라는 오해 바로잡기", tag: "BIG-O" },
      { topic: "복잡도 II — 코드에서 복잡도 읽기", desc: "루프 패턴 카탈로그: 중첩, 절반 감소(log), 투 포인터, 재귀 점화식과 마스터 정리 기초", tag: "BIG-O" },
      { topic: "복잡도 III — 상환 분석과 실전 감각", desc: "동적 배열 push의 amortized O(1), 평균 vs 최악, 공간 복잡도, 작은 n에서 상수가 이기는 경우", tag: "BIG-O" },
      { topic: "배열 vs 연결 리스트", desc: "캐시 친화성 관점에서 다시 보기" },
      { topic: "해시 테이블", desc: "해시 함수, 충돌 해결, 리사이징, V8의 객체 내부" },
      { topic: "트리와 균형", desc: "BST, AVL/Red-Black — 왜 균형이 필요한가" },
      { topic: "힙과 우선순위 큐", desc: "완전 이진 트리, heapify, 타이머 구현" },
      { topic: "그래프 표현과 순회", desc: "인접 리스트/행렬, BFS·DFS 사용처 구분" },
      { topic: "최단 경로", desc: "다익스트라의 동작과 한계(음수 가중치)" },
      { topic: "정렬 I — 기초 정렬과 불변량", desc: "bubble·selection·insertion, 루프 불변량, 안정성 개념", tag: "SORT" },
      { topic: "정렬 II — 분할 정복 정렬", desc: "merge(안정·O(n) 공간) vs quick(파티셔닝·피벗 전략·최악 케이스)", tag: "SORT" },
      { topic: "정렬 III — 힙 정렬과 이론적 하한", desc: "in-place heapsort, 결정 트리로 보는 비교 정렬의 Ω(n log n)", tag: "SORT" },
      { topic: "정렬 IV — 비교 없는 정렬과 하이브리드", desc: "counting·radix·bucket, Timsort의 run 병합, introsort, V8 sort", tag: "SORT" },
      { topic: "이진 탐색과 변형", desc: "lower/upper bound, 매개변수 탐색" },
      { topic: "동적 프로그래밍", desc: "중복 부분문제, 메모이제이션 vs 타뷸레이션" },
    ],
  },
  {
    code: "PHASE III",
    name: "네트워크",
    days: [
      { topic: "OSI 7계층과 TCP/IP", desc: "계층화의 의미, 각 계층의 실제 프로토콜" },
      { topic: "TCP 핵심", desc: "3-way handshake, 흐름 제어, 혼잡 제어" },
      { topic: "TCP vs UDP", desc: "신뢰성 비용, QUIC이 UDP를 택한 이유" },
      { topic: "HTTP의 진화", desc: "1.1 → 2(멀티플렉싱) → 3(QUIC)" },
      { topic: "HTTPS와 TLS", desc: "핸드셰이크, 대칭/비대칭 암호, 인증서 체인" },
      { topic: "DNS", desc: "재귀/반복 질의, 캐싱, 레코드 타입" },
      { topic: "인증 상태 관리", desc: "쿠키, 세션, JWT — 각각의 트레이드오프" },
      { topic: "로드밸런싱과 프록시", desc: "L4 vs L7, 리버스 프록시, 헬스 체크" },
      { topic: "CDN과 엣지 캐싱", desc: "캐시 무효화, Next.js ISR과의 연결" },
      { topic: "실시간 통신", desc: "폴링, SSE, WebSocket 비교" },
    ],
  },
  {
    code: "PHASE IV",
    name: "데이터베이스",
    days: [
      { topic: "쿼리의 일생", desc: "파서 → 옵티마이저 → 실행기, 버퍼 풀" },
      { topic: "인덱스와 B+트리", desc: "왜 B+트리인가, 복합 인덱스와 선두 컬럼" },
      { topic: "트랜잭션과 ACID", desc: "각 속성이 실제로 보장하는 것" },
      { topic: "격리 수준", desc: "dirty/non-repeatable/phantom read와 4단계" },
      { topic: "락과 MVCC", desc: "비관적/낙관적 락, 스냅샷 격리" },
      { topic: "정규화와 반정규화", desc: "이상 현상, 언제 깨는 것이 맞는가" },
      { topic: "실행 계획 읽기", desc: "EXPLAIN, 인덱스를 타지 않는 쿼리 패턴" },
      { topic: "NoSQL 유형", desc: "문서/키값/컬럼/그래프, 선택 기준" },
      { topic: "레플리케이션", desc: "동기/비동기 복제, 복제 지연과 읽기 일관성" },
      { topic: "파티셔닝과 샤딩", desc: "수평/수직 분할, 샤드 키 설계" },
    ],
  },
  {
    code: "PHASE V",
    name: "분산 시스템",
    days: [
      { topic: "CAP과 PACELC", desc: "분할 상황에서의 선택, 평상시의 선택" },
      { topic: "일관성 모델", desc: "강한 일관성 vs 최종 일관성, 실무 사례" },
      { topic: "합의 알고리즘", desc: "Raft의 리더 선출과 로그 복제(개념)" },
      { topic: "분산 트랜잭션", desc: "2PC의 한계, Saga 패턴" },
      { topic: "메시지 큐", desc: "at-least-once, 멱등성, 이벤트 기반 아키텍처" },
      { topic: "캐싱 전략", desc: "cache-aside, write-through, 무효화 문제" },
      { topic: "분산 환경의 시간", desc: "Lamport clock, 분산 ID 생성(Snowflake)" },
      { topic: "장애 격리", desc: "서킷 브레이커, 재시도와 백오프, 타임아웃" },
      { topic: "관측성", desc: "로그·메트릭·트레이싱, 분산 추적" },
      { topic: "시스템 설계 종합", desc: "URL 단축기를 처음부터 설계해 보기" },
    ],
  },
  {
    code: "PHASE VI",
    name: "언어 · 런타임",
    days: [
      { topic: "컴파일러 vs 인터프리터", desc: "AST, 바이트코드, JIT의 동작" },
      { topic: "가비지 컬렉션", desc: "mark-and-sweep, 세대별 GC, V8의 GC" },
      { topic: "V8 내부", desc: "히든 클래스, 인라인 캐싱, 최적화/역최적화" },
      { topic: "이벤트 루프 심화", desc: "태스크 vs 마이크로태스크, Node의 페이즈" },
      { topic: "동시성 모델 비교", desc: "스레드, 액터, CSP, async/await" },
      { topic: "메모리 모델과 누수", desc: "JS에서 누수가 생기는 패턴, WeakRef" },
      { topic: "타입 시스템 이론", desc: "구조적 vs 명목적, 공변/반공변 — TS의 근거" },
      { topic: "정규표현식 엔진", desc: "백트래킹, ReDoS가 생기는 이유" },
      { topic: "인코딩과 수 표현", desc: "유니코드/UTF-8, IEEE 754 부동소수점" },
      { topic: "웹 보안 기초", desc: "XSS, CSRF, SQL 인젝션, 비밀번호 해싱" },
    ],
  },
];

export const PHASE_STARTS: number[] = (() => {
  const s: number[] = []; let acc = 1;
  for (const p of CURRICULUM) { s.push(acc); acc += p.days.length; }
  return s;
})();

export const TOTAL_DAYS = CURRICULUM.reduce((a, p) => a + p.days.length, 0);

export function locate(n: number): [number, number] {
  for (let i = CURRICULUM.length - 1; i >= 0; i--) if (n >= PHASE_STARTS[i]) return [i, n - PHASE_STARTS[i]];
  return [0, 0];
}
export function dayInfo(n: number) { const [p, d] = locate(n); return CURRICULUM[p].days[d]; }
