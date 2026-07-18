import { auth, signIn, signOut } from "@/auth";
import { getCompletedDays } from "@/lib/queries";
import Course from "@/components/Course";
import OneTap from "@/components/OneTap";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="wrap landing">
        <OneTap />
        <div className="eyebrow">EVERY MORNING · 08:00</div>
        <h1>
          CS 기본기 65일 <span className="thin">/ 하루 한 주제</span>
        </h1>
        <p className="sub">
          5년차 개발자를 위한 컴퓨터 사이언스 기본기 코스. 설명 + 도식 + 퀴즈로 매일 한 주제씩.
          로그인하면 진행 상황이 계정에 저장되어 어느 기기에서든 이어집니다.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button className="btn solid big" type="submit">
            Google로 시작하기
          </button>
        </form>
      </main>
    );
  }

  const completed = await getCompletedDays(session.user.id);

  return (
    <>
      <nav className="topbar">
        <span className="topbar-user">
          {session.user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="" width={26} height={26} />
          )}
          {session.user.name}
        </span>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button className="btn small" type="submit">
            로그아웃
          </button>
        </form>
      </nav>
      <Course initialDone={completed} />
    </>
  );
}
