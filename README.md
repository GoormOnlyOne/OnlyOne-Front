# 벗킷 (Buddkit)

> 시니어를 위한 모임 플랫폼

벗킷은 시니어 세대가 새로운 친구를 만나고, 관심사를 공유하며, 활발한 사회활동을 이어갈 수 있도록 돕는 모임 서비스입니다. 사용하기 쉬운 인터페이스와 안전한 커뮤니티 환경을 제공하여 시니어들이 편안하게 소통할 수 있는 공간을 만들어갑니다.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 이상
- npm 또는 yarn

### Installation

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### Build

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

## 🛠 Tech Stack

### Core
- **Next.js 15.1.3** - React 기반 풀스택 웹 애플리케이션 프레임워크
- **React 19.1.0** - 사용자 인터페이스 구축을 위한 JavaScript 라이브러리
- **TypeScript 5.8.3** - 타입 안정성을 위한 JavaScript의 상위 집합

### Styling
- **Tailwind CSS 4.1.11** - 유틸리티 우선 CSS 프레임워크
  - `@tailwindcss/forms` - 폼 요소 스타일링
  - `@tailwindcss/typography` - 텍스트 콘텐츠 스타일링

### Form Handling
- **React Hook Form 7.61.1** - 성능이 뛰어난 폼 상태 관리 라이브러리
- **Zod 4.0.10** - TypeScript 우선 스키마 검증 라이브러리
- **@hookform/resolvers 5.2.0** - React Hook Form과 검증 라이브러리 연결

### Utilities
- **date-fns 4.1.0** - 모던한 JavaScript 날짜 유틸리티 라이브러리
- **clsx 2.1.1** - 조건부 className 구성을 위한 유틸리티

### Development Tools
- **ESLint** - 코드 품질 및 일관성 유지
- **Prettier** - 코드 포맷터
- **PostCSS & Autoprefixer** - CSS 후처리 도구

## 📁 Project Structure

```
app/
├── layout.tsx           # 루트 레이아웃
├── page.tsx            # 홈 페이지
├── globals.css         # 글로벌 스타일
└── components/
    └── page.tsx        # 컴포넌트 갤러리 페이지
```

## 🔄 Migration from Vite to Next.js

이 프로젝트는 Vite + React에서 Next.js로 마이그레이션되었습니다:

### 주요 변경사항
- **라우팅**: React Router → Next.js App Router
- **빌드 도구**: Vite → Next.js 내장 웹팩
- **프로젝트 구조**: `src/` → `app/` 디렉터리 구조
- **페이지 라우팅**: 파일 시스템 기반 라우팅
- **메타데이터**: Next.js metadata API 사용

### 혜택
- **서버 사이드 렌더링 (SSR)** - 향상된 SEO와 초기 로딩 성능
- **정적 사이트 생성 (SSG)** - 빌드 타임에 페이지 생성
- **자동 코드 분할** - 성능 최적화
- **내장 이미지 최적화** - Next.js Image 컴포넌트
- **API 라우트** - 풀스택 애플리케이션 개발 가능

## 📝 Available Scripts

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 실행
- `npm run lint` - ESLint 검사 실행
