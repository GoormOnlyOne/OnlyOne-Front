// prettier.config.js
export default {
  // 기본 포맷팅
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  
  // 후행 콤마 (모든 곳에)
  trailingComma: 'all',
  
  // 라인 관련
  printWidth: 80,
  endOfLine: 'lf',
  
  // 공백 관련
  bracketSpacing: true,
  bracketSameLine: false,
  
  // 화살표 함수
  arrowParens: 'avoid',
  
  // TypeScript 파서 설정
  overrides: [
    {
      files: '*.{ts,tsx}',
      options: {
        parser: 'typescript',
      },
    }
  ]
};