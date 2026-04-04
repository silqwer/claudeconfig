import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createOctokit, getUserReposWithClaudeConfig } from '@/lib/github'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const per_page = parseInt(searchParams.get('per_page') ?? '30')

  const octokit = createOctokit(session.accessToken)
  const repos = await getUserReposWithClaudeConfig(octokit, { page, per_page })

  return NextResponse.json(repos)
}
