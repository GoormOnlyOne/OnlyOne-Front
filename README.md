# 벗킷 (Buddkit)

> 시니어를 위한 모임 플랫폼

벗킷은 시니어 세대가 새로운 친구를 만나고, 관심사를 공유하며, 활발한 사회활동을 이어갈 수 있도록 돕는 모임 서비스입니다. 사용하기 쉬운 인터페이스와 안전한 커뮤니티 환경을 제공하여 시니어들이 편안하게 소통할 수 있는 공간을 만들어갑니다.

## 🔗 Links

- **배포 URL**: [https://only-one-front-delta.vercel.app/](https://only-one-front-delta.vercel.app/)
- **GitHub Repository**: [https://github.com/GoormOnlyOne/OnlyOne-Front](https://github.com/GoormOnlyOne/OnlyOne-Front)

## 🚀 Quick Start

### Prerequisites

- Node.js 22.17.1
- npm 10.9.2

### Installation

```bash
# 저장소 클론
git clone https://github.com/GoormOnlyOne/OnlyOne-Front.git

# 프로젝트 디렉토리로 이동
cd OnlyOne-Front

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버는 [http://localhost:5173](http://localhost:5173)에서 실행됩니다.

### Build

```bash
# 프로덕션 빌드
npm run build

# 빌드된 앱 미리보기
npm run preview
```

## 🛠 Tech Stack

### Core
- **React 19.1.0** - 사용자 인터페이스 구축을 위한 JavaScript 라이브러리
- **TypeScript 5.8.3** - 타입 안정성을 위한 JavaScript의 상위 집합
- **Vite 7.0.4** - 빠른 개발 환경과 최적화된 빌드를 제공하는 차세대 프론트엔드 빌드 도구

### Styling
- **Tailwind CSS 4.1.11** - 유틸리티 우선 CSS 프레임워크
  - `@tailwindcss/forms` - 폼 요소 스타일링
  - `@tailwindcss/typography` - 텍스트 콘텐츠 스타일링

### Routing & State Management
- **React Router DOM 7.7.1** - React 애플리케이션을 위한 선언적 라우팅

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
src/
├── App.tsx          # 애플리케이션 진입점
└── ...
```
