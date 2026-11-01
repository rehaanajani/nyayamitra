import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

/**
 * मित्र (Mitra), the mascot: a soft white companion in an advocate's black coat
 * and white bands, holding the Constitution of India. Eyes follow the cursor
 * and blink now and then.
 */
function Eye({ cx, cy, look, blink }) {
  const id = `eye-${cx}`
  return (
    <g>
      <defs>
        <clipPath id={`${id}-clip`}>
          <ellipse cx={cx} cy={cy} rx="23" ry="27" />
        </clipPath>
        <radialGradient id={`${id}-iris`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#7a5230" />
          <stop offset="55%" stopColor="#4a2f18" />
          <stop offset="100%" stopColor="#21140a" />
        </radialGradient>
        <radialGradient id={`${id}-white`} cx="50%" cy="35%" r="70%">
          <stop offset="70%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e6e7f4" />
        </radialGradient>
      </defs>
      {/* soft socket shadow so the white eye reads on a white face */}
      <ellipse cx={cx} cy={cy + 1.5} rx="26" ry="30" fill="#dfe1f1" />
      <motion.g
        style={{ originX: `${cx}px`, originY: `${cy}px` }}
        animate={{ scaleY: blink ? 0.08 : 1 }}
        transition={{ duration: 0.09 }}
      >
        <ellipse cx={cx} cy={cy} rx="23" ry="27" fill={`url(#${id}-white)`} />
        <g clipPath={`url(#${id}-clip)`}>
          <motion.g animate={{ x: look.x, y: look.y }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
            <circle cx={cx} cy={cy + 3} r="15.5" fill={`url(#${id}-iris)`} />
            <circle cx={cx} cy={cy + 3} r="15.5" fill="none" stroke="#1a0f07" strokeOpacity=".5" strokeWidth="1.3" />
            <circle cx={cx} cy={cy + 3} r="7.6" fill="#0b0705" />
            <circle cx={cx - 5.5} cy={cy - 3.5} r="4.6" fill="#fff" />
            <circle cx={cx + 5} cy={cy + 8} r="2" fill="#fff" opacity=".85" />
          </motion.g>
          {/* upper lid shade */}
          <ellipse cx={cx} cy={cy - 25} rx="26" ry="9" fill="#d9dbee" opacity=".5" />
        </g>
      </motion.g>
    </g>
  )
}

export default function Mitra({ width = 260, className = '' }) {
  const ref = useRef(null)
  const [look, setLook] = useState({ x: 0, y: 0 })
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    const on = (e) => {
      const r = ref.current?.getBoundingClientRect()
      if (!r) return
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height * 0.42)
      const d = Math.hypot(dx, dy) || 1
      const k = Math.min(1, d / 260)
      setLook({ x: (dx / d) * 6.5 * k, y: (dy / d) * 6 * k })
    }
    window.addEventListener('pointermove', on)
    return () => window.removeEventListener('pointermove', on)
  }, [])

  useEffect(() => {
    let t
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true)
        setTimeout(() => setBlink(false), 140)
        loop()
      }, 2600 + Math.random() * 3200)
    }
    loop()
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.svg
      ref={ref}
      viewBox="0 0 300 260"
      width={width}
      className={className}
      role="img"
      aria-label="Mitra, the Nyayamitra mascot, in an advocate's coat holding the Constitution of India"
      animate={{ y: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
    >
      <defs>
        <radialGradient id="mitra-body" cx="45%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f7f7fd" />
          <stop offset="100%" stopColor="#e4e5f5" />
        </radialGradient>
        <linearGradient id="mitra-coat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1c24" />
          <stop offset="100%" stopColor="#0b0b0f" />
        </linearGradient>
        <linearGradient id="mitra-book" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a4aa8" />
          <stop offset="100%" stopColor="#1a2f74" />
        </linearGradient>
      </defs>

      {/* body */}
      <path d="M40 262 L40 140 C40 70 92 22 150 22 C208 22 260 70 260 140 L260 262 Z" fill="url(#mitra-body)" />
      <path d="M40 262 L40 140 C40 70 92 22 150 22 C208 22 260 70 260 140 L260 262" fill="none" stroke="#dcdef0" strokeWidth="2" />

      {/* brows */}
      <path d="M94 72 Q114 63 134 71" fill="none" stroke="#3a3a46" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M166 71 Q186 63 206 72" fill="none" stroke="#3a3a46" strokeWidth="3.2" strokeLinecap="round" />

      <Eye cx={115} cy={108} look={look} blink={blink} />
      <Eye cx={185} cy={108} look={look} blink={blink} />

      {/* cheeks and smile */}
      <ellipse cx="90" cy="146" rx="13" ry="7.5" fill="#ffc4a8" opacity=".55" />
      <ellipse cx="210" cy="146" rx="13" ry="7.5" fill="#ffc4a8" opacity=".55" />
      <path d="M139 150 Q150 160 161 150" fill="none" stroke="#2b2b35" strokeWidth="3" strokeLinecap="round" />

      {/* advocate's coat */}
      <path d="M40 262 L40 196 C66 176 104 170 133 178 L150 236 L150 262 Z" fill="url(#mitra-coat)" />
      <path d="M260 262 L260 196 C234 176 196 170 167 178 L150 236 L150 262 Z" fill="url(#mitra-coat)" />
      {/* shirt front, tinted so the white bands read */}
      <path d="M133 178 L150 236 L167 178 Z" fill="#e9ebf6" />
      {/* lapels */}
      <path d="M133 178 L150 236 L139 196 Z" fill="#26262f" />
      <path d="M167 178 L150 236 L161 196 Z" fill="#26262f" />
      {/* shirt collar and bands */}
      <path d="M134 177 L150 186 L166 177 L160 174 L150 180 L140 174 Z" fill="#ffffff" stroke="#d6d8ea" strokeWidth="1" />
      <rect x="142.5" y="184" width="6.5" height="27" rx="2.5" fill="#ffffff" stroke="#b9bdd6" strokeWidth="1.2" />
      <rect x="151" y="184" width="6.5" height="27" rx="2.5" fill="#ffffff" stroke="#b9bdd6" strokeWidth="1.2" />
      <circle cx="141" cy="222" r="2.4" fill="#3a3a46" />
      <circle cx="144" cy="240" r="2.4" fill="#3a3a46" />

      {/* the Constitution of India, held up on his right */}
      <motion.g
        style={{ originX: '226px', originY: '215px' }}
        animate={{ rotate: [-9, -6, -9] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      >
        <rect x="196" y="166" width="64" height="82" rx="4" fill="#fcf7f2" />
        <rect x="193" y="163" width="64" height="82" rx="4" fill="url(#mitra-book)" />
        <rect x="193" y="163" width="8" height="82" rx="3" fill="#152560" />
        <rect x="206" y="178" width="42" height="1.5" fill="#e8c76a" opacity=".9" />
        <text x="227" y="200" textAnchor="middle" fontFamily="'Tiro Devanagari Sanskrit', serif" fontSize="11.5" fill="#e8c76a">भारत का</text>
        <text x="227" y="216" textAnchor="middle" fontFamily="'Tiro Devanagari Sanskrit', serif" fontSize="13" fill="#f0d27e">संविधान</text>
        <rect x="206" y="226" width="42" height="1.5" fill="#e8c76a" opacity=".9" />
        <text x="227" y="238" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="5.2" letterSpacing=".6" fill="#e8c76a" opacity=".85">CONSTITUTION OF INDIA</text>
        {/* little hand gripping the spine */}
        <ellipse cx="193" cy="226" rx="8" ry="9.5" fill="url(#mitra-body)" stroke="#d8daee" strokeWidth="1.5" />
      </motion.g>
    </motion.svg>
  )
}
