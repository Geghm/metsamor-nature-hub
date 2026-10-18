import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function SiteLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  if (href === "/") return <Link to="/" className={className}>{children}</Link>;
  if (href === "/treasures") return <Link to="/treasures" className={className}>{children}</Link>;
  if (href === "/settlements") return <Link to="/settlements" className={className}>{children}</Link>;
  if (href === "/about") return <Link to="/about" className={className}>{children}</Link>;
  if (href === "/contact") return <Link to="/contact" className={className}>{children}</Link>;
  return <a href="/treasures" className={className}>{children}</a>;
}
