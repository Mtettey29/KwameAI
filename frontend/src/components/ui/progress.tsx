import { cn } from '@/lib/utils'

type ProgressProps = {
  value: number
  className?: string
}

function Progress({ value, className }: ProgressProps) {
  return (
    <div className={cn('h-3 w-full overflow-hidden rounded-full bg-secondary', className)}>
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export { Progress }
