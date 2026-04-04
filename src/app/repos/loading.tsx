import { RepoGridSkeleton } from '@/components/repos/RepoGrid'

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
          <span className="font-bold text-lg tracking-tight">clasp</span>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <div className="h-7 w-40 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <RepoGridSkeleton />
      </main>
    </div>
  )
}
