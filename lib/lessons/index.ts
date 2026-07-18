import type { Lesson } from "./types";
import { PHASE1 } from "./phase1";
import { PHASE2 } from "./phase2";

// Phase가 추가될 때마다 여기서 병합
export const LESSONS: Record<number, Lesson> = { ...PHASE1, ...PHASE2 };
export type { Lesson, Quiz, Video } from "./types";
