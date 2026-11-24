import type { ReactNode } from 'react';

export function Section({ title, footer, children }: { title?: string; footer?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-7">
      {title && (
        <h2 className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-ios-secondary">{title}</h2>
      )}
      <div className="overflow-hidden rounded-ios bg-ios-card shadow-sm">{children}</div>
      {footer && <p className="px-4 pt-2 text-xs text-ios-secondary">{footer}</p>}
    </section>
  );
}

export function Row({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-3 border-b border-ios-sep px-4 py-3 last:border-b-0 ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'plain' | 'danger';
  disabled?: boolean;
  className?: string;
}) {
  const styles = {
    primary: 'bg-ios-blue text-white active:opacity-80',
    plain: 'text-ios-blue active:opacity-50',
    danger: 'text-ios-red active:opacity-50',
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-2 text-base font-medium transition disabled:opacity-40 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-transparent text-base text-ios-label placeholder:text-ios-secondary focus:outline-none ${props.className ?? ''}`}
    />
  );
}
