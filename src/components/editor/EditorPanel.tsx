'use client'

import dynamic from 'next/dynamic'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useEditorStore } from '@/store/editor'
import { getScopeBadgeLabel } from '@/lib/claude-files'

// SSR 비활성화 (CodeMirror은 브라우저 전용)
const CodeMirrorEditor = dynamic(
  () => import('./CodeMirrorEditor').then((m) => m.CodeMirrorEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />,
  }
)

export function EditorPanel() {
  const { selectedFile, updateFileContent } = useEditorStore()

  if (!selectedFile) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        <div className="text-center space-y-1">
          <p>편집할 파일을 선택하세요.</p>
          <p className="text-xs text-muted-foreground/60">좌측 파일 목록에서 파일을 클릭하면 여기에 열립니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b shrink-0">
        <span className="font-mono text-sm font-medium truncate">{selectedFile.path}</span>
        <Badge variant="outline" className="shrink-0 text-xs">
          {getScopeBadgeLabel(selectedFile.scope)}
        </Badge>
        {selectedFile.isNew && (
          <Badge className="shrink-0 text-xs">new</Badge>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <CodeMirrorEditor
          key={selectedFile.path}
          value={selectedFile.content}
          onChange={(content) => updateFileContent(selectedFile.path, content)}
          readOnly={selectedFile.scope === 'local'}
        />
      </div>
    </div>
  )
}
