export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-3">
          <span className="text-sm font-bold text-brand-700">ProveIt</span>
          <span className="text-xs text-gray-500 ml-2">Verified Portfolio</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
