"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin-nav.module.css";

const TABS = [
  { label: "Visão Geral", href: "/admin" },
  { label: "Agenda", href: "/admin/agenda" },
  { label: "Configurações", href: "/admin/config" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={pathname === tab.href ? styles.tabActive : styles.tab}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}