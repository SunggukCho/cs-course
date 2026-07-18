export type Quiz = { q: string; opts: string[]; ans: number; why: string };
export type Video = { title: string; channel: string; url: string; note?: string };
export type Lesson = { body: string; svg?: string; quiz: Quiz[]; videos?: Video[] };
