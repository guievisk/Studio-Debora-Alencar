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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
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

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>
      </header>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <button
            className={styles.mobileClose}
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          >
            ×
          </button>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={pathname === link.href ? styles.mobileLinkActive : styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <Link href="/contato" className={styles.mobileCta} onClick={() => setMenuOpen(false)}>
            Agendar Horário
          </Link>
        </div>
      )}
    </>
  );
}