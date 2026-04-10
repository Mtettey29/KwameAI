'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  BadgeCheck,
  Bell,
  ChartColumn,
  ChevronDown,
  ChevronsRight,
  CircleDot,
  Compass,
  Landmark,
  LockKeyhole,
  LogOut,
  Moon,
  Phone,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  Upload,
  Sun,
  TrendingUp,
  User,
  WalletCards,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

export type DemoAccount = {
  name: string
  business_type: string
  phone_number: string
}

export type ConsentRequest = {
  request_id: number
  status: 'pending' | 'approved' | 'expired'
  phone_number: string
  masked_phone_number: string
  expires_at: string
  created_at: string
  approval_message: string
  demo_otp?: string
  vendor_preview: {
    name: string
    business_type: string
  } | null
}

export type Workspace = {
  vendor: {
    id: number
    name: string
    business_type: string
    momo_number: string
  }
  score: {
    trust_score: number
    rationale: string
    suggested_loan_limit: number
  }
  metrics: {
    total_incoming_90d: number
    incoming_count_90d: number
    active_days_90d: number
    repayment_count_90d: number
    consistency_ratio: number
  }
  transactions: Array<{
    id: number
    amount: number
    transaction_type: string
    description: string
    timestamp: string
  }>
  savings_plan: {
    weekly_auto_save: number
    goal: string
    momentum: string
    coach_tip: string
  }
  sync: {
    status: 'never_synced' | 'current' | 'stale'
    last_uploaded_at: string | null
    latest_transaction_at: string | null
    upload_count: number
    transaction_count: number
    provider: string | null
    refresh_hint: string
  }
  improvement_actions: string[]
}

export type StatementSync = Workspace['sync']

type FinanceDashboardProps = {
  isDark: boolean
  onToggleTheme: () => void
  onSignOut: () => void
  currentUserPhone: string
  loading: boolean
  signingOut: boolean
  submitting: boolean
  verifying: boolean
  error: string | null
  statusDetail: string | null
  demoAccounts: DemoAccount[]
  phoneNumber: string
  otpCode: string
  consentRequest: ConsentRequest | null
  workspace: Workspace | null
  statementSync: StatementSync | null
  statementProvider: string
  statementFileName: string | null
  uploadError: string | null
  uploadingStatement: boolean
  setPhoneNumber: (value: string) => void
  setOtpCode: (value: string) => void
  setStatementProvider: (value: string) => void
  onStatementFileSelected: (file: File | null) => void
  onUploadStatement: () => void
  onRequestConsent: () => void
  onVerifyConsent: () => void
}

type SidebarSection = 'Overview' | 'Consent' | 'Trust Score' | 'Savings' | 'Activity'

const currencyFormatter = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  maximumFractionDigits: 2,
})

