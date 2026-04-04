import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Lock, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import type { GitHubRepo } from '@/types'

interface RepoCardProps {
  repo: GitHubRepo
}

export function RepoCard({ repo }: RepoCardProps) {
  const updatedAt = repo.updated_at
    ? formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })
    : null

  return (
    <Link href={`/${repo.owner.login}/${repo.name}`}>
      <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {repo.private && (
                <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              )}
              <span className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                {repo.name}
              </span>
            </div>
            {repo.hasClaudeConfig && (
              <Badge
                variant="secondary"
                className="shrink-0 gap-1 text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              >
                <FileText className="w-3 h-3" />
                .claude ✓
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{repo.owner.login}</p>
        </CardHeader>
        <CardContent className="pt-0">
          {repo.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{repo.description}</p>
          )}
          {updatedAt && (
            <p className="text-xs text-muted-foreground/60">업데이트 {updatedAt}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
