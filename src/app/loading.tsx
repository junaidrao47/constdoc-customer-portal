export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f3eb] text-[#203a3a]">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#e9b17c] border-t-[#203a3a]" />
        <p className="mt-4 text-sm font-medium">Loading your workspace...</p>
      </div>
    </main>
  );
}
