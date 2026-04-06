'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, GitPullRequest } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Sidebar } from './Sidebar'
import { FileList } from './FileList'
import { EditorPanel } from './EditorPanel'
import { PRModal } from './PRModal'
import { ImportModal } from './ImportModal'
import { useEditorStore } from '@/store/editor'
import type { ClaudeFile } from '@/types'

interface EditorLayoutProps {
  owner: string
  repo: string
}

export function EditorLayout({ owner, repo }: EditorLayoutProps) {
  const { initialize, isDirty, openPRModal, dirtyFiles } = useEditorStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/github/files?owner=${owner}&repo=${repo}`)
        const files: ClaudeFile[] = res.ok ? await res.json() : []
        initialize(owner, repo, files)
      } catch {
        initialize(owner, repo, [])
      } finally {
        setIsLoading(false)
      }
    }
    fetchFiles()
  }, [owner, repo, initialize])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur shrink-0 z-10">
        <div className="h-14 px-4 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1 text-sm min-w-0">
            <Link href="/repos" className="text-muted-foreground hover:text-foreground transition-colors">
              clasp
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            <Link href="/repos" className="text-muted-foreground hover:text-foreground transition-colors truncate">
              {owner}
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="font-semibold truncate">{repo}</span>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {isDirty() && (
              <Badge variant="outline" className="text-orange-500 border-orange-500/30 text-xs">
                {dirtyFiles.size}개 변경됨
              </Badge>
            )}
            <Button onClick={openPRModal} disabled={!isDirty()} size="sm" className="gap-1.5">
              <GitPullRequest className="w-4 h-4" />
              PR 생성
            </Button>
          </div>
        </div>
      </header>

      {/* Main - 3 column layout */}
      {isLoading ? (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 border-r p-2 flex flex-col gap-1">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
          <div className="w-64 border-r p-2 flex flex-col gap-1">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}
          </div>
          <div className="flex-1 p-4">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <FileList />
          <EditorPanel />
        </div>
      )}

      <PRModal />
      <ImportModal />
    </div>
  )
}
