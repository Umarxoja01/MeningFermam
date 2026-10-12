import Link from "next/link";

/** "#aloqa" — joriy sahifadagi footer; "/#yem" — bosh sahifa bo'limi (ichki sahifadan ham ishlaydi, §6). */
export function NavLink({ href, className, children, ...rest }: { href: string; className?: string; children: React.ReactNode } & React.AriaAttributes) {
  if (href.startsWith("#")) return <a href={href} className={className} {...rest}>{children}</a>;
  return <Link href={href} className={className} {...rest}>{children}</Link>;
}
