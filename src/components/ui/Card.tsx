import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  header?: ReactNode
  className?: string
}

export function Card({ children, header, className }: CardProps) {
  const classes = className ? `card ${className}` : 'card'

  return (
    <article className={classes}>
      {header ? <header className="card-header">{header}</header> : null}
      <div className="card-body">{children}</div>
    </article>
  )
}
