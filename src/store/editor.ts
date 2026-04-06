import { create } from 'zustand'
import type { ClaudeFile, EditorSection } from '@/types'

interface EditorStore {
  // 상태
  selectedSection: EditorSection
  files: ClaudeFile[]
  selectedFile: ClaudeFile | null
  dirtyFiles: Set<string>
  isLoading: boolean
  owner: string
  repo: string
  isPRModalOpen: boolean
  isImportModalOpen: boolean

  // 액션
  initialize: (owner: string, repo: string, files: ClaudeFile[]) => void
  reset: () => void
  setSection: (section: EditorSection) => void
  selectFile: (file: ClaudeFile | null) => void
  updateFileContent: (path: string, content: string) => void
  addFile: (file: Omit<ClaudeFile, 'sha'> & { sha?: string }) => void
  markFileDeleted: (path: string) => void
  isDirty: () => boolean
  getDirtyFiles: () => ClaudeFile[]
  openPRModal: () => void
  closePRModal: () => void
  openImportModal: () => void
  closeImportModal: () => void
}

const initialState = {
  selectedSection: 'rules' as EditorSection,
  files: [] as ClaudeFile[],
  selectedFile: null,
  dirtyFiles: new Set<string>(),
  isLoading: false,
  owner: '',
  repo: '',
  isPRModalOpen: false,
  isImportModalOpen: false,
}

export const useEditorStore = create<EditorStore>()((set, get) => ({
  ...initialState,

  initialize: (owner, repo, files) => {
    set({
      owner,
      repo,
      files,
      selectedFile: null,
      dirtyFiles: new Set(),
      isLoading: false,
    })
  },

  reset: () => {
    set({ ...initialState, dirtyFiles: new Set() })
  },

  setSection: (section) => {
    set({ selectedSection: section, selectedFile: null })
  },

  selectFile: (file) => {
    set({ selectedFile: file })
  },

  updateFileContent: (path, content) => {
    const { files, selectedFile, dirtyFiles } = get()
    const updatedFiles = files.map((f) => (f.path === path ? { ...f, content } : f))
    const newDirty = new Set(dirtyFiles)
    newDirty.add(path)
    set({
      files: updatedFiles,
      dirtyFiles: newDirty,
      selectedFile: selectedFile?.path === path ? { ...selectedFile, content } : selectedFile,
    })
  },

  addFile: (file) => {
    const { files } = get()
    const newFile: ClaudeFile = { ...file, sha: file.sha ?? '', isNew: true }
    set({ files: [...files, newFile], selectedFile: newFile })
  },

  markFileDeleted: (path) => {
    const { files, selectedFile, dirtyFiles } = get()
    const updatedFiles = files.map((f) => (f.path === path ? { ...f, isDeleted: true } : f))
    const newDirty = new Set(dirtyFiles)
    newDirty.add(path)
    set({
      files: updatedFiles,
      dirtyFiles: newDirty,
      selectedFile: selectedFile?.path === path ? null : selectedFile,
    })
  },

  isDirty: () => get().dirtyFiles.size > 0,

  getDirtyFiles: () => {
    const { files, dirtyFiles } = get()
    return files.filter((f) => dirtyFiles.has(f.path))
  },

  openPRModal: () => set({ isPRModalOpen: true }),
  closePRModal: () => set({ isPRModalOpen: false }),
  openImportModal: () => set({ isImportModalOpen: true }),
  closeImportModal: () => set({ isImportModalOpen: false }),
}))
