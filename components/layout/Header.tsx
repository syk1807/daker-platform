"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTheme, saveTheme, getUser } from "@/lib/storage";

const NAV_LINKS = [
  { href: "/hackathons", label: "해커톤" },
  { href: "/camp", label: "팀원 모집" },
  { href: "/rankings", label: "랭킹" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const theme = getTheme();
    setDark(theme === "dark");
    if (theme === "dark") document.documentElement.classList.add("dark");
    const user = getUser();
    setNickname(user.nickname);
  }, []);

  const toggleTheme = () => {
    const next = dark ? "light" : "dark";
    setDark(!dark);
    saveTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400">
          <span className="text-2xl">🚀</span>
          DAKER
        </Link>

        {/* 데스크탑 네비 */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 우측 아이콘 */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden md:flex">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link href="/my">
            <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-1">
              <User className="h-4 w-4" />
              {nickname ? nickname : "내 정보"}
            </Button>
          </Link>
          {/* 모바일 햄버거 */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                pathname.startsWith(link.href)
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {dark ? <Sun className="h-4 w-4 mr-1" /> : <Moon className="h-4 w-4 mr-1" />}
              {dark ? "라이트 모드" : "다크 모드"}
            </Button>
            <Link href="/my" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-1" />
                내 정보
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
