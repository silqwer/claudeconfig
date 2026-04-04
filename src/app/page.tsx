import { redirect } from 'next/navigation'
import { auth, signIn } from '@/auth'
import { Button } from '@/components/ui/button'

async function SignInButton() {
  return (
    <form
      action={async () => {
        'use server'
        await signIn('github', { redirectTo: '/repos' })
      }}
    >
      <Button type="submit" size="lg" className="gap-2 w-full">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
        GitHub으로 시작하기
      </Button>
    </form>
  )
}

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect('/repos')

  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen gap-8 p-8">
      <div className="flex flex-col items-center gap-3 text-center max-w-md">
        <h1 className="text-4xl font-bold tracking-tight">clasp</h1>
        <p className="text-muted-foreground text-base">
          GitHub 레포별 Claude Code 설정을 웹에서 편집하고 PR로 저장하세요.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="w-full rounded-xl border bg-card p-6 shadow-sm flex flex-col gap-4">
          <div className="space-y-1">
            <h2 className="font-semibold text-lg">시작하기</h2>
            <p className="text-sm text-muted-foreground">
              GitHub 계정으로 로그인하면 레포지토리의{' '}
              <code className="font-mono text-xs bg-muted px-1 rounded">.claude/</code> 설정을
              관리할 수 있습니다.
            </p>
          </div>
          <SignInButton />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center text-sm w-full">
          {[
            { icon: '📋', label: 'Rules 편집' },
            { icon: '🔧', label: 'Hooks 관리' },
            { icon: '🔀', label: 'PR로 저장' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50"
            >
              <span className="text-xl">{icon}</span>
              <span className="text-muted-foreground font-medium text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
