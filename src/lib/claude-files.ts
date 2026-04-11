import type { ClaudeFile, ClaudeFileScope, EditorSection } from '@/types'
import { format } from 'date-fns'

export function inferSection(path: string): ClaudeFileScope {
  if (path.match(/\.claude\/rules\//)) return 'rules'
  if (path.match(/\.claude\/skills\//)) return 'skills'
  if (path.endsWith('settings.json')) return 'settings'
  if (path.endsWith('CLAUDE.local.md')) return 'local'
  return 'repo'
}

export function getSectionFiles(files: ClaudeFile[], section: EditorSection): ClaudeFile[] {
  switch (section) {
    case 'rules':
      return files.filter((f) => f.scope === 'repo' || f.scope === 'local' || f.scope === 'rules')
    case 'skills':
      return files.filter((f) => f.scope === 'skills')
    case 'global':
      return files.filter((f) => f.scope === 'repo' && f.name === 'CLAUDE.md')
    default:
      return files
  }
}

export function generateBranchName(
  type: 'rules' | 'skills' | 'mixed' = 'mixed'
): string {
  const date = format(new Date(), 'yyMMdd')
  return `claude-config/update-${type}-${date}`
}

export function generateDiff(original: string, modified: string, filename: string): string {
  const origLines = original.split('\n')
  const modLines = modified.split('\n')

  const diff: string[] = [`--- a/${filename}`, `+++ b/${filename}`]

  // 단순 라인 비교 (unified diff 스타일)
  const maxLen = Math.max(origLines.length, modLines.length)
  let i = 0
  let j = 0

  while (i < origLines.length || j < modLines.length) {
    const origLine = origLines[i]
    const modLine = modLines[j]

    if (i >= origLines.length) {
      diff.push(`+${modLine}`)
      j++
    } else if (j >= modLines.length) {
      diff.push(`-${origLine}`)
      i++
    } else if (origLine === modLine) {
      diff.push(` ${origLine}`)
      i++
      j++
    } else {
      diff.push(`-${origLine}`)
      diff.push(`+${modLine}`)
      i++
      j++
    }
  }

  // maxLen 사용을 위한 더미 참조 (lint 경고 방지)
  void maxLen

  return diff.join('\n')
}

export function getDefaultNewFilePath(section: EditorSection, name: string): string {
  const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
  switch (section) {
    case 'rules':
      return `.claude/rules/${safeName}.md`
    case 'skills':
      return `.claude/skills/${safeName}.md`
    default:
      return `.claude/${safeName}.md`
  }
}

export function getSectionLabel(section: EditorSection): string {
  const labels: Record<EditorSection, string> = {
    rules: 'Rules',
    skills: 'Skills',
    global: 'Global Rules',
  }
  return labels[section]
}

export function getScopeBadgeLabel(scope: ClaudeFileScope): string {
  const labels: Record<ClaudeFileScope, string> = {
    repo: 'project',
    local: 'local',
    rules: 'rules',
    skills: 'skills',
    settings: 'settings',
  }
  return labels[scope]
}