export function FinanceDashboard(props: FinanceDashboardProps) {
  const {
    isDark,
    onToggleTheme,
    onSignOut,
    currentUserPhone,
    loading,
    signingOut,
    submitting,
    verifying,
    error,
    statusDetail,
    phoneNumber,
    otpCode,
    consentRequest,
    workspace,
    statementSync,
    statementProvider,
    statementFileName,
    uploadError,
    uploadingStatement,
    setPhoneNumber,
    setOtpCode,
    setStatementProvider,
    onStatementFileSelected,
    onUploadStatement,
    onRequestConsent,
    onVerifyConsent,
  } = props

  const [open, setOpen] = useState(true)
  const [selected, setSelected] = useState<SidebarSection>('Overview')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  useEffect(() => {
    if (!workspace) {
      setSelected('Consent')
    }
  }, [workspace])

  const notificationItems = workspace
    ? [
        `Trust score refreshed for ${workspace.vendor.name}.`,
        `Suggested savings sweep updated to ${currencyFormatter.format(workspace.savings_plan.weekly_auto_save)}.`,
        'Wallet activity is now ready for lender review.',
      ]
    : [
        'Your phone session is active.',
        'Complete wallet approval to unlock the finance workspace.',
      ]

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-full bg-[#ffffff] text-[#0f1419] dark:bg-[#000000] dark:text-[#e7e9ea]">
        <Sidebar open={open} setOpen={setOpen} selected={selected} setSelected={setSelected} />
        <div className="flex-1 overflow-auto bg-[#f7f9f9] px-4 py-4 dark:bg-[#000000] sm:px-6 sm:py-6">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Finance Workspace</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {workspace ? `${selected} for ${workspace.vendor.name}` : 'Connect your wallet access'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Signed in as {currentUserPhone}. Move between consent, scoring, savings, and activity without
                leaving the workspace.
              </p>
            </div>

            <div className="relative flex items-center gap-3">
              <button
                onClick={() => setNotificationsOpen((current) => !current)}
                className="relative rounded-2xl border border-border bg-card p-3 text-muted-foreground transition hover:text-foreground"
              >
                <Bell className="size-5" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-[#1d9bf0]" />
              </button>
              <button
                onClick={onToggleTheme}
                className="rounded-2xl border border-border bg-card p-3 text-muted-foreground transition hover:text-foreground"
              >
                {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </button>
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen((current) => !current)}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition hover:border-primary/35 hover:bg-muted/30"
                >
                  <div className="grid size-9 place-content-center rounded-full bg-primary/12 text-primary">
                    <User className="size-4" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold">{currentUserPhone}</p>
                    <p className="text-xs text-muted-foreground">Verified session</p>
                  </div>
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileMenuOpen ? (
                  <div className="absolute right-0 top-18 z-20 w-64 rounded-[24px] border border-border bg-card p-3 shadow-2xl">
                    <div className="rounded-2xl bg-background px-4 py-3">
                      <p className="text-sm font-semibold">{currentUserPhone}</p>
                      <p className="text-xs text-muted-foreground">Firebase phone session</p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false)
                        onSignOut()
                      }}
                      className="mt-3 flex w-full items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium transition hover:border-primary/30 hover:bg-muted/30"
                      disabled={signingOut}
                    >
                      <span>{signingOut ? 'Signing out...' : 'Log out'}</span>
                      <LogOut className="size-4 text-muted-foreground" />
                    </button>
                  </div>
                ) : null}
              </div>

              {notificationsOpen ? (
                <div className="absolute right-0 top-16 z-20 w-80 rounded-[24px] border border-border bg-card p-4 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Notifications</p>
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                      {notificationItems.length}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-3">
                    {notificationItems.map((item) => (
                      <div key={item} className="rounded-2xl border border-border bg-background p-3 text-sm leading-6">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {renderSection({
            selected,
            loading,
            submitting,
            verifying,
            error,
            statusDetail,
            phoneNumber,
            otpCode,
            consentRequest,
            workspace,
            statementSync,
            statementProvider,
            statementFileName,
            uploadError,
            uploadingStatement,
            setPhoneNumber,
            setOtpCode,
            setStatementProvider,
            onStatementFileSelected,
            onUploadStatement,
            onRequestConsent,
            onVerifyConsent,
          })}
        </div>
      </div>
    </div>
  )
}

function renderSection({
  selected,
  ...props
}: {
  selected: SidebarSection
} & Omit<
  FinanceDashboardProps,
  'isDark' | 'onToggleTheme' | 'onSignOut' | 'currentUserPhone' | 'demoAccounts' | 'signingOut'
>) {
  switch (selected) {
    case 'Overview':
      return <OverviewSection workspace={props.workspace} />
    case 'Consent':
      return <ConsentSection {...props} />
    case 'Trust Score':
      return <TrustScoreSection workspace={props.workspace} />
    case 'Savings':
      return <SavingsSection workspace={props.workspace} />
    case 'Activity':
      return <ActivitySection workspace={props.workspace} />
    default:
      return <OverviewSection workspace={props.workspace} />
  }
}

function Sidebar({
  open,
  setOpen,
  selected,
  setSelected,
}: {
  open: boolean
  setOpen: (value: boolean) => void
  selected: SidebarSection
  setSelected: (value: SidebarSection) => void
}) {
  const items: Array<{ title: SidebarSection; icon: typeof ChartColumn; notifs?: number }> = [
    { title: 'Overview', icon: ChartColumn },
    { title: 'Consent', icon: LockKeyhole, notifs: 1 },
    { title: 'Trust Score', icon: BadgeCheck },
    { title: 'Savings', icon: PiggyBank },
    { title: 'Activity', icon: Activity },
  ]
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)

  return (
    <nav
      className={`sticky top-0 hidden h-screen shrink-0 border-r border-border bg-card/95 p-2 shadow-sm backdrop-blur lg:block ${
        open ? 'w-72' : 'w-20'
      } transition-all duration-300`}
    >
      <div className="mb-6 border-b border-border pb-4">
        <div className="relative">
          <button
            onClick={() => {
              if (open) {
                setWorkspaceMenuOpen((current) => !current)
              } else {
                setOpen(true)
              }
            }}
            className="flex w-full items-center justify-between rounded-2xl p-2 text-left transition-colors hover:bg-muted/40"
          >
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-content-center rounded-2xl bg-[#1d9bf0] text-white">
                <WalletCards className="size-5" />
              </div>
              {open ? (
                <div>
                  <span className="block text-sm font-semibold">Beyond the Wallet</span>
                  <span className="block text-xs text-muted-foreground">Finance OS</span>
                </div>
              ) : null}
            </div>
            {open ? (
              <ChevronDown
                className={`size-4 text-muted-foreground transition-transform ${
                  workspaceMenuOpen ? 'rotate-180' : ''
                }`}
              />
            ) : null}
          </button>

          {open && workspaceMenuOpen ? (
            <div className="mt-3 rounded-[24px] border border-border bg-card p-3 shadow-xl">
              <button
                onClick={() => {
                  setSelected('Overview')
                  setWorkspaceMenuOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-muted/40"
              >
                <div className="grid size-9 place-content-center rounded-2xl bg-primary/10 text-primary">
                  <Compass className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Workspace home</p>
                  <p className="text-xs text-muted-foreground">Jump to the full operating overview.</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelected('Consent')
                  setWorkspaceMenuOpen(false)
                }}
                className="mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-muted/40"
              >
                <div className="grid size-9 place-content-center rounded-2xl bg-primary/10 text-primary">
                  <LockKeyhole className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Consent center</p>
                  <p className="text-xs text-muted-foreground">Request or verify wallet approval.</p>
                </div>
              </button>

              <div className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">Workspace status</p>
                  <p className="text-xs text-muted-foreground">Finance OS is online and ready.</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <CircleDot className="size-3" />
                  Live
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-1">
        {items.map((item) => (
          <SidebarOption
            key={item.title}
            icon={item.icon}
            title={item.title}
            selected={selected}
            setSelected={setSelected}
            open={open}
            notifs={item.notifs}
          />
        ))}
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="absolute bottom-0 left-0 right-0 border-t border-border transition-colors hover:bg-muted/40"
      >
        <div className="flex items-center p-3">
          <div className="grid size-10 place-content-center">
            <ChevronsRight className={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
          {open ? <span className="text-sm font-medium text-muted-foreground">Collapse</span> : null}
        </div>
      </button>
    </nav>
  )
}

function SidebarOption({
  icon: Icon,
  title,
  selected,
  setSelected,
  open,
  notifs,
}: {
  icon: typeof ChartColumn
  title: SidebarSection
  selected: SidebarSection
  setSelected: (value: SidebarSection) => void
  open: boolean
  notifs?: number
}) {
  const active = selected === title

  return (
    <button
      onClick={() => setSelected(title)}
      className={`relative flex h-11 w-full items-center rounded-2xl transition-all ${
        active
          ? 'bg-[#e8f5fe] text-[#1d9bf0] shadow-sm ring-1 ring-[#bee3f8] dark:bg-[#0a171f] dark:text-[#1d9bf0] dark:ring-[#1d9bf0]/20'
          : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
      }`}
    >
      <div className="grid h-full w-12 place-content-center">
        <Icon className="size-4" />
      </div>
      {open ? <span className="text-sm font-medium">{title}</span> : null}
      {notifs && open ? (
        <span className="absolute right-3 flex size-5 items-center justify-center rounded-full bg-[#1d9bf0] text-xs text-white">
          {notifs}
        </span>
      ) : null}
    </button>
  )
}

function OverviewSection({ workspace }: { workspace: Workspace | null }) {
  if (!workspace) {
    return (
      <EmptyState
        title="Overview becomes available after wallet approval"
        description="Approve wallet access first, and the command center will populate with trust, savings, and activity insights."
      />
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-4">
        <MetricCard label="Trust score" value={`${workspace.score.trust_score}/100`} hint="Current underwriting signal" icon={BadgeCheck} />
        <MetricCard label="Working capital" value={currencyFormatter.format(workspace.score.suggested_loan_limit)} hint="Suggested operating range" icon={Landmark} />
        <MetricCard label="Weekly savings" value={currencyFormatter.format(workspace.savings_plan.weekly_auto_save)} hint="Auto-sweep recommendation" icon={PiggyBank} />
        <MetricCard
          label="Statement sync"
          value={workspace.sync.status === 'current' ? 'Current' : workspace.sync.status === 'stale' ? 'Refresh' : 'Upload'}
          hint={workspace.sync.refresh_hint}
          icon={RefreshCw}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <HeroPanel workspace={workspace} />
        <CoachPanel workspace={workspace} />
      </section>
    </div>
  )
}

function ConsentSection({
  loading,
  submitting,
  verifying,
  error,
  statusDetail,
  phoneNumber,
  otpCode,
  consentRequest,
  workspace,
  statementSync,
  statementProvider,
  statementFileName,
  uploadError,
  uploadingStatement,
  setPhoneNumber,
  setOtpCode,
  setStatementProvider,
  onStatementFileSelected,
  onUploadStatement,
  onRequestConsent,
  onVerifyConsent,
}: Omit<
  FinanceDashboardProps,
  'isDark' | 'onToggleTheme' | 'onSignOut' | 'currentUserPhone' | 'demoAccounts' | 'signingOut'
>) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.88fr]">
      <section className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <MetricCard label="Wallet status" value={workspace ? 'Approved' : consentRequest?.status ?? 'Ready'} hint="Approval gates analysis" icon={ShieldCheck} />
          <MetricCard label="Supported networks" value="MTN / AT / Telecel" hint="Current supported Ghana flows" icon={Phone} />
          <MetricCard label="Access scope" value="Transactions + score" hint="Consent unlocks both layers" icon={LockKeyhole} />
        </div>

        <section className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Wallet approval</p>
              <h2 className="mt-2 text-2xl font-semibold">Approve data access</h2>
            </div>
            <Badge variant="outline" className="rounded-full px-4 py-1">
              Consent required
            </Badge>
          </div>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="wallet-phone-number">
                Wallet phone number
              </label>
              <Input
                id="wallet-phone-number"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="233501234567"
                className="h-12 rounded-2xl"
              />
            </div>

            <Button size="lg" className="w-full rounded-2xl" onClick={onRequestConsent} disabled={submitting || loading}>
              {submitting ? 'Sending wallet code...' : 'Request wallet approval'}
            </Button>

            {statusDetail ? <StatusBanner tone="info">{statusDetail}</StatusBanner> : null}
            {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}

            {consentRequest?.status === 'pending' ? (
              <div className="rounded-[28px] border border-border bg-background p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="rounded-full px-3 py-1" variant="secondary">
                    Approval requested for {consentRequest.masked_phone_number}
                  </Badge>
                  {consentRequest.vendor_preview ? (
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                      {consentRequest.vendor_preview.name}
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium" htmlFor="wallet-otp-code">
                    Approval code
                  </label>
                  <Input
                    id="wallet-otp-code"
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value)}
                    placeholder="Enter 6-digit code"
                    className="h-12 rounded-2xl tracking-[0.3em]"
                  />
                </div>

                <Button size="lg" variant="secondary" className="mt-4 w-full rounded-2xl" onClick={onVerifyConsent} disabled={verifying}>
                  {verifying ? 'Verifying wallet...' : 'Unlock finance workspace'}
                </Button>
              </div>
            ) : null}
          </div>
        </section>
      </section>

      <section className="space-y-6">
        <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">What approval unlocks</p>
          <div className="mt-5 space-y-4">
            <WhyCard icon={BadgeCheck} title="Trust scoring" description="Transaction rhythm and repayment behavior become underwriter-readable." />
            <WhyCard icon={PiggyBank} title="Savings planning" description="The app recommends a weekly sweep tied to observed cash-flow strength." />
            <WhyCard icon={Activity} title="Activity intelligence" description="Recent wallet events are organized into a lender-friendly operating view." />
          </div>
        </div>

        {workspace ? (
          <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Current consent state</p>
            <div className="mt-4 rounded-[24px] bg-background p-5">
              <p className="text-xl font-semibold">Approved for {workspace.vendor.name}</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                The wallet is connected and ready for scoring, savings guidance, and activity review.
              </p>
            </div>
          </div>
        ) : null}

        <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Statement sync</p>
              <h2 className="mt-2 text-2xl font-semibold">Upload a wallet statement</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Statements are the web-safe way to refresh your latest MoMo activity across Android and iPhone.
              </p>
            </div>
            <Badge variant="outline" className="rounded-full px-4 py-1">
              {statementSync?.status === 'current' ? 'Up to date' : statementSync?.status === 'stale' ? 'Refresh needed' : 'Ready'}
            </Badge>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium">Provider</span>
              <select
                value={statementProvider}
                onChange={(event) => setStatementProvider(event.target.value)}
                className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus:border-ring"
              >
                <option value="MTN MoMo">MTN MoMo</option>
                <option value="Telecel Cash">Telecel Cash</option>
                <option value="AirtelTigo Money">AirtelTigo Money</option>
              </select>
            </label>

            <div className="space-y-2">
              <span className="text-sm font-medium">Statement file</span>
              <label className="flex h-12 cursor-pointer items-center justify-between rounded-2xl border border-input bg-background px-4 text-sm text-muted-foreground transition hover:border-primary/35">
                <span className="truncate">{statementFileName ?? 'Choose PDF, CSV, or TXT statement'}</span>
                <Upload className="size-4 text-primary" />
                <input
                  type="file"
                  accept=".pdf,.csv,.txt"
                  className="hidden"
                  onChange={(event) => onStatementFileSelected(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>

          <Button
            size="lg"
            variant="secondary"
            className="mt-5 w-full rounded-2xl"
            onClick={onUploadStatement}
            disabled={uploadingStatement}
          >
            {uploadingStatement ? 'Syncing statement...' : 'Upload statement and refresh workspace'}
          </Button>

          {uploadError ? <StatusBanner tone="error">{uploadError}</StatusBanner> : null}

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <SyncTile label="Last upload" value={formatSyncValue(statementSync?.last_uploaded_at, 'Not yet')} />
            <SyncTile label="Latest activity" value={formatSyncValue(statementSync?.latest_transaction_at, 'No ledger yet')} />
            <SyncTile label="Uploads" value={`${statementSync?.upload_count ?? 0}`} />
          </div>

          <div className="mt-4 rounded-[24px] border border-border bg-background p-4 text-sm leading-7 text-muted-foreground">
            {statementSync?.refresh_hint ?? 'Upload your first statement to create a refreshable wallet ledger.'}
          </div>
        </div>
      </section>
    </div>
  )
}

function TrustScoreSection({ workspace }: { workspace: Workspace | null }) {
  if (!workspace) {
    return (
      <EmptyState
        title="Trust score is waiting on wallet approval"
        description="Once consent is approved, the score page will show underwriting strength, rationale, and lender-facing confidence signals."
      />
    )
  }

  return (
    <div className="space-y-6">
      <HeroPanel workspace={workspace} />
      <section className="grid gap-6 lg:grid-cols-4">
        <MetricCard label="Incoming volume" value={currencyFormatter.format(workspace.metrics.total_incoming_90d)} hint="Last 90 days" icon={WalletCards} />
        <MetricCard label="Repayment events" value={`${workspace.metrics.repayment_count_90d}`} hint="Supplier and bill discipline" icon={ShieldCheck} />
        <MetricCard label="Active days" value={`${workspace.metrics.active_days_90d}/90`} hint="Visible selling frequency" icon={Activity} />
        <MetricCard label="Consistency ratio" value={`${Math.round(workspace.metrics.consistency_ratio * 100)}%`} hint="Sales reliability signal" icon={TrendingUp} />
      </section>
    </div>
  )
}

function SavingsSection({ workspace }: { workspace: Workspace | null }) {
  if (!workspace) {
    return (
      <EmptyState
        title="Savings guidance appears after approval"
        description="Approve wallet access first so the app can recommend a credible weekly sweep and restock buffer plan."
      />
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
      <section className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Savings engine</p>
        <div className="mt-5 rounded-[28px] bg-[linear-gradient(135deg,rgba(29,155,240,0.15),rgba(255,255,255,0.1))] p-6 dark:bg-[linear-gradient(135deg,rgba(29,155,240,0.18),rgba(255,255,255,0.02))]">
          <p className="text-3xl font-semibold">{currencyFormatter.format(workspace.savings_plan.weekly_auto_save)}</p>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">Suggested weekly sweep</p>
          <p className="mt-6 text-lg font-medium">Goal: {workspace.savings_plan.goal}</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{workspace.savings_plan.coach_tip}</p>
        </div>
      </section>

      <section className="space-y-6">
        <MetricCard label="Momentum" value={workspace.savings_plan.momentum} hint="Current savings readiness level" icon={TrendingUp} />
        <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Next moves</p>
          <div className="mt-5 space-y-3">
            {workspace.improvement_actions.map((action) => (
              <div key={action} className="rounded-[24px] border border-border bg-background p-4 text-sm leading-7">
                {action}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function ActivitySection({ workspace }: { workspace: Workspace | null }) {
  if (!workspace) {
    return (
      <EmptyState
        title="Activity feed unlocks after wallet approval"
        description="Once the wallet is connected, this page will populate with recent transaction activity and operating behavior."
      />
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Wallet timeline</p>
            <h2 className="mt-2 text-2xl font-semibold">Recent activity</h2>
          </div>
          <Badge variant="outline" className="rounded-full px-4 py-1">
            Live
          </Badge>
        </div>

        <div className="mt-5 space-y-3">
          {workspace.transactions.map((transaction) => (
            <div key={transaction.id} className="grid gap-3 rounded-[24px] border border-border bg-background p-4 md:grid-cols-[0.8fr_1.2fr_0.7fr_0.7fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Date</p>
                <p className="mt-1 font-medium">
                  {new Date(transaction.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Description</p>
                <p className="mt-1 font-medium">{transaction.description}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Type</p>
                <p className={`mt-1 font-medium ${transaction.transaction_type === 'incoming' ? 'text-[#1d9bf0]' : 'text-rose-500'}`}>
                  {transaction.transaction_type}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Amount</p>
                <p className="mt-1 font-medium">{currencyFormatter.format(transaction.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CoachPanel workspace={workspace} />
    </div>
  )
}

function HeroPanel({ workspace }: { workspace: Workspace }) {
  return (
    <section className="rounded-[32px] border border-[#bfdfff] bg-[linear-gradient(135deg,#0f1419_0%,#15202b_55%,#1d9bf0_180%)] p-6 text-white shadow-[0_24px_80px_rgba(15,20,25,0.26)]">
      <Badge className="rounded-full bg-white/12 px-4 py-1 text-white" variant="secondary">
        {workspace.vendor.business_type}
      </Badge>
      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/60">Trust score</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-7xl font-bold leading-none">{workspace.score.trust_score}</span>
            <span className="pb-2 text-lg text-white/60">/100</span>
          </div>
          <Progress value={workspace.score.trust_score} className="mt-4 bg-white/12" />
        </div>
        <div>
          <h2 className="font-serif text-4xl leading-tight text-white">
            {workspace.vendor.name} has visible commercial strength.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">{workspace.score.rationale}</p>
        </div>
      </div>
    </section>
  )
}

function CoachPanel({ workspace }: { workspace: Workspace }) {
  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Coach notes</p>
        <div className="mt-5 space-y-3">
          {workspace.improvement_actions.map((action) => (
            <div key={action} className="rounded-[24px] border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-0.5 size-5 text-[#1d9bf0]" />
                <p className="text-sm leading-7">{action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Savings posture</p>
        <div className="mt-5 rounded-[24px] bg-[linear-gradient(135deg,rgba(29,155,240,0.12),rgba(255,255,255,0.05))] p-5 dark:bg-[linear-gradient(135deg,rgba(29,155,240,0.16),rgba(255,255,255,0.02))]">
          <p className="text-xl font-semibold">Goal: {workspace.savings_plan.goal}</p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{workspace.savings_plan.coach_tip}</p>
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-card/80 px-4 py-3">
            <span className="text-sm text-muted-foreground">Suggested sweep</span>
            <span className="font-semibold">{currencyFormatter.format(workspace.savings_plan.weekly_auto_save)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint: string
  icon: typeof ShieldCheck
}) {
  return (
    <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="grid size-11 place-content-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <TrendingUp className="size-4 text-[#1d9bf0]" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{hint}</p>
    </div>
  )
}

function SyncTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-border bg-background p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  )
}

function WhyCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof LockKeyhole
  title: string
  description: string
}) {
  return (
    <div className="rounded-[24px] border border-border bg-background p-4">
      <div className="flex items-start gap-4">
        <div className="grid size-10 place-content-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[32px] border border-border bg-card p-8 shadow-sm">
      <p className="text-2xl font-semibold">{title}</p>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  )
}

function StatusBanner({
  tone,
  children,
}: {
  tone: 'info' | 'error'
  children: string
}) {
  const classes =
    tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200'
      : 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200'

  return <div className={`rounded-2xl border p-4 text-sm ${classes}`}>{children}</div>
}

function formatSyncValue(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback
  }

  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
