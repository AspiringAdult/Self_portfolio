'use client'

import { useEffect, useMemo, useRef, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  ChevronRight,
  Zap,
  Brain,
  Network,
  Shield,
  BarChart3,
  BookOpen,
  Send,
  Download,
  ExternalLink,
} from 'lucide-react'
import {
  HERO,
  SKILLS,
  LANGUAGES,
  PROJECTS,
  EXPERIENCE,
  CERTIFICATIONS,
  EDUCATION,
  SECTORS,
  DATA_STREAMS,
  CONTACT_PROTOCOLS,
} from '@/components/portfolio/data'
import { TopHUD, SideNavigator, MissionModal, ScrollHint, SectionHeading, ContactDeck } from '@/components/portfolio/ui'

const HeroAvatar3D = dynamic(() => import('@/components/portfolio/three').then((module) => module.HeroAvatar3D), { ssr: false })
const GlobalBackground3D = dynamic(() => import('@/components/portfolio/three').then((module) => module.GlobalBackground3D), { ssr: false })
const ShadowCity3D = dynamic(() => import('@/components/portfolio/three').then((module) => module.ShadowCity3D), { ssr: false })
const WebGraph3D = dynamic(() => import('@/components/portfolio/three').then((module) => module.WebGraph3D), { ssr: false })
const CyberTunnel3D = dynamic(() => import('@/components/portfolio/three').then((module) => module.CyberTunnel3D), { ssr: false })
const DataLab3D = dynamic(() => import('@/components/portfolio/three').then((module) => module.DataLab3D), { ssr: false })
const ArchiveOrbits3D = dynamic(() => import('@/components/portfolio/three').then((module) => module.ArchiveOrbits3D), { ssr: false })

const SIGNAL_TICKERS = ['AAPL +1.23%', 'NVDA +2.81%', 'BTC -0.74%', 'TSLA +0.51%', 'GOOGL +1.04%', 'ETH +3.12%', 'SPY +0.38%', 'MSFT +1.46%']

function TypeOut({ text, delay = 0, className = '' }) {
  const prefersReducedMotion = useReducedMotion()
  const [shown, setShown] = useState(prefersReducedMotion ? text : '')

  useEffect(() => {
    if (prefersReducedMotion) {
      setShown(text)
      return undefined
    }

    let index = 0
    let intervalId

    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index += 1
        setShown(text.slice(0, index))
        if (index >= text.length) window.clearInterval(intervalId)
      }, 28)
    }, delay)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [delay, prefersReducedMotion, text])

  return (
    <span className={className}>
      {shown}
      {!prefersReducedMotion ? <span className="animate-pulse text-cyan-300">|</span> : null}
    </span>
  )
}

function useSectorMotion() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    mass: 0.24,
  })

  return {
    ref,
    contentY: useTransform(smoothProgress, [0, 0.25, 0.75, 1], [56, 0, 0, -40]),
    contentOpacity: useTransform(smoothProgress, [0, 0.18, 0.35, 0.85, 1], [0.18, 0.6, 1, 1, 0.18]),
    sceneOpacity: useTransform(smoothProgress, [0, 0.15, 0.5, 0.85, 1], [0.2, 0.55, 1, 0.55, 0.2]),
  }
}

