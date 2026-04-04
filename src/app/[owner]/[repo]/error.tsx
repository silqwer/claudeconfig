'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h2 className="text-lg font-semibold">오류가 발생했습니다</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={reset}>
          다시 시도
        </Button>
        <Link href="/repos" className="inline-flex items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground h-8 gap-1.5 px-2.5 text-sm font-medium transition-all hover:bg-primary/80">
          레포 목록으로
        </Link>
      </div>
    </div>
  )
}
