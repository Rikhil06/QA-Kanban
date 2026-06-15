import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] px-4 text-center">
      <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4">404</p>
      <h1 className="text-white text-3xl font-bold mb-3">Page not found</h1>
      <p className="text-white/50 text-sm mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
