import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createOctokit, createPR } from '@/lib/github'
import type { CreatePRRequest } from '@/types'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: CreatePRRequest = await request.json()

  if (!body.owner || !body.repo || !body.branch || !body.title || !body.files?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const octokit = createOctokit(session.accessToken)

  const result = await createPR(octokit, body)
  return NextResponse.json(result)
}
