import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { EditorLayout } from '@/components/editor/EditorLayout'

interface EditorPageProps {
  params: Promise<{ owner: string; repo: string }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { owner, repo } = await params
  const session = await auth()
  if (!session?.accessToken) redirect('/')

  // 파일 로딩은 클라이언트에서 처리 (서버 404 오버레이 방지)
  return <EditorLayout owner={owner} repo={repo} />
}

export async function generateMetadata({ params }: EditorPageProps) {
  const { owner, repo } = await params
  return {
    title: `${owner}/${repo} — clasp`,
  }
}
