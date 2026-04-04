import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="border-b bg-background/95 h-14 flex items-center px-4">
        <Skeleton className="h-5 w-48" />
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 border-r p-2 flex flex-col gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
        <div className="w-64 border-r p-2 flex flex-col gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full" />
          ))}
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  )
}
