import { Octokit } from '@octokit/rest'
import pLimit from 'p-limit'
import type { ClaudeFile, CreatePRRequest, CreatePRResponse, GitHubRepo } from '@/types'

export function createOctokit(accessToken: string): Octokit {
  return new Octokit({ auth: accessToken })
}

export async function getUserRepos(
  octokit: Octokit,
  options: { page?: number; per_page?: number; sort?: 'updated' | 'pushed' | 'created' | 'full_name' } = {}
): Promise<GitHubRepo[]> {
  const { page = 1, per_page = 30, sort = 'updated' } = options
  const { data } = await octokit.repos.listForAuthenticatedUser({
    page,
    per_page,
    sort,
    visibility: 'all',
  })
  return data as GitHubRepo[]
}

export async function checkClaudeConfigExists(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<boolean> {
  try {
    await octokit.repos.getContent({ owner, repo, path: '.claude' })
    return true
  } catch {
    return false
  }
}

export async function getUserReposWithClaudeConfig(
  octokit: Octokit,
  options: { page?: number; per_page?: number } = {}
): Promise<GitHubRepo[]> {
  const repos = await getUserRepos(octokit, options)
  const limit = pLimit(5)
  const results = await Promise.all(
    repos.map((repo) =>
      limit(async () => ({
        ...repo,
        hasClaudeConfig: await checkClaudeConfigExists(octokit, repo.owner.login, repo.name),
      }))
    )
  )
  return results
}

type GitHubContent = {
  type: string
  path: string
  name: string
  sha: string
  content?: string
  encoding?: string
}

async function getFilesRecursive(
  octokit: Octokit,
  owner: string,
  repo: string,
  dirPath: string,
  ref?: string
): Promise<ClaudeFile[]> {
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path: dirPath,
    ...(ref ? { ref } : {}),
  })

  const items = Array.isArray(data) ? data : [data]
  const files: ClaudeFile[] = []

  for (const item of items as GitHubContent[]) {
    if (item.type === 'dir') {
      const nested = await getFilesRecursive(octokit, owner, repo, item.path, ref)
      files.push(...nested)
    } else if (item.type === 'file') {
      const { data: fileData } = await octokit.repos.getContent({
        owner,
        repo,
        path: item.path,
        ...(ref ? { ref } : {}),
      })
      const file = fileData as GitHubContent
      const content =
        file.encoding === 'base64' && file.content
          ? Buffer.from(file.content, 'base64').toString('utf-8')
          : (file.content ?? '')
      files.push({
        path: item.path,
        name: item.name,
        sha: item.sha,
        content,
        scope: inferScope(item.path),
      })
    }
  }

  return files
}

function inferScope(path: string): ClaudeFile['scope'] {
  if (path.includes('/.claude/rules/') || path.match(/\.claude\/rules\//)) return 'rules'
  if (path.includes('/.claude/skills/') || path.match(/\.claude\/skills\//)) return 'skills'
  if (path.endsWith('settings.json')) return 'settings'
  if (path.endsWith('CLAUDE.local.md')) return 'local'
  return 'repo'
}

export async function getClaudeFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref?: string
): Promise<ClaudeFile[]> {
  try {
    return await getFilesRecursive(octokit, owner, repo, '.claude', ref)
  } catch {
    return []
  }
}

export async function createPR(
  octokit: Octokit,
  request: CreatePRRequest
): Promise<CreatePRResponse> {
  const { owner, repo, branch, title, body, files } = request

  // 1. 기본 브랜치 정보 가져오기
  const { data: repoData } = await octokit.repos.get({ owner, repo })
  const defaultBranch = repoData.default_branch

  // 2. 기본 브랜치의 최신 커밋 SHA
  const { data: refData } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${defaultBranch}`,
  })
  const baseCommitSha = refData.object.sha

  // 3. 베이스 트리 SHA
  const { data: baseCommit } = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: baseCommitSha,
  })
  const baseTreeSha = baseCommit.tree.sha

  // 4. 변경된 파일들의 blob 생성
  type TreeItem = {
    path: string
    mode: '100644'
    type: 'blob'
    sha?: string | null
    content?: string
  }
  const treeItems: TreeItem[] = []

  for (const file of files) {
    if (file.deleted) {
      treeItems.push({ path: file.path, mode: '100644', type: 'blob', sha: null })
    } else {
      const { data: blob } = await octokit.git.createBlob({
        owner,
        repo,
        content: Buffer.from(file.content).toString('base64'),
        encoding: 'base64',
      })
      treeItems.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha })
    }
  }

  // 5. 새 트리 생성
  const { data: newTree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree: treeItems,
  })

  // 6. 새 커밋 생성
  const { data: newCommit } = await octokit.git.createCommit({
    owner,
    repo,
    message: title,
    tree: newTree.sha,
    parents: [baseCommitSha],
  })

  // 7. 브랜치 생성
  await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branch}`,
    sha: newCommit.sha,
  })

  // 8. PR 생성
  const { data: pr } = await octokit.pulls.create({
    owner,
    repo,
    title,
    body,
    head: branch,
    base: defaultBranch,
  })

  return { url: pr.html_url, number: pr.number }
}
