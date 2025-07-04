# 예산 관리 앱 (Spend Challenge)

월급날 기준 개인 예산 관리 웹 애플리케이션입니다. 사용자가 설정한 월 예산을 자동으로 주 단위로 나누어 제공하고, 실제 소비 내역을 추적하여 예산 대비 실적을 관리할 수 있습니다.

## 주요 기능

### 🎯 월 예산 설정

- 월 예산 금액 설정
- 월급날 기준 시작일 설정 (기본: 5일)
- 주말/공휴일 자동 조정 (이전 평일로)

### 📊 대시보드

- 총 예산, 지출, 남은 금액 현황
- 이번 주 예산 사용률 및 진행률 바
- 주간 예산 현황 테이블

### 💰 지출 관리

- 지출 내역 입력 (날짜, 항목, 금액, 카테고리)
- 지출 목록 조회 및 필터링
- 카테고리별 분류 (식비, 교통비, 쇼핑, 문화생활, 의료비, 기타)

### 📈 통계 및 분석

- 카테고리별 지출 비율 (파이 차트)
- 주간 예산 vs 실제 지출 (막대 차트)
- 월별 지출 추이 (선 차트)
- 예산 달성률, 일평균/주평균 지출 분석

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns, date-holidays
- **Storage**: LocalStorage

## 설치 및 실행

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 개발 서버 실행

```bash
pnpm dev
```

### 3. 브라우저에서 접속

```
http://localhost:3000
```

## 사용법

### 1. 예산 설정

1. "설정" 메뉴로 이동
2. 월 예산 금액 입력 (예: 1,000,000원)
3. 월급날 기준 시작일 설정 (기본: 5일)
4. "예산 설정" 버튼 클릭

### 2. 지출 입력

1. "지출 입력" 메뉴로 이동
2. 지출 항목명 입력 (예: 점심식사)
3. 금액 입력 (예: 15,000원)
4. 카테고리 선택
5. 날짜 선택 (기본: 오늘)
6. "지출 저장" 버튼 클릭

### 3. 지출 관리

1. "지출 목록" 메뉴로 이동
2. 카테고리별 필터링 가능
3. 날짜/금액 기준 정렬 가능
4. 지출 내역 삭제 가능

### 4. 통계 확인

1. "통계" 메뉴로 이동
2. 다양한 차트와 분석 정보 확인
3. 예산 대비 실적 분석

## 주요 특징

### 🗓️ 스마트 날짜 처리

- `date-holidays` 라이브러리를 사용하여 한국 공휴일 정보 반영
- 월급날이 주말이나 공휴일인 경우 자동으로 이전 평일로 조정
- 정확한 주간 예산 계산

### 💾 로컬 스토리지

- 모든 데이터는 브라우저 LocalStorage에 저장
- 서버 없이도 데이터 유지
- 개인정보 보호

### 📱 반응형 디자인

- 모바일, 태블릿, 데스크톱 모든 기기 지원
- 직관적인 UI/UX

### 📊 실시간 통계

- 지출 입력 시 즉시 통계 업데이트
- 다양한 시각화 차트 제공

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 대시보드
│   ├── settings/          # 예산 설정
│   ├── expense/           # 지출 관리
│   │   ├── add/          # 지출 입력
│   │   └── list/         # 지출 목록
│   └── stats/            # 통계
├── components/            # 재사용 컴포넌트
│   ├── ui/               # UI 컴포넌트
│   └── Navigation.tsx    # 네비게이션
├── lib/                  # 유틸리티 함수
│   ├── storage.ts        # LocalStorage 관리
│   ├── dateUtils.ts      # 날짜 처리
│   └── budgetUtils.ts    # 예산 계산
└── types/                # TypeScript 타입 정의
```

## 향후 개선 계획

- [ ] 지출 내역 편집 기능
- [ ] 다크 모드 지원
- [ ] 데이터 백업/복원 기능
- [ ] 카테고리 커스터마이징
- [ ] 알림 기능 (예산 초과 시)
- [ ] PWA 지원
- [ ] 다국어 지원

## 라이선스

MIT License

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**개발자**: AI Assistant  
**버전**: 1.0.0  
**최종 업데이트**: 2024년 12월