function SceneViewport({ children, sceneOpacity, priority = false }) {
  const ref = useRef(null)
  const [enabled, setEnabled] = useState(priority)

  useEffect(() => {
    if (priority) return undefined

    const node = ref.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEnabled(entry.isIntersecting)
      },
      { rootMargin: '140% 0px 140% 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [priority])

  return (
    <motion.div ref={ref} style={{ opacity: sceneOpacity }} className="absolute inset-0 pointer-events-none">
      {enabled ? children : null}
    </motion.div>
  )
}

function MetricCard({ label, value, note, accent = 'cyan' }) {
  const accentMap = {
    cyan: 'text-cyan-300 border-cyan-400/30',
    magenta: 'text-fuchsia-300 border-fuchsia-400/30',
    amber: 'text-amber-300 border-amber-400/30',
  }

  return (
    <div className={`glass hud-corner rounded p-4 border ${accentMap[accent] || accentMap.cyan}`}>
      <div className="font-mono text-[10px] tracking-widest text-white/45">{label}</div>
      <div className="mt-2 font-display text-2xl text-white">{value}</div>
      <div className="mt-1 text-[12px] text-white/60 leading-relaxed">{note}</div>
    </div>
  )
}

function DataSignalRow({ label, value, detail }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-white/70 font-mono mb-1">
        <span>{label}</span>
        <span className="text-cyan-200">{value}%</span>
      </div>
      <div className="h-1.5 rounded bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400"
        />
      </div>
      <div className="mt-1.5 text-[12px] text-white/50">{detail}</div>
    </div>
  )
}

function ArchiveStatTile({ label, value }) {
  return (
    <div className="glass rounded p-3">
      <div className="font-mono text-[10px] tracking-widest text-white/45">{label}</div>
      <div className="mt-1 font-display text-lg text-fuchsia-200">{value}</div>
    </div>
  )
}

function ProtocolCard({ title, detail }) {
  return (
    <div className="glass rounded p-3">
      <div className="font-mono text-[10px] tracking-widest text-cyan-300">{title.toUpperCase()}</div>
      <div className="mt-1 text-sm text-white/75 leading-relaxed">{detail}</div>
    </div>
  )
}

function HeroSection() {
  const { ref, contentY, contentOpacity, sceneOpacity } = useSectorMotion()

  return (
    <section ref={ref} id="hero" data-sector="hero" className="relative min-h-screen w-full overflow-hidden flex items-center">
      <SceneViewport sceneOpacity={sceneOpacity} priority>
        <HeroAvatar3D />
      </SceneViewport>
      <div className="absolute inset-0 cyber-grid opacity-50 pointer-events-none" />
      <div className="absolute inset-0 scanlines opacity-35 pointer-events-none" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 container px-6 md:px-10 grid md:grid-cols-2 gap-10 items-center"
      >
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-mono text-xs tracking-[0.4em] text-cyan-300"
          >
            // CORE IDENTITY CHAMBER / 00
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="mt-3 font-display font-black leading-[0.95] text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="block neon-cyan">DIPTANGKUSH</span>
            <span className="block gradient-text">DAS</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-white/60 px-2 py-1 border border-cyan-400/30 rounded"
          >
            <Zap className="h-3 w-3 text-cyan-300" />
            CALLSIGN / KINGSLAYER
            <span className="text-white/30">/</span>
            <span className="text-amber-300">{HERO.role.toUpperCase()}</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-6 max-w-xl text-lg md:text-xl text-white/80 leading-relaxed"
          >
            <TypeOut text={HERO.tagline} delay={1100} />
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.3 }}
            className="mt-4 max-w-xl text-sm text-white/55"
          >
            {HERO.bio}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.5 }}
            className="mt-7 flex flex-wrap gap-3"
          >
            <a
              href="#shadow"
              className="group inline-flex items-center gap-2 px-5 py-3 font-display text-sm tracking-widest rounded bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black hover:from-cyan-300 hover:to-fuchsia-400 shadow-[0_0_30px_-6px_rgba(34,211,238,0.7)]"
            >
              ENTER THE MULTIVERSE
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-3 font-display text-sm tracking-widest rounded border border-cyan-400/40 text-cyan-200 hover:border-cyan-300 hover:bg-cyan-500/10"
            >
              OPEN CHANNEL
            </a>
          </motion.div>
        </div>

        <div className="hidden md:block" />
      </motion.div>

      <ScrollHint />
    </section>
  )
}

