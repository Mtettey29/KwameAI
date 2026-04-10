'use client'

import { motion } from 'framer-motion'
import {
  ChevronLeftIcon,
  LockKeyhole,
  Moon,
  PhoneCall,
  ShieldCheck,
  Sun,
  WalletCards,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type AuthPageProps = {
  isDark: boolean
  onToggleTheme: () => void
  isFirebaseConfigured: boolean
  authLoading: boolean
  authSubmitting: boolean
  authVerifying: boolean
  authError: string | null
  loginPhoneNumber: string
  loginOtpCode: string
  confirmationPending: boolean
  setLoginPhoneNumber: (value: string) => void
  setLoginOtpCode: (value: string) => void
  onSendOtp: () => void
  onVerifyOtp: () => void
}

export function AuthPage({
  isDark,
  onToggleTheme,
  isFirebaseConfigured,
  authLoading,
  authSubmitting,
  authVerifying,
  authError,
  loginPhoneNumber,
  loginOtpCode,
  confirmationPending,
  setLoginPhoneNumber,
  setLoginOtpCode,
  onSendOtp,
  onVerifyOtp,
}: AuthPageProps) {
  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      <div className="relative hidden h-full flex-col overflow-hidden border-r border-border/60 bg-[#f7f9f9] p-10 text-[#0f1419] lg:flex dark:bg-[#000000] dark:text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(29,155,240,0.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_26%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(29,155,240,0.28),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_26%)]" />
        <div className="z-10 flex items-center gap-3">
          <div className="grid size-11 place-content-center rounded-2xl bg-[#1d9bf0]/12 text-[#1d9bf0] ring-1 ring-[#1d9bf0]/10 dark:bg-white/12 dark:text-white dark:ring-white/10">
            <WalletCards className="size-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#536471] dark:text-white/55">Beyond the Wallet</p>
            <p className="text-lg font-semibold">Alternative credit for everyday business</p>
          </div>
        </div>

        <div className="z-10 mt-14 max-w-xl">
          <Badge className="rounded-full bg-[#1d9bf0]/10 px-4 py-1 text-[#1d9bf0] dark:bg-white/12 dark:text-white" variant="secondary">
            Built for MTN, AirtelTigo, and Telecel users
          </Badge>
          <h1 className="mt-6 font-serif text-6xl leading-[0.92] tracking-tight text-[#0f1419] dark:text-white">
            Creditworthiness should not begin where paperwork happens.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#536471] dark:text-white/72">
            Sign in with your mobile number, connect the wallet activity you already use, and let Kwame
            turn your transaction rhythm into lending confidence and a disciplined savings path.
          </p>
        </div>

        <div className="z-10 mt-auto grid gap-4">
          <HeroPoint
            icon={ShieldCheck}
            title="Bank-grade access control"
            description="Authentication comes first, then wallet consent, then insights."
          />
          <HeroPoint
            icon={LockKeyhole}
            title="Consent before analysis"
            description="No score is shown until the wallet owner approves access."
          />
          <HeroPoint
            icon={PhoneCall}
            title="Phone-number native journey"
            description="No email-first detour. The experience starts where your business already lives."
          />
        </div>

        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      <div className="relative flex min-h-screen flex-col justify-center p-4 sm:p-8">
        <div
          aria-hidden
          className="absolute inset-0 isolate -z-10 opacity-80"
        >
          <div className="absolute right-[-8rem] top-[-10rem] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(29,155,240,0.16),transparent_62%)]" />
          <div className="absolute left-[-6rem] bottom-[-8rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(29,155,240,0.1),transparent_60%)]" />
        </div>

        <div className="absolute left-5 top-5 flex items-center gap-3">
          <Button variant="ghost" className="rounded-full" asChild>
            <a href="/">
              <ChevronLeftIcon className="me-2 size-4" />
              Home
            </a>
          </Button>
        </div>

        <div className="absolute right-5 top-5">
          <Button variant="ghost" className="rounded-full" onClick={onToggleTheme}>
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>

        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="grid size-10 place-content-center rounded-2xl bg-primary text-primary-foreground">
                <WalletCards className="size-5" />
              </div>
              <span className="text-lg font-semibold">Beyond the Wallet</span>
            </div>
            <h2 className="font-serif text-4xl tracking-tight">Welcome back</h2>
            <p className="text-base leading-7 text-muted-foreground">
              Use your mobile number to access your finance workspace and continue with wallet approval.
            </p>
          </div>

          {!isFirebaseConfigured ? (
            <div className="rounded-[28px] border border-amber-300 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
              Firebase phone authentication is not configured in the deployed build yet. Once the frontend
              is rebuilt with the Firebase keys, this screen will switch to live OTP sign-in automatically.
            </div>
          ) : (
            <div className="space-y-4 rounded-[32px] border border-border/70 bg-card p-6 shadow-[0_20px_60px_rgba(16,24,40,0.08)]">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="login-phone-number">
                  Mobile number
                </label>
                <Input
                  id="login-phone-number"
                  value={loginPhoneNumber}
                  onChange={(event) => setLoginPhoneNumber(event.target.value)}
                  placeholder="233501234567"
                  className="h-12 rounded-2xl"
                />
              </div>

              <div id="recaptcha-container" className="overflow-hidden rounded-3xl" />

              <Button
                type="button"
                size="lg"
                className="w-full rounded-2xl"
                disabled={authSubmitting || authLoading}
                onClick={onSendOtp}
              >
                {authSubmitting ? 'Sending secure code...' : 'Send login code'}
              </Button>

              {confirmationPending ? (
                <div className="space-y-3">
                  <label className="text-sm font-medium" htmlFor="login-otp-code">
                    Verification code
                  </label>
                  <Input
                    id="login-otp-code"
                    value={loginOtpCode}
                    onChange={(event) => setLoginOtpCode(event.target.value)}
                    placeholder="Enter 6-digit code"
                    className="h-12 rounded-2xl tracking-[0.3em]"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    className="w-full rounded-2xl"
                    disabled={authVerifying}
                    onClick={onVerifyOtp}
                  >
                    {authVerifying ? 'Verifying...' : 'Continue to workspace'}
                  </Button>
                </div>
              ) : null}

              {authError ? (
                <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                  {authError}
                </div>
              ) : null}
            </div>
          )}

          <p className="text-sm leading-6 text-muted-foreground">
            By continuing, you agree to our data access policy and consent terms for wallet-linked financial
            analysis.
          </p>
        </div>
      </div>
    </main>
  )
}

