import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createOctokit, getClaudeFiles, checkClaudeConfigExists } from '@/lib/github'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  const ref = searchParams.get('ref') ?? undefined
  const checkOnly = searchParams.get('checkOnly') === 'true'

  if (!owner || !repo) {
    return NextResponse.json({ error: 'owner and repo are required' }, { status: 400 })
  }

  const octokit = createOctokit(session.accessToken)

  // checkOnly 모드: .claude 존재 여부만 확인 (404면 404 반환)
  if (checkOnly) {
    const exists = await checkClaudeConfigExists(octokit, owner, repo)
    if (!exists) return new NextResponse(null, { status: 404 })
    return new NextResponse(null, { status: 200 })
  }

  const files = await getClaudeFiles(octokit, owner, repo, ref)
  return NextResponse.json(files)
}
