import type { Lesson } from "./types";
import { PHASE1 } from "./phase1";

// Phase가 추가될 때마다 여기서 병합: { ...PHASE1, ...PHASE2, ... }
export const LESSONS: Record<number, Lesson> = { ...PHASE1 };
export type { Lesson, Quiz } from "./types";
