export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  owner: { login: string; avatar_url: string }
  private: boolean
  description: string | null
  updated_at: string
  default_branch: string
  hasClaudeConfig?: boolean
}

export type ClaudeFileScope = 'repo' | 'local' | 'rules' | 'skills' | 'settings'

export interface ClaudeFile {
  path: string
  name: string
  content: string
  sha: string
  scope: ClaudeFileScope
  isNew?: boolean
  isDeleted?: boolean
}

export type EditorSection = 'rules' | 'skills' | 'global'

export interface EditorState {
  selectedSection: EditorSection
  files: ClaudeFile[]
  selectedFile: ClaudeFile | null
  dirtyFiles: Set<string>
  isLoading: boolean
  owner: string
  repo: string
}

export interface CreatePRRequest {
  owner: string
  repo: string
  branch: string
  title: string
  body: string
  files: Array<{ path: string; content: string; sha?: string; deleted?: boolean }>
}

export interface CreatePRResponse {
  url: string
  number: number
}
