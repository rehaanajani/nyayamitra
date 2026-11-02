import { Img, staticFile } from 'remotion'
import { C, F, Wash } from './kit'

export const Thumbnail = () => (
  <Wash>
    <div style={{ position: 'absolute', left: 84, top: 66, width: 1180 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 28 }}>
        <span style={{ fontFamily: F.deva, fontSize: 200, lineHeight: 1.08, color: C.ink }}>न्यायमित्र</span>
        <span style={{ fontFamily: F.display, fontSize: 64, color: C.ink2 }}>Nyayamitra</span>
      </div>
      <div style={{ fontFamily: F.display, fontSize: 92, lineHeight: 1.04, color: C.ink, marginTop: 8 }}>The AI judge that cuts you off.</div>
      <div style={{ fontFamily: F.display, fontSize: 92, lineHeight: 1.04, color: C.violet, marginTop: 4 }}>The helpline that listens.</div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 22, marginTop: 40, background: '#fff', borderRadius: 26, padding: '20px 32px', boxShadow: '0 26px 60px -28px rgba(16,24,40,.5)' }}>
        <span style={{ fontFamily: F.deva, fontSize: 50, color: C.ink }}>"रुकिए counsel। IPC 420?"</span>
        <span style={{ borderRadius: 999, background: C.warn, color: '#fff', padding: '10px 24px', fontFamily: F.sans, fontWeight: 600, fontSize: 36 }}>IPC 420 → BNS 318</span>
      </div>
      <div style={{ marginTop: 44, fontFamily: F.sans, color: C.ink }}>
        <div style={{ fontSize: 28, letterSpacing: '0.16em', fontWeight: 500, color: C.muted }}>BUILT BY</div>
        <div style={{ fontSize: 56, fontWeight: 600, marginTop: 6 }}>Rehaan Ajani &amp; Raghav Maheshwari</div>
        <div style={{ fontSize: 30, color: C.ink2, marginTop: 14 }}>On Gnani Prisma · Timbre · Evon</div>
      </div>
    </div>
    <Img src={staticFile('brand/mitra.png')} style={{ position: 'absolute', right: -24, bottom: -18, height: 760, filter: 'drop-shadow(0 18px 30px rgba(11,11,15,.28))' }} />
    <div style={{ position: 'absolute', right: 60, top: 178, filter: 'drop-shadow(0 12px 18px rgba(11,11,15,.22))' }}>
      <div style={{ background: '#fff', borderRadius: 30, padding: '16px 38px', fontFamily: F.deva, fontSize: 62, lineHeight: 1.1, color: C.ink }}>नमस्ते! मैं शेरू।</div>
      <span style={{ position: 'absolute', left: 200, bottom: -32, width: 54, height: 44, background: '#fff', clipPath: 'polygon(0 0, 100% 0, 30% 100%)' }} />
    </div>
  </Wash>
)
