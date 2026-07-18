export type Quiz = { q: string; opts: string[]; ans: number; why: string };
export type Lesson = { body: string; svg?: string; quiz: Quiz[] };
