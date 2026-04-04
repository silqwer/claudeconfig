import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { createOctokit, getClaudeFiles } from '@/lib/github'
import { EditorLayout } from '@/components/editor/EditorLayout'

interface EditorPageProps {
  params: Promise<{ owner: string; repo: string }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { owner, repo } = await params
  const session = await auth()
  if (!session?.accessToken) redirect('/')

  const octokit = createOctokit(session.accessToken)
  const files = await getClaudeFiles(octokit, owner, repo)

  return <EditorLayout owner={owner} repo={repo} initialFiles={files} />
}

export async function generateMetadata({ params }: EditorPageProps) {
  const { owner, repo } = await params
  return {
    title: `${owner}/${repo} — clasp`,
  }
}
