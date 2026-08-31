import Link from "next/link";

type OpenLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function OpenLink({
  href,
  children,
}: Readonly<OpenLinkProps>) {
  return (
    <Link
      href={href}
      className="inline-flex cursor-pointer items-center text-emerald-400"
    >
      {children}
      <svg width={16} height={16} viewBox="0 0 100 100"
      className="pointer-events-none">
        <path
          d="M50 0 L95 50 L50 95"
          fill="none"
          stroke="currentColor"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}