"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Sobre", href: "/sobre" },
  { label: "Serviços", href: "/servicos" },
  { label: "Galeria", href: "/galeria" },
  { label: "Contato", href: "/contato" },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <Link href="/" className={styles.logo}>
        <Image
          src="/Logo.png"
          alt="Débora Alencar Beauty"
          width={38}
          height={38}
          className={styles.logoCircle}
        />
        <div>
          <span className={styles.logoName}>Débora Alencar</span>
          <span className={styles.logoSub}>Beauty Studio</span>
        </div>
      </Link>

      <nav className={styles.nav}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={pathname === link.href ? styles.active : styles.link}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/contato" className={styles.cta}>
          Agendar →
        </Link>
      </nav>
    </header>
  );
}