function MissionNode({ project, onClick, style }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(project)}
      className="absolute glass hud-corner rounded px-3.5 py-2.5 text-left max-w-[240px] group"
      style={{ ...style, borderColor: `${project.color}60` }}
    >
      <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest" style={{ color: project.color }}>
        <span className="relative inline-flex h-2 w-2 rounded-full pulse-ring" style={{ background: project.color, color: project.color }} />
        {project.code}
      </div>
      <div className="mt-1 font-display text-sm font-bold text-white">{project.name}</div>
      <div className="text-[11px] text-white/50 truncate">{project.subtitle}</div>
      <div className="mt-1.5 text-[10px] font-mono tracking-widest text-amber-200/80">[{project.status}] OPEN &gt;</div>
    </motion.button>
  )
}

function Pill({ icon: Icon, label }) {
  return (
    <span className="glass rounded-full px-3 py-1.5 inline-flex items-center gap-2 font-mono text-[10px] tracking-widest text-cyan-100/80">
      <Icon className="h-3 w-3 text-cyan-300" />
      {label}
    </span>
  )
}

function ShadowSection({ onSelect }) {
  const { ref, contentY, contentOpacity, sceneOpacity } = useSectorMotion()
  const aiProjects = useMemo(() => PROJECTS.filter((project) => project.world === 'shadow'), [])

  return (
    <section ref={ref} id="shadow" data-sector="shadow" className="relative min-h-screen w-full overflow-hidden">
      <SceneViewport sceneOpacity={sceneOpacity}>
        <ShadowCity3D />
      </SceneViewport>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 container px-6 md:px-10 pt-24 pb-32">
        <SectionHeading
          code="01"
          title="SHADOW INTELLIGENCE"
          accent="cyan"
          sub="Strategic, analytical, and adaptive. Click the active nodes to inspect the AI mission files."
        />

        <div className="relative mt-10 h-[460px] md:h-[520px]">
          {aiProjects[0] ? <MissionNode project={aiProjects[0]} onClick={onSelect} style={{ top: '8%', left: '4%' }} /> : null}
          {aiProjects[1] ? <MissionNode project={aiProjects[1]} onClick={onSelect} style={{ top: '46%', right: '6%' }} /> : null}

          <div className="absolute bottom-4 left-0 right-0 flex flex-wrap gap-3">
            <Pill icon={Brain} label="NEURAL ARCHITECTURE" />
            <Pill icon={Zap} label="ADAPTIVE LOOPS" />
            <Pill icon={Network} label="VECTOR MEMORY" />
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function SignalTicker() {
  const list = useMemo(() => [...SIGNAL_TICKERS, ...SIGNAL_TICKERS], [])

  return (
    <div className="glass rounded overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 font-mono text-[10px] tracking-widest text-fuchsia-300 border-b border-fuchsia-400/20">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
        LIVE SIGNAL // WEAVER
      </div>
      <div className="relative overflow-hidden">
        <div className="flex gap-6 marquee whitespace-nowrap py-2 px-3 font-mono text-xs">
          {list.map((ticker, index) => (
            <span key={`${ticker}-${index}`} className={ticker.includes('-') ? 'text-fuchsia-300' : 'text-cyan-300'}>
              {ticker}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function WebSection({ onSelect }) {
  const { ref, contentY, contentOpacity, sceneOpacity } = useSectorMotion()
  const tradeProjects = useMemo(() => PROJECTS.filter((project) => project.world === 'web'), [])

  return (
    <section ref={ref} id="web" data-sector="web" className="relative min-h-screen w-full overflow-hidden">
      <SceneViewport sceneOpacity={sceneOpacity}>
        <WebGraph3D />
      </SceneViewport>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 container px-6 md:px-10 pt-24 pb-32 grid md:grid-cols-2 gap-8 items-start"
      >
        <SectionHeading
          code="02"
          title="WEB OF SYSTEMS"
          accent="magenta"
          sub="Fast. Reactive. Intelligent. Signal flows ripple across markets in real time and every node carries a decision."
        />

        <div className="flex flex-col gap-3">
          {tradeProjects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => onSelect(project)}
              className="text-left glass-magenta hud-corner rounded p-4 hover:translate-x-1 transition"
            >
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest" style={{ color: project.color }}>
                <span className="text-fuchsia-300">{project.code}</span>
                <span className="text-white/30">/</span>
                <span className="text-amber-300">{project.status}</span>
              </div>
              <div className="mt-1 font-display text-xl font-bold text-white">{project.name}</div>
              <div className="text-sm text-white/60">{project.subtitle}</div>
              <div className="mt-2 text-[12px] text-white/70 line-clamp-2">{project.summary}</div>
            </button>
          ))}

          <SignalTicker />
        </div>
      </motion.div>
    </section>
  )
}

function Stat({ label, value }) {
  return (
    <div className="glass hud-corner rounded p-3">
      <div className="font-mono text-[10px] tracking-widest text-white/50">{label}</div>
      <div className="font-display text-lg neon-amber">{value}</div>
    </div>
  )
}

function ArchitectureBlock({ title, desc }) {
  return (
    <div className="glass rounded p-3.5 border-l-2 border-amber-400/60">
      <div className="font-mono text-[10px] tracking-widest text-amber-300">{title}</div>
      <div className="text-sm text-white/80 mt-1">{desc}</div>
    </div>
  )
}

function CyberSection({ onSelect }) {
  const { ref, contentY, contentOpacity, sceneOpacity } = useSectorMotion()
  const vpn = useMemo(() => PROJECTS.find((project) => project.id === 'vpn'), [])

  return (
    <section ref={ref} id="cyber" data-sector="cyber" className="relative min-h-screen w-full overflow-hidden">
      <SceneViewport sceneOpacity={sceneOpacity}>
        <CyberTunnel3D />
      </SceneViewport>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 container px-6 md:px-10 pt-24 pb-32 grid md:grid-cols-2 gap-10 items-center"
      >
        <div>
          <SectionHeading
            code="03"
            title="CYBER DEFENSE ZONE"
            accent="amber"
            sub="Encrypted tunnels. Packet streams. Hardened protocols. Inside the fortress walls of secure systems."
          />

          <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
            <Stat label="PACKETS / SEC" value="4.2K" />
            <Stat label="ENCRYPTION" value="AES-256" />
            <Stat label="LATENCY" value="12ms" />
          </div>

          {vpn ? (
            <button
              type="button"
              onClick={() => onSelect(vpn)}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 font-display text-sm tracking-widest rounded border border-amber-400/40 text-amber-200 hover:border-amber-300 hover:bg-amber-500/10"
            >
              <Shield className="h-4 w-4" />
              ACCESS NIGHTSHADE VPN FILE
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <ArchitectureBlock title="01 // KEY EXCHANGE" desc="TCP socket handshake initiates an encrypted session via shared-key derivation." />
          <ArchitectureBlock title="02 // TUNNEL ESTABLISHED" desc="Bidirectional encrypted channels route packets through forwarding logic." />
          <ArchitectureBlock title="03 // PACKET STREAM" desc="Payloads are encapsulated while metadata visibility is minimized across the tunnel." />
          <ArchitectureBlock title="04 // INTRUSION CHECK" desc="Telemetry is compared against a baseline and abnormal behavior can trigger lockdown." />
        </div>
      </motion.div>
    </section>
  )
}

function DataSection() {
  const { ref, contentY, contentOpacity, sceneOpacity } = useSectorMotion()
  const kpis = useMemo(
    () => [
      {
        label: 'MISSION FILES',
        value: PROJECTS.length.toString().padStart(2, '0'),
        note: 'Cross-domain builds spanning AI, web systems, trading, and secure networking.',
        accent: 'cyan',
      },
      {
        label: 'SKILL NODES',
        value: SKILLS.length.toString().padStart(2, '0'),
        note: 'Programming, analytics, data tooling, and engineering foundations.',
        accent: 'magenta',
      },
      {
        label: 'FIELD RUNS',
        value: EXPERIENCE.length.toString().padStart(2, '0'),
        note: 'Hands-on experience across visualization, backend automation, and blockchain QA.',
        accent: 'amber',
      },
    ],
    []
  )

  return (
    <section ref={ref} id="data" data-sector="data" className="relative min-h-screen w-full overflow-hidden">
      <SceneViewport sceneOpacity={sceneOpacity}>
        <DataLab3D />
      </SceneViewport>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 container px-6 md:px-10 pt-24 pb-32 grid md:grid-cols-2 gap-10"
      >
        <div className="flex flex-col gap-4">
          <SectionHeading
            code="04"
            title="DATA VISUALIZATION LAB"
            accent="cyan"
            sub="Where metrics turn into stories, systems become readable, and raw signal becomes decision-ready intelligence."
          />

          <div className="grid sm:grid-cols-3 gap-3">
            {kpis.map((kpi) => (
              <MetricCard key={kpi.label} {...kpi} />
            ))}
          </div>

          <div className="glass hud-corner rounded p-4">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-cyan-300">
              <BarChart3 className="h-3.5 w-3.5" />
              // DOMAIN SIGNALS
            </div>
            <div className="mt-4 space-y-4">
              {DATA_STREAMS.map((stream) => (
                <DataSignalRow key={stream.label} {...stream} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="glass hud-corner rounded p-4">
            <div className="font-mono text-[10px] tracking-widest text-cyan-300">// SKILL MATRIX</div>
            <div className="mt-3 space-y-2.5">
              {SKILLS.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between text-xs text-white/70 font-mono mb-1">
                    <span>{skill.name}</span>
                    <span className="text-cyan-200">{skill.level}%</span>
                  </div>
                  <div className="h-1.5 rounded bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 1.15, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-400"
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-white/45 uppercase tracking-[0.25em]">{skill.group}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded p-4">
            <div className="font-mono text-[10px] tracking-widest text-amber-300">// EXPERIENCE LOG</div>
            <div className="mt-3 space-y-4">
              {EXPERIENCE.map((entry) => (
                <div key={`${entry.company}-${entry.title}`} className="border-l-2 border-amber-400/35 pl-4">
                  <div className="font-mono text-[10px] tracking-widest text-white/45">{entry.dates}</div>
                  <div className="mt-1 font-display text-sm font-bold text-white">{entry.title}</div>
                  <div className="text-[12px] text-white/55">{entry.company}</div>
                  <div className="mt-2 space-y-1.5">
                    {entry.points.map((point) => (
                      <div key={point} className="text-[12px] leading-relaxed text-white/70">
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function ArchiveSection() {
  const { ref, contentY, contentOpacity, sceneOpacity } = useSectorMotion()
  const [active, setActive] = useState(0)
  const selectedCertification = CERTIFICATIONS[active] || CERTIFICATIONS[0]

  return (
    <section ref={ref} id="archive" data-sector="archive" className="relative min-h-screen w-full overflow-hidden">
      <SceneViewport sceneOpacity={sceneOpacity}>
        <ArchiveOrbits3D count={CERTIFICATIONS.length} />
      </SceneViewport>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 container px-6 md:px-10 pt-24 pb-32">
        <SectionHeading
          code="05"
          title="KNOWLEDGE ARCHIVE"
          accent="magenta"
          sub="A memory vault for certifications, academic milestones, and the disciplines that inform the work."
        />

        <div className="mt-10 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3">
            {CERTIFICATIONS.map((certification, index) => {
              const isActive = index === active

              return (
                <motion.button
                  key={certification.name}
                  type="button"
                  onClick={() => setActive(index)}
                  whileHover={{ y: -3 }}
                  className={`text-left glass hud-corner rounded p-4 transition ${
                    isActive ? 'border-fuchsia-400/70 shadow-[0_0_30px_-8px_rgba(217,70,239,0.6)]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-widest text-fuchsia-300">{certification.tag}</span>
                    <BookOpen className="h-3.5 w-3.5 text-white/40" />
                  </div>
                  <div className="mt-2 font-display text-sm font-bold text-white leading-tight">{certification.name}</div>
                  <div className="mt-1 text-[11px] text-white/50">{certification.org}</div>
                  <div className="mt-2 text-[12px] text-white/60 leading-relaxed">{certification.summary}</div>
                </motion.button>
              )
            })}
          </div>

          <div className="flex flex-col gap-3">
            <div className="glass-magenta hud-corner rounded p-4">
              <div className="font-mono text-[10px] tracking-widest text-fuchsia-300">// ACTIVE RECORD</div>
              <div className="mt-3 font-display text-lg font-bold text-white">{selectedCertification.name}</div>
              <div className="mt-1 text-[12px] text-fuchsia-200/80">{selectedCertification.org}</div>
              <p className="mt-3 text-sm text-white/75 leading-relaxed">{selectedCertification.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedCertification.skills.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 rounded border border-fuchsia-400/25 text-xs text-fuchsia-100/90 font-mono">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <ArchiveStatTile label="CERTS" value={CERTIFICATIONS.length.toString().padStart(2, '0')} />
              <ArchiveStatTile label="SCHOOLS" value={EDUCATION.length.toString().padStart(2, '0')} />
              <ArchiveStatTile label="LANGS" value={LANGUAGES.length.toString().padStart(2, '0')} />
            </div>

            <div className="glass-magenta hud-corner rounded p-4">
              <div className="font-mono text-[10px] tracking-widest text-fuchsia-300">// ACADEMIC RECORD</div>
              <div className="mt-3 space-y-3">
                {EDUCATION.map((entry) => (
                  <div key={`${entry.school}-${entry.degree}`} className="border-l-2 border-fuchsia-400/40 pl-3">
                    <div className="font-display text-sm font-bold text-white">{entry.degree}</div>
                    <div className="text-[12px] text-white/65">{entry.school}</div>
                    <div className="text-[10px] font-mono tracking-widest text-white/40 mt-0.5">
                      {entry.dates} / {entry.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded p-4">
              <div className="font-mono text-[10px] tracking-widest text-cyan-300">// LANGUAGES</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {LANGUAGES.map((language) => (
                  <span key={language.name} className="px-2.5 py-1 rounded border border-cyan-400/30 text-xs text-cyan-100/90 font-mono">
                    {language.name} <span className="text-white/40">/</span> <span className="text-amber-200">{language.level}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function ContactSection() {
  const { ref, contentY, contentOpacity } = useSectorMotion()

  return (
    <section ref={ref} id="contact" data-sector="contact" className="relative min-h-screen w-full overflow-hidden flex items-center">
      <div className="absolute inset-0 cyber-grid opacity-45 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 container px-6 md:px-10 py-24">
        <SectionHeading
          code="06"
          title="OPEN A CHANNEL"
          accent="cyan"
          sub="Mission briefings, collaborations, product builds, or intelligence drops. When the signal is clear, transmit."
        />

        <div className="mt-10 grid md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-4">
            <ContactDeck resumeHref={HERO.contact.resume} />

            <div className="glass hud-corner rounded p-5">
              <div className="font-mono text-[10px] tracking-widest text-cyan-300">// TRANSMISSION PROTOCOL</div>
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                {CONTACT_PROTOCOLS.map((protocol) => (
                  <ProtocolCard key={protocol.title} {...protocol} />
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={HERO.contact.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-cyan-400/35 text-cyan-100 hover:bg-cyan-500/10"
                >
                  <Download className="h-4 w-4" />
                  OPEN DOSSIER
                </a>
                <a
                  href={`mailto:${HERO.contact.email}?subject=Portfolio%20Inquiry`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-fuchsia-400/35 text-fuchsia-100 hover:bg-fuchsia-500/10"
                >
                  <Send className="h-4 w-4" />
                  SEND BRIEF
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="glass hud-corner rounded p-5">
              <div className="font-mono text-[10px] tracking-widest text-cyan-300">// MANIFESTO</div>
              <p className="mt-3 text-white/80 leading-relaxed text-sm">
                I build at the intersection of <span className="neon-cyan">logic</span>, <span className="neon-magenta">automation</span>, and{' '}
                <span className="neon-amber">intelligent design</span>. From algorithmic engines to encrypted networks to adaptive AI systems,
                the goal is always the same: build software that stays coherent under pressure and still feels human in intent.
              </p>
              <div className="mt-5 flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/40">
                <Send className="h-3 w-3 text-cyan-300" />
                END OF TRANSMISSION / DROP A SIGNAL
              </div>
            </div>

            <div className="glass rounded p-5">
              <div className="font-mono text-[10px] tracking-widest text-amber-300">// COLLABORATION ZONES</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {SECTORS.slice(1).map((sector) => (
                  <span
                    key={sector.id}
                    className="px-2.5 py-1 rounded border border-amber-400/25 text-xs text-amber-100/90 font-mono tracking-wider"
                  >
                    {sector.label}
                  </span>
                ))}
              </div>
              <a
                href={HERO.contact.linkedin}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-white/70 hover:text-cyan-200"
              >
                Continue on LinkedIn
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center font-mono text-[10px] tracking-widest text-white/30">
          BUILT WITH NEXT.JS / THREE.JS / FRAMER MOTION / {new Date().getFullYear()} DIPTANGKUSH DAS
        </div>
      </motion.div>
    </section>
  )
}

const App = () => {
  const [mission, setMission] = useState(null)
  const [activeSector, setActiveSector] = useState('hero')
  const [sound, setSound] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const previousBehavior = root.style.scrollBehavior
    const previousPadding = root.style.scrollPaddingTop

    root.style.scrollBehavior = 'smooth'
    root.style.scrollPaddingTop = '88px'

    return () => {
      root.style.scrollBehavior = previousBehavior
      root.style.scrollPaddingTop = previousPadding
    }
  }, [])

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('section[data-sector]'))
    let frameId = 0

    const updateActiveSector = () => {
      const viewportCenter = window.innerHeight * 0.5
      let closestSector = sections[0]?.dataset.sector || 'hero'
      let closestDistance = Number.POSITIVE_INFINITY

      sections.forEach((section) => {
        const bounds = section.getBoundingClientRect()
        const center = bounds.top + bounds.height / 2
        const distance = Math.abs(center - viewportCenter)

        if (distance < closestDistance) {
          closestDistance = distance
          closestSector = section.dataset.sector || closestSector
        }
      })

      setActiveSector((current) => (current === closestSector ? current : closestSector))
      frameId = 0
    }

    const requestUpdate = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(updateActiveSector)
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  const jumpTo = (id) => {
    const element = document.getElementById(id)
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="relative isolate">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <Suspense fallback={null}>
          <GlobalBackground3D />
        </Suspense>
      </div>

      <TopHUD activeSector={activeSector} sound={sound} toggleSound={() => setSound((current) => !current)} />
      <SideNavigator activeSector={activeSector} onJump={jumpTo} />

      <HeroSection />
      <ShadowSection onSelect={setMission} />
      <WebSection onSelect={setMission} />
      <CyberSection onSelect={setMission} />
      <DataSection />
      <ArchiveSection />
      <ContactSection />

      <AnimatePresence>{mission ? <MissionModal data={mission} onClose={() => setMission(null)} /> : null}</AnimatePresence>
    </main>
  )
}

export default App
