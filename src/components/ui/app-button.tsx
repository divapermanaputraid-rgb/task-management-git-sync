import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type AppButtonVariant = "primary" | "secondary" | "ghost";

type AppButtonBaseProps = {
  children: ReactNode;
  className?: string;
  variant?: AppButtonVariant;
};

type AppButtonLinkProps = AppButtonBaseProps & {
  href: string;
};

type AppButtonElementProps = AppButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "href">;

function getButtonClasses(variant: AppButtonVariant, className?: string) {
  const variantClasses = {
    primary:
      "bg-[#f0a832] text-[#1a1a1f] hover:brightness-105 focus-visible:ring-[#f0a832]/40",
    secondary:
      "border border-white/10 bg-[#222228] text-white/88 hover:bg-[#28282f] focus-visible:ring-white/20",
    ghost:
      "border border-transparent bg-transparent text-white/58 hover:bg-white/5 hover:text-white focus-visible:ring-white/20",
  };

  return [
    "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function AppButton(props: AppButtonLinkProps | AppButtonElementProps) {
  const variant = props.variant ?? "primary";
  const classes = getButtonClasses(variant, props.className);

  if ("href" in props) {
    const { href, children } = props;

    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const {
    children,
    type = "button",
    variant: _variant,
    className: _className,
    ...buttonProps
  } = props;

  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
