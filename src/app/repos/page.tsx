import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth, signOut } from '@/auth'
import { createOctokit, getUserRepos } from '@/lib/github'
import { RepoGrid } from '@/components/repos/RepoGrid'
import { Button } from '@/components/ui/button'

export default async function ReposPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/')

  const octokit = createOctokit(session.accessToken)
  const repos = await getUserRepos(octokit, { per_page: 50 })

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/repos" className="font-bold text-lg tracking-tight">
            clasp
          </Link>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
            }}
          >
            <Button variant="ghost" size="sm" type="submit">
              로그아웃
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">레포지토리 선택</h1>
          <p className="text-muted-foreground text-sm mt-1">
            편집할 레포지토리를 선택하세요. <span className="text-emerald-600 dark:text-emerald-400 font-medium">.claude ✓</span> 배지가 있는 레포에는 이미 설정이 있습니다.
          </p>
        </div>
        <RepoGrid initialRepos={repos} />
      </main>
    </div>
  )
}
