import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <span className="logo-window">
      <Image
        src="/aspire.png"
        width={500}
        height={500}
        alt="Aspire Classes"
        className="logo-image"
        priority
      />
    </span>
  );
}

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Aspire Classes home">
      <Logo />
    </Link>
  );
}
