'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, GitPullRequest } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sidebar } from './Sidebar'
import { FileList } from './FileList'
import { EditorPanel } from './EditorPanel'
import { PRModal } from './PRModal'
import { useEditorStore } from '@/store/editor'
import type { ClaudeFile } from '@/types'

interface EditorLayoutProps {
  owner: string
  repo: string
  initialFiles: ClaudeFile[]
}

export function EditorLayout({ owner, repo, initialFiles }: EditorLayoutProps) {
  const { initialize, isDirty, openPRModal, dirtyFiles } = useEditorStore()

  useEffect(() => {
    initialize(owner, repo, initialFiles)
  }, [owner, repo, initialFiles, initialize])

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
            <Button
              onClick={openPRModal}
              disabled={!isDirty()}
              size="sm"
              className="gap-1.5"
            >
              <GitPullRequest className="w-4 h-4" />
              PR 생성
            </Button>
          </div>
        </div>
      </header>

      {/* Main - 3 column layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <FileList />
        <EditorPanel />
      </div>

      <PRModal />
    </div>
  )
}
