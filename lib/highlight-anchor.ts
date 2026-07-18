// 텍스트 인용 앵커 유틸 (순수 DOM, React 관리 밖). 본문은 dangerouslySetInnerHTML이므로
// 직접 DOM 조작으로 <mark> 래핑한다. 오프셋은 항상 container.textContent 기준으로 환산.

export type Anchor = { exact: string; prefix?: string; suffix?: string };

/** 경계점(node, nodeOffset)을 container.textContent 기준 전역 오프셋으로 환산 */
function pointToOffset(container: Node, node: Node, nodeOffset: number): number {
  if (node.nodeType === Node.TEXT_NODE) {
    let acc = 0;
    const w = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = w.nextNode())) {
      if (n === node) return acc + nodeOffset;
      acc += (n.nodeValue ?? "").length;
    }
    return acc + nodeOffset;
  }
  // element 경계: nodeOffset번째 자식의 시작 지점
  const children = node.childNodes;
  if (nodeOffset < children.length) {
    return nodeStartOffset(container, children[nodeOffset]);
  }
  return nodeStartOffset(container, node) + (node.textContent ?? "").length;
}

/** node의 시작이 container.textContent에서 갖는 전역 오프셋 */
function nodeStartOffset(container: Node, node: Node): number {
  let acc = 0;
  const w = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let n: Node | null;
  while ((n = w.nextNode())) {
    if (n === node || node.contains(n)) return acc;
    acc += (n.nodeValue ?? "").length;
  }
  return acc;
}

/** range의 시작/끝을 container.textContent 오프셋으로 환산 → exact/prefix/suffix 추출 */
export function extractAnchor(container: HTMLElement, range: Range): Anchor {
  const full = container.textContent ?? "";
  const a = pointToOffset(container, range.startContainer, range.startOffset);
  const b = pointToOffset(container, range.endContainer, range.endOffset);
  const [s, e] = a <= b ? [a, b] : [b, a];
  return {
    exact: full.slice(s, e),
    prefix: full.slice(Math.max(0, s - 40), s),
    suffix: full.slice(e, e + 40),
  };
}

/** 폴백 순서: prefix+exact+suffix → prefix+exact → exact+suffix → exact. 전부 실패 시 null */
export function locateAnchor(fullText: string, anchor: Anchor): [number, number] | null {
  const exact = anchor.exact;
  if (!exact) return null;
  const prefix = anchor.prefix ?? "";
  const suffix = anchor.suffix ?? "";
  const tries = [
    { needle: prefix + exact + suffix, pre: prefix.length },
    { needle: prefix + exact, pre: prefix.length },
    { needle: exact + suffix, pre: 0 },
    { needle: exact, pre: 0 },
  ];
  for (const t of tries) {
    if (!t.needle) continue;
    const idx = fullText.indexOf(t.needle);
    if (idx === -1) continue;
    const start = idx + t.pre;
    return [start, start + exact.length];
  }
  return null;
}

function insideHl(node: Node): boolean {
  const el = node.parentElement;
  return !!(el && el.closest("mark.hl"));
}

function wrapNode(textNode: Text, color: string, hid: number | string): void {
  const mark = document.createElement("mark");
  mark.className = `hl hl-${color}`;
  mark.setAttribute("data-hid", String(hid));
  const parent = textNode.parentNode;
  if (!parent) return;
  parent.insertBefore(mark, textNode);
  mark.appendChild(textNode);
}

/**
 * [start,end) 구간과 겹치는 텍스트 노드를 먼저 전부 수집한 뒤(walker 무효화 방지)
 * splitText로 경계를 자르고 각각 <mark>로 래핑. 이미 mark.hl 내부인 노드는 건너뜀.
 * 여러 mark가 같은 data-hid 공유.
 */
export function paintRange(
  container: HTMLElement,
  start: number,
  end: number,
  color: string,
  hid: number | string
): void {
  if (end <= start) return;
  const targets: { node: Text; s: number; e: number }[] = [];
  let acc = 0;
  const w = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let n: Node | null;
  while ((n = w.nextNode())) {
    const len = (n.nodeValue ?? "").length;
    const s = acc;
    const e = acc + len;
    acc = e;
    if (e <= start || s >= end) continue; // 겹침 없음
    if (insideHl(n)) continue; // 이미 하이라이트됨 → 중복 방지
    targets.push({ node: n as Text, s, e });
  }
  for (const { node, s } of targets) {
    let target = node;
    const localStart = Math.max(0, start - s);
    const localEnd = Math.min(node.data.length, end - s);
    if (localEnd <= localStart) continue;
    if (localStart > 0) target = target.splitText(localStart);
    if (localEnd - localStart < target.data.length) target.splitText(localEnd - localStart);
    wrapNode(target, color, hid);
  }
}

/** 해당(또는 전체) mark 언랩 + parent.normalize() */
export function unpaint(container: HTMLElement, hid?: number | string): void {
  const sel = hid == null ? "mark.hl" : `mark.hl[data-hid="${CSS.escape(String(hid))}"]`;
  const marks = Array.from(container.querySelectorAll<HTMLElement>(sel));
  const parents = new Set<Node>();
  for (const mark of marks) {
    const parent = mark.parentNode;
    if (!parent) continue;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parents.add(parent);
  }
  parents.forEach((p) => (p as Element).normalize());
}
