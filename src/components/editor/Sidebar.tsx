'use client'

import { BookOpen, Wrench, Webhook, PlugZap, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { useEditorStore } from '@/store/editor'
import type { EditorSection } from '@/types'

const sections: Array<{ id: EditorSection; label: string; icon: React.ReactNode }> = [
  { id: 'rules', label: 'Rules', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'skills', label: 'Skills', icon: <Wrench className="w-4 h-4" /> },
  { id: 'hooks', label: 'Hooks', icon: <Webhook className="w-4 h-4" /> },
  { id: 'connectors', label: 'Connectors', icon: <PlugZap className="w-4 h-4" /> },
]

export function Sidebar() {
  const { selectedSection, setSection, files } = useEditorStore()

  const hasFile = (section: EditorSection) => {
    return files.some((f) => {
      if (section === 'rules') return f.scope === 'repo' || f.scope === 'local' || f.scope === 'rules'
      if (section === 'skills') return f.scope === 'skills'
      if (section === 'hooks' || section === 'connectors') return f.scope === 'settings'
      return false
    })
  }

  return (
    <div className="flex flex-col w-48 shrink-0 border-r h-full bg-muted/30">
      <div className="p-2 flex flex-col gap-0.5">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setSection(section.id)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left w-full',
              selectedSection === section.id
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            {section.icon}
            {section.label}
            {hasFile(section.id) && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            )}
          </button>
        ))}
      </div>

      <Separator />

      <div className="p-2">
        <button
          onClick={() => setSection('global')}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left w-full',
            selectedSection === 'global'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
        >
          <Globe className="w-4 h-4" />
          Global Rules
        </button>
      </div>
    </div>
  )
}
