import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function RepoCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-3 w-16" />
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-3/4" />
      </CardContent>
    </Card>
  )
}
