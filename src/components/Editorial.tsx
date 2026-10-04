import React from 'react';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export const EditorialCard: React.FC<DivProps & { accent?: boolean }> = ({ accent = false, className = '', ...props }) => (
  <div className={'editorial-card ' + (accent ? 'editorial-card-accent ' : '') + className} {...props} />
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export const EditorialButton: React.FC<ButtonProps & { variant?: 'primary' | 'secondary' | 'ghost' }> = ({ variant = 'primary', className = '', ...props }) => (
  <button className={'editorial-' + variant + ' inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold ' + className} {...props} />
);

export const EditorialInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function EditorialInput({ className = '', ...props }, ref) {
  return <input ref={ref} className={'editorial-input w-full border bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--foreground)] ' + className} {...props} />;
});

export const EditorialTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function EditorialTextarea({ className = '', ...props }, ref) {
  return <textarea ref={ref} className={'editorial-input w-full border bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--foreground)] ' + className} {...props} />;
});

export const SectionLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={'editorial-section-label ' + className}><span>{children}</span></div>
);

export const PageHeader: React.FC<{ eyebrow?: string; title: string; description?: string; actions?: React.ReactNode; className?: string }> = ({ eyebrow, title, description, actions, className = '' }) => (
  <header className={'space-y-2 ' + className}>
    {eyebrow && <p className="small-caps text-[var(--accent)]">{eyebrow}</p>}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="editorial-title text-3xl sm:text-4xl">{title}</h1>
        {description && <p className="editorial-subtitle mt-3">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  </header>
);

export const Rule: React.FC<{ className?: string }> = ({ className = '' }) => <div aria-hidden="true" className={'editorial-rule ' + className} />;

export const StatCard: React.FC<{ label: string; value: React.ReactNode; detail?: string; className?: string }> = ({ label, value, detail, className = '' }) => (
  <EditorialCard className={'p-4 ' + className}>
    <p className="small-caps text-[var(--muted-foreground)]">{label}</p>
    <p className="mt-2 font-mono text-2xl font-medium text-[var(--foreground)]">{value}</p>
    {detail && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{detail}</p>}
  </EditorialCard>
);

export const EmptyState: React.FC<{ title: string; description: string; icon?: React.ReactNode; action?: React.ReactNode; className?: string }> = ({ title, description, icon, action, className = '' }) => (
  <div className={'border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-14 text-center ' + className}>
    {icon && <div className="mx-auto mb-4 text-[var(--accent)]">{icon}</div>}
    <h2 className="font-serif text-2xl text-[var(--foreground)]">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const PageContainer: React.FC<DivProps & { wide?: boolean }> = ({ wide = false, className = '', ...props }) => (
  <div className={'editorial-page ' + (wide ? 'editorial-page-wide ' : '') + className} {...props} />
);