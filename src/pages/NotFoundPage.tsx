import type { CSSProperties } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'

export function NotFoundPage({ navigate }: { navigate: (path: string) => void }) {
  usePageMeta({
    title: '页面未找到 | Lunar Talisman',
    description: '这条能量线路暂时没有页面，返回 Lunar Talisman 首页继续探索。',
    noindex: true,
  })

  const cardStyle: CSSProperties = {
    width: 'min(720px, calc(100% - 40px))',
    margin: '0 auto',
    padding: 'clamp(32px, 8vw, 72px)',
    borderRadius: 34,
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    textAlign: 'center',
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0a0608',
        color: '#fff',
        padding: '40px 0',
      }}
    >
      <div style={cardStyle}>
        <p style={{ margin: 0, letterSpacing: '0.2em', opacity: 0.58 }}>404 · LOST IN THE ORBIT</p>
        <h1
          style={{
            margin: '18px 0 0',
            fontFamily: "'Viaoda Libre', serif",
            fontSize: 'clamp(42px, 8vw, 78px)',
            lineHeight: 1,
          }}
        >
          页面未找到
        </h1>
        <p style={{ margin: '18px auto 0', maxWidth: 480, lineHeight: 1.8, opacity: 0.72 }}>
          这条能量线路暂时还没有页面。回到入口，继续探索你的护符。
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            marginTop: 28,
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.14)',
            color: '#fff',
            padding: '13px 22px',
            cursor: 'pointer',
          }}
        >
          返回首页 →
        </button>
      </div>
    </main>
  )
}
