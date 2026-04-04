'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RepoCard } from './RepoCard'
import { RepoCardSkeleton } from './RepoCardSkeleton'
import type { GitHubRepo } from '@/types'

interface RepoGridProps {
  initialRepos: GitHubRepo[]
}

export function RepoGrid({ initialRepos }: RepoGridProps) {
  const [search, setSearch] = useState('')
  const [claudeOnly, setClaudeOnly] = useState(false)
  // 클라이언트에서 lazy하게 .claude 배지 체크
  const [claudeMap, setClaudeMap] = useState<Record<string, boolean>>({})

  const checkClaudeConfig = useCallback(async (repos: GitHubRepo[]) => {
    // 5개씩 배치로 처리 (rate limit 방지)
    const BATCH = 5
    for (let i = 0; i < repos.length; i += BATCH) {
      const batch = repos.slice(i, i + BATCH)
      await Promise.all(
        batch.map(async (repo) => {
          try {
            const res = await fetch(
              `/api/github/files?owner=${repo.owner.login}&repo=${repo.name}&checkOnly=true`
            )
            setClaudeMap((prev) => ({ ...prev, [repo.full_name]: res.ok }))
          } catch {
            setClaudeMap((prev) => ({ ...prev, [repo.full_name]: false }))
          }
        })
      )
    }
  }, [])

  useEffect(() => {
    checkClaudeConfig(initialRepos)
  }, [initialRepos, checkClaudeConfig])

  const reposWithBadge = useMemo(
    () =>
      initialRepos.map((repo) => ({
        ...repo,
        hasClaudeConfig: claudeMap[repo.full_name],
      })),
    [initialRepos, claudeMap]
  )

  const filtered = useMemo(() => {
    return reposWithBadge.filter((repo) => {
      const matchSearch =
        repo.name.toLowerCase().includes(search.toLowerCase()) ||
        (repo.description ?? '').toLowerCase().includes(search.toLowerCase())
      const matchClaude = claudeOnly ? repo.hasClaudeConfig === true : true
      return matchSearch && matchClaude
    })
  }, [reposWithBadge, search, claudeOnly])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="레포지토리 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={claudeOnly ? 'default' : 'outline'}
          size="default"
          onClick={() => setClaudeOnly((v) => !v)}
          className="gap-2 shrink-0"
        >
          <Filter className="w-4 h-4" />
          .claude 있음만
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">레포지토리를 찾을 수 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </div>
  )
}

export function RepoGridSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="h-9 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <RepoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
