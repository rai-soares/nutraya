export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl shadow-slate-950/40">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-300">
          Nutraya
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Initial backend foundation is ready.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-300">
          This project currently exposes API routes for users and macro goals
          using Next.js route handlers, Prisma, and PostgreSQL.
        </p>
      </div>
    </main>
  );
}
