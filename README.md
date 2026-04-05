# clasp

> GitHub 레포별 Claude Code 설정(`.claude/`)을 웹에서 편집하고 PR로 저장하는 도구

터미널이나 에디터를 열지 않고, 웹 브라우저에서 GitHub 레포별 `.claude/` 설정을 관리합니다.
변경사항은 PR로 생성되어 GitHub에 바로 반영됩니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| GitHub OAuth 로그인 | 내 레포 목록 불러오기 |
| 레포 선택 | `.claude/` 존재 여부 배지, 검색/필터 |
| Rules 편집 | CLAUDE.md, `.claude/rules/*.md` 조회·수정·추가·삭제 |
| Skills 편집 | 설치된 스킬 목록 관리 |
| Hooks / Connectors 편집 | `settings.json` 기반 훅·연결 서비스 관리 |
| PR 생성 | 변경사항 diff 미리보기 → 브랜치명·제목 입력 → GitHub PR |

---

## 화면 구성

```
Screen 1: 로그인 랜딩
  └─ GitHub으로 시작하기

Screen 2: 레포 선택
  └─ 레포 카드 그리드 (.claude ✓ 배지, 검색/필터)

Screen 3: 설정 편집
  ├─ 좌측 Sidebar: Rules / Skills / Hooks / Connectors / Global Rules
  ├─ 중앙: 파일 목록 (새 파일 추가, 삭제)
  └─ 우측: CodeMirror Markdown 에디터

Screen 4: PR 생성 모달
  └─ 브랜치명 자동생성 · PR 제목 · diff 미리보기 · GitHub PR 생성
```

---

## 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS + shadcn/ui |
| 패키지 매니저 | pnpm |
| 인증 | NextAuth.js v5 (GitHub OAuth) |
| GitHub 연동 | Octokit REST (Git Trees API로 PR 생성) |
| 에디터 | CodeMirror 6 (Markdown 하이라이팅) |
| 상태 관리 | Zustand |
| 배포 | Vercel |

---

## 로컬 실행

### 1. 의존성 설치

```bash
pnpm install
```

### 2. GitHub OAuth App 생성

[github.com/settings/developers](https://github.com/settings/developers) → **New OAuth App**

| 항목 | 값 |
|------|-----|
| Homepage URL | `http://localhost:3000` |
| Authorization callback URL | `http://localhost:3000/api/auth/callback/github` |

### 3. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일에 값 입력:

```env
GITHUB_ID=your_client_id
GITHUB_SECRET=your_client_secret
AUTH_SECRET=             # openssl rand -base64 32
AUTH_URL=http://localhost:3000
```

### 4. 개발 서버 실행

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000) 접속

---

## 파일 구조

```
src/
├── auth.ts                          # NextAuth v5 설정 (GitHub OAuth)
├── proxy.ts                         # 인증 미들웨어 (Next.js 16)
├── types/                           # 공유 타입 정의
├── app/
│   ├── page.tsx                     # 로그인 페이지
│   ├── repos/page.tsx               # 레포 선택
│   ├── [owner]/[repo]/page.tsx      # 설정 편집 에디터
│   └── api/github/                  # repos / files / pr API
├── components/
│   ├── repos/                       # RepoCard, RepoGrid
│   └── editor/                      # Sidebar, FileList, CodeMirrorEditor, PRModal
├── lib/
│   ├── github.ts                    # Octokit 래퍼, PR 생성 (Git Trees API)
│   └── claude-files.ts              # .claude/ 파일 파싱 유틸
└── store/editor.ts                  # Zustand 에디터 상태
```

---

## PR 생성 방식

변경된 파일을 Git Trees API로 한 번에 커밋합니다.

```
최신 commit SHA 조회
→ 변경 파일별 blob 생성
→ 새 tree 생성
→ 새 commit 생성
→ 브랜치 생성 (claude-config/update-{type}-{YYMMDD})
→ PR 오픈
```

---

## Vercel 배포

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

배포 시 환경 변수 (`GITHUB_ID`, `GITHUB_SECRET`, `AUTH_SECRET`, `AUTH_URL`)를 Vercel 프로젝트 설정에 추가하고, GitHub OAuth App의 callback URL을 Vercel 도메인으로 업데이트하세요.
