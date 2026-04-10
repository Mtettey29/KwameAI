import { cn } from '@/lib/utils'

type SeparatorProps = {
  className?: string
}

function Separator({ className }: SeparatorProps) {
  return <div className={cn('h-px w-full bg-border/80', className)} />
}

export { Separator }