function HeroPoint({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShieldCheck
  title: string
  description: string
}) {
  return (
    <div className="rounded-[26px] border border-border bg-white/70 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/6">
      <div className="flex items-start gap-4">
        <div className="grid size-10 place-content-center rounded-2xl bg-[#1d9bf0]/10 text-[#1d9bf0] dark:bg-white/10 dark:text-white">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="font-semibold text-[#0f1419] dark:text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-[#536471] dark:text-white/68">{description}</p>
        </div>
      </div>
    </div>
  )
}

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    d: `M-${360 - i * 5 * position} -${180 + i * 6}C-${360 - i * 5 * position} -${180 + i * 6} -${302 - i * 5 * position} ${196 - i * 6} ${162 - i * 5 * position} ${330 - i * 6}C${604 - i * 5 * position} ${464 - i * 6} ${672 - i * 5 * position} ${860 - i * 6} ${672 - i * 5 * position} ${860 - i * 6}`,
    width: 0.5 + i * 0.04,
  }))

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg className="h-full w-full text-[#1d9bf0]/25 dark:text-white/45" viewBox="0 0 696 316" fill="none">
        <title>Animated background paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.08 + path.id * 0.015}
            initial={{ pathLength: 0.2, opacity: 0.25 }}
            animate={{
              pathLength: 1,
              opacity: [0.2, 0.45, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 18 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        ))}
      </svg>
    </div>
  )
}
