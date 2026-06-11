export default function RootLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center bg-gray-50/80">
      <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-[#1A73E8]/25 border-t-[#1A73E8]"
          aria-hidden
        />
        <span className="text-sm font-medium text-[#0C1A35]/60">Loading…</span>
      </div>
    </div>
  );
}
