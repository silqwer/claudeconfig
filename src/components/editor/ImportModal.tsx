'use client'

import { useState, useCallback } from 'react'
import { Download, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useEditorStore } from '@/store/editor'
import { CURATED_REPOS } from '@/lib/import-repos'
import type { ClaudeFile } from '@/types'

type FetchState = 'idle' | 'loading' | 'loaded' | 'error'

export function ImportModal() {
  const {
    isImportModalOpen,
    closeImportModal,
    files,
    selectedSection,
    addFile,
    updateFileContent,
  } = useEditorStore()

  const [customRepo, setCustomRepo] = useState('')
  const [activeRepo, setActiveRepo] = useState<string>('')
  const [fetchState, setFetchState] = useState<FetchState>('idle')
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [fetchedFiles, setFetchedFiles] = useState<ClaudeFile[]>([])
  const [cache, setCache] = useState<Map<string, ClaudeFile[]>>(new Map())
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set())

  const existingPaths = new Set(files.map((f) => f.path))

  const sectionFilteredFiles = fetchedFiles.filter((f) => {
    if (selectedSection === 'rules') return f.scope === 'rules' || f.scope === 'repo'
    if (selectedSection === 'skills') return f.scope === 'skills'
    return false
  })

  const fetchRepo = useCallback(
    async (ownerRepo: string) => {
      const parts = ownerRepo.trim().split('/')
      if (parts.length !== 2 || !parts[0] || !parts[1]) return

      const [owner, repo] = parts

      if (cache.has(ownerRepo)) {
        setFetchedFiles(cache.get(ownerRepo)!)
        setActiveRepo(ownerRepo)
        setFetchState('loaded')
        setSelectedPaths(new Set())
        return
      }

      setFetchState('loading')
      setFetchError(null)
      setActiveRepo(ownerRepo)
      setSelectedPaths(new Set())

      try {
        const res = await fetch(`/api/github/files?owner=${owner}&repo=${repo}`)
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`)
        const data: ClaudeFile[] = await res.json()
        setCache((prev) => new Map(prev).set(ownerRepo, data))
        setFetchedFiles(data)
        setFetchState('loaded')
      } catch (e) {
        setFetchError(e instanceof Error ? e.message : 'Unknown error')
        setFetchState('error')
      }
    },
    [cache]
  )

  const toggleFile = (path: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev)
      next.has(path) ? next.delete(path) : next.add(path)
      return next
    })
  }

  const handleImport = () => {
    sectionFilteredFiles
      .filter((f) => selectedPaths.has(f.path))
      .forEach((file) => {
        if (existingPaths.has(file.path)) {
          updateFileContent(file.path, file.content)
        } else {
          addFile({ ...file, sha: '' })
        }
      })
    handleClose()
  }

  const handleClose = () => {
    closeImportModal()
    setCustomRepo('')
    setActiveRepo('')
    setFetchState('idle')
    setFetchError(null)
    setFetchedFiles([])
    setSelectedPaths(new Set())
  }

  const allSelected = sectionFilteredFiles.length > 0 && selectedPaths.size === sectionFilteredFiles.length
  const selectedCount = selectedPaths.size

  return (
    <Dialog open={isImportModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            레포에서 가져오기
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1 min-h-0">
          {/* Zone A: 큐레이션 레포 목록 */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              인기 레포
            </p>
            <ScrollArea className="h-36 rounded border bg-muted/30">
              <div className="p-1 flex flex-col gap-0.5">
                {CURATED_REPOS.map((r) => {
                  const key = `${r.owner}/${r.repo}`
                  return (
                    <button
                      key={key}
                      onClick={() => fetchRepo(key)}
                      className={cn(
                        'flex flex-col items-start px-2 py-1.5 rounded text-left w-full transition-colors',
                        activeRepo === key
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <span className="font-mono text-xs font-medium">{r.label}</span>
                      <span className="text-[10px] text-muted-foreground">{r.description}</span>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">또는 직접 입력</span>
            <Separator className="flex-1" />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="owner/repo"
              value={customRepo}
              onChange={(e) => setCustomRepo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchRepo(customRepo)
              }}
              className="font-mono text-sm h-8"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRepo(customRepo)}
              disabled={fetchState === 'loading' || !customRepo.includes('/')}
            >
              {fetchState === 'loading' && activeRepo === customRepo ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                '불러오기'
              )}
            </Button>
          </div>

          {/* Zone B: 파일 목록 */}
          {fetchState === 'loading' && (
            <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">파일 불러오는 중...</span>
            </div>
          )}

          {fetchState === 'error' && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {fetchError}
            </p>
          )}

          {fetchState === 'loaded' && sectionFilteredFiles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              <span className="font-mono">{activeRepo}</span>에{' '}
              {selectedSection} 파일이 없습니다
            </p>
          )}

          {fetchState === 'loaded' && sectionFilteredFiles.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  파일 ({sectionFilteredFiles.length}개)
                </p>
                <button
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() =>
                    setSelectedPaths(
                      allSelected
                        ? new Set()
                        : new Set(sectionFilteredFiles.map((f) => f.path))
                    )
                  }
                >
                  {allSelected ? '전체 해제' : '전체 선택'}
                </button>
              </div>
              <ScrollArea className="h-44 rounded border bg-muted/30">
                <div className="p-1 flex flex-col gap-0.5">
                  {sectionFilteredFiles.map((file) => {
                    const isDup = existingPaths.has(file.path)
                    return (
                      <label
                        key={file.path}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPaths.has(file.path)}
                          onChange={() => toggleFile(file.path)}
                          className="w-3.5 h-3.5 rounded accent-primary cursor-pointer shrink-0"
                        />
                        <span className="font-mono text-xs flex-1 truncate text-muted-foreground">
                          {file.path}
                        </span>
                        {isDup ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 h-4 text-orange-500 border-orange-500/30 shrink-0"
                          >
                            기존
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 shrink-0">
                            {file.scope}
                          </Badge>
                        )}
                      </label>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleImport} disabled={selectedCount === 0} className="gap-1.5">
            <Download className="w-4 h-4" />
            {selectedCount > 0 ? `${selectedCount}개 가져오기` : '가져오기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
