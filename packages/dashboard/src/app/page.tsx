import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-brand-700">ProveIt</span>
          <Link
            href="/overview"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            Dashboard →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            결과물이 아니라{' '}
            <span className="text-brand-600">과정</span>을 증명한다
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            AI 시대, 진짜 실력은 과정에서 드러납니다.
            <br />
            ProveIt은 당신의 작업 과정을 자동으로 기록하고,
            <br className="hidden sm:block" />
            검증 가능한 포트폴리오로 만들어줍니다.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/overview"
              className="px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors text-sm"
            >
              Dashboard
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">
            왜 ProveIt이 필요한가?
          </h2>
          <p className="text-center text-gray-500 mb-12 text-sm">
            기존 방식으로는 &quot;진짜 실력&quot;을 증명할 수 없습니다
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '📄',
                title: '이력서는 자기신고',
                desc: '누구나 "React 능숙"이라 쓸 수 있습니다. 검증 방법이 없으니 과장과 허위가 넘칩니다.',
              },
              {
                icon: '🐙',
                title: 'GitHub은 결과만',
                desc: '최종 커밋은 보이지만, 어떤 시행착오를 거쳤는지, AI를 얼마나 썼는지 알 수 없습니다.',
              },
              {
                icon: '🤖',
                title: 'AI 시대의 딜레마',
                desc: 'AI가 코드를 짜는 시대에, "이 사람이 진짜 할 줄 아는지" 증명하는 것은 더 어려워졌습니다.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <span className="text-2xl">{item.icon}</span>
                <h3 className="mt-3 font-semibold text-sm">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">
            어떻게 작동하나요?
          </h2>
          <p className="text-center text-gray-500 mb-12 text-sm">
            3단계로 검증 가능한 포트폴리오가 완성됩니다
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: '자동 기록',
                subtitle: 'Record',
                desc: 'VS Code 확장을 설치하면 파일 변경, 커밋, 에러, AI 코파일럿 사용까지 백그라운드에서 자동 추적합니다.',
              },
              {
                step: '02',
                title: 'AI 인사이트',
                subtitle: 'Analyze',
                desc: 'Claude AI가 작업 세션을 분석해 요약, 역량 태그, AI 활용 비율, 문제 해결 패턴을 추출합니다.',
              },
              {
                step: '03',
                title: '포트폴리오 공유',
                subtitle: 'Share',
                desc: '해시체인으로 변조가 불가능한 검증 가능한 포트폴리오를 생성하고, 링크로 공유합니다.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-700 font-bold text-sm mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-brand-500 font-medium mb-2">
                  {item.subtitle}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">핵심 기능</h2>
          <p className="text-center text-gray-500 mb-12 text-sm">
            과정 추적부터 검증까지, 올인원 플랫폼
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: '⚡',
                title: '자동 과정 추적',
                desc: '파일 변경, 커밋, 에러 발생/해결, AI 코파일럿 사용 여부를 자동으로 기록합니다. 개발자는 코딩에만 집중하세요.',
              },
              {
                icon: '🧠',
                title: 'AI 인사이트',
                desc: '프로젝트 분석, 역량 태그 자동 추출, 작업 시간 분석, 문제 해결 패턴 파악까지. 데이터 기반 자기소개서.',
              },
              {
                icon: '🔗',
                title: '해시체인 검증',
                desc: 'SHA-256 해시 체인으로 모든 기록의 변조를 방지합니다. 타임스탬프 서명으로 신뢰 등급을 부여합니다.',
              },
              {
                icon: '🌐',
                title: '공유 포트폴리오',
                desc: '프로젝트별 공개/비공개 설정, 채용 담당자용 뷰, 역량 기반 필터링까지. 당신의 과정을 세상에 보여주세요.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <span className="text-2xl">{item.icon}</span>
                <h3 className="mt-3 font-semibold text-sm">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Grades */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">신뢰 등급</h2>
          <p className="text-center text-gray-500 mb-12 text-sm">
            활동 기록의 일관성과 무결성을 기반으로 신뢰도를 평가합니다
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                grade: '🟢',
                label: 'High Confidence',
                title: '높은 신뢰',
                desc: '지속적 활동 기록, 일관된 패턴, 타임스탬프 무결성 검증 완료',
                bg: 'bg-green-50',
                border: 'border-green-200',
                text: 'text-green-700',
              },
              {
                grade: '🟡',
                label: 'Medium',
                title: '보통',
                desc: '간헐적 기록 또는 일부 불일치가 있으나 전반적으로 신뢰 가능',
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                text: 'text-yellow-700',
              },
              {
                grade: '🔴',
                label: 'Low',
                title: '낮음',
                desc: '대량의 즉시 생성 코드, 패턴 불일치 등 검증이 어려운 상태',
                bg: 'bg-red-50',
                border: 'border-red-200',
                text: 'text-red-700',
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-xl p-6 border ${item.bg} ${item.border}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{item.grade}</span>
                  <div>
                    <h3 className={`font-semibold text-sm ${item.text}`}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500">{item.label}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-brand-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            당신의 과정을 증명하세요
          </h2>
          <p className="text-brand-100 mb-8 text-sm">
            ProveIt으로 &quot;이렇게 사고하고 이렇게 만들었다&quot;를 보여주세요
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/overview"
              className="px-6 py-3 bg-white text-brand-700 font-medium rounded-lg hover:bg-brand-50 transition-colors text-sm"
            >
              Dashboard 바로가기
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-brand-400 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors text-sm"
            >
              GitHub에서 보기
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-brand-700 text-sm">ProveIt</span>
            <span className="text-xs text-gray-400">
              Process Portfolio Platform
            </span>
          </div>
          <p className="text-xs text-gray-400">
            &copy; 2025 ProveIt. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
