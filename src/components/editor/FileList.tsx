'use client'

import { useState } from 'react'
import { Plus, Trash2, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEditorStore } from '@/store/editor'
import { getSectionFiles, getDefaultNewFilePath, getScopeBadgeLabel } from '@/lib/claude-files'

export function FileList() {
  const {
    selectedSection,
    files,
    selectedFile,
    dirtyFiles,
    selectFile,
    addFile,
  } = useEditorStore()

  const [showNewInput, setShowNewInput] = useState(false)
  const [newFileName, setNewFileName] = useState('')

  const sectionFiles = getSectionFiles(files, selectedSection).filter((f) => !f.isDeleted)

  const handleAddFile = () => {
    if (!newFileName.trim()) return
    const path = getDefaultNewFilePath(selectedSection, newFileName.trim())
    const name = newFileName.trim().endsWith('.md')
      ? newFileName.trim()
      : `${newFileName.trim()}.md`

    const skillName = path.replace(/^.*\//, '').replace(/\.md$/, '')
    const content =
      selectedSection === 'skills'
        ? `---\nname: ${skillName}\ndescription: \n---\n\n`
        : ''

    addFile({
      path,
      name,
      content,
      scope:
        selectedSection === 'rules'
          ? 'rules'
          : selectedSection === 'skills'
            ? 'skills'
            : 'repo',
    })
    setNewFileName('')
    setShowNewInput(false)
  }

  const canAddFile = selectedSection === 'rules' || selectedSection === 'skills'

  return (
    <div className="flex flex-col w-64 shrink-0 border-r h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          파일
        </span>
        {canAddFile && (
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={() => setShowNewInput(true)}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-1.5 flex flex-col gap-0.5">
          {sectionFiles.length === 0 && !showNewInput && (
            <div className="text-center py-8 text-xs text-muted-foreground px-3">
              파일이 없습니다.
            </div>
          )}

          {sectionFiles.map((file) => (
            <button
              key={file.path}
              onClick={() => selectFile(file)}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left w-full group transition-colors',
                selectedFile?.path === file.path
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
              )}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate flex-1 text-xs">{file.name}</span>
              {dirtyFiles.has(file.path) && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" title="수정됨" />
              )}
              {file.isNew && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 shrink-0">
                  new
                </Badge>
              )}
              <DeleteFileButton filePath={file.path} />
            </button>
          ))}

          {showNewInput && (
            <div className="flex items-center gap-1 px-2 py-1">
              <Input
                autoFocus
                placeholder="파일명 (예: lint-rules)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddFile()
                  if (e.key === 'Escape') {
                    setShowNewInput(false)
                    setNewFileName('')
                  }
                }}
                className="h-7 text-xs"
              />
              <Button size="sm" className="h-7 px-2" onClick={handleAddFile}>
                추가
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t px-3 py-1.5">
        <p className="text-[10px] text-muted-foreground">
          {sectionFiles.length}개 파일
        </p>
      </div>
    </div>
  )
}

function DeleteFileButton({ filePath }: { filePath: string }) {
  const { markFileDeleted } = useEditorStore()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation()
        markFileDeleted(filePath)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation()
          markFileDeleted(filePath)
        }
      }}
      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive cursor-pointer"
      title="파일 삭제"
    >
      <Trash2 className="w-3 h-3" />
    </div>
  )
}
