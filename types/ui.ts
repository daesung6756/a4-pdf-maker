import * as React from 'react'

export type DialogProps = {
  open?: boolean
  onOpenChange?: (v: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost'
}
