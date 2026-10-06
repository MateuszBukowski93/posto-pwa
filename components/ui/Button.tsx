import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger';

const base =
  'inline-flex min-h-14 items-center justify-center gap-2 rounded-[18px] px-[18px] text-center font-sans font-bold no-underline transition-opacity disabled:cursor-not-allowed aria-disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary: 'border-none bg-btn text-base text-btn-text disabled:opacity-40 aria-disabled:opacity-40',
  secondary: 'border border-line bg-surface text-[15px] text-ink',
  outline: 'border border-line bg-transparent text-base text-ink',
  danger: 'border-none bg-accent-text text-base text-btn-text disabled:opacity-40',
};

export function buttonClass(variant: Variant = 'primary', extra = ''): string {
  return `${base} ${variants[variant]} ${extra}`.trim();
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ variant = 'primary', className = '', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...rest} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant };

export function ButtonLink({ variant = 'primary', className = '', ...rest }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, className)} {...rest} />;
}
