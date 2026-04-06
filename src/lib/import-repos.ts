export interface CuratedRepo {
  owner: string
  repo: string
  label: string
  description: string
  sections: ('rules' | 'skills')[]
}

export const CURATED_REPOS: CuratedRepo[] = [
  {
    owner: 'anthropics',
    repo: 'claude-code',
    label: 'anthropics/claude-code',
    description: 'Anthropic 공식 Claude Code skills 예제',
    sections: ['skills'],
  },
  {
    owner: 'cline',
    repo: 'cline',
    label: 'cline/cline',
    description: 'Cline 자율 코딩 에이전트 설정 패턴',
    sections: ['skills'],
  },
]
