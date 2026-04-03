export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950">
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-4 py-1.5 text-sm text-brand-400 ring-1 ring-brand-500/20 mb-8">
          🌿 Cannabis Training Platform
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Train smarter.<br />
          <span className="text-brand-400">Certify faster.</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-400 max-w-2xl">
          The modern training and certification platform for cannabis dispensaries. Keep your team compliant, knowledgeable, and confident.
        </p>
        <div className="mt-10 flex items-center gap-x-6">
          <a href="/signup" className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors">
            Start Free Trial
          </a>
          <a href="/pricing" className="text-sm font-semibold leading-6 text-gray-300">
            View pricing <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </main>
  );
}
