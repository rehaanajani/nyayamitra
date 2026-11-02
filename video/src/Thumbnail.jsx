import { AbsoluteFill, Img, staticFile } from 'remotion'
import { C, F, Wash } from './kit'

export const Thumbnail = () => (
  <Wash>
    <div style={{ position: 'absolute', left: 90, top: 86, width: 1180 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, borderRadius: 999, background: C.ink, color: '#fff', padding: '14px 28px', fontFamily: F.sans, fontWeight: 500, fontSize: 32 }}><span style={{ width: 14, height: 14, borderRadius: 9, background: '#ff5a47' }} /> Live demo</div>
      <div style={{ fontFamily: F.display, fontSize: 158, lineHeight: 1.0, color: C.ink, marginTop: 34 }}>This AI judge will cut you off.</div>
      <div style={{ marginTop: 44, background: '#fff', borderRadius: 34, padding: '34px 44px', boxShadow: '0 30px 70px -28px rgba(16,24,40,.5)' }}>
        <div style={{ fontFamily: F.deva, fontSize: 66, lineHeight: 1.25, color: C.ink }}>"रुकिए counsel। IPC 420?"</div>
        <div style={{ display: 'inline-block', marginTop: 16, borderRadius: 999, background: C.warn, color: '#fff', padding: '12px 30px', fontFamily: F.sans, fontWeight: 600, fontSize: 44 }}>IPC 420 → BNS 318</div>
      </div>
    </div>
    <Img src={staticFile('brand/mitra.png')} style={{ position: 'absolute', right: -20, bottom: -18, height: 760, filter: 'drop-shadow(0 18px 30px rgba(11,11,15,.28))' }} />
  </Wash>
)
