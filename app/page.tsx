"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Trophy, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import HackathonCard from "@/components/hackathon/HackathonCard";
import { Card, CardContent } from "@/components/ui/card";
import { HackathonSummary, Team } from "@/types";
import { getHackathons, getTeams, getLeaderboards, initStorage } from "@/lib/storage";
import { hackathonSummaries } from "@/lib/data/hackathons";

const BANNERS = [
  {
    slug: "daker-handover-2026-03",
    gradient: "from-orange-500 via-red-500 to-pink-600",
    emoji: "🚨",
    label: "진행중 해커톤",
    title: "긴급 인수인계 해커톤",
    subtitle: "명세서만 보고 구현하라! 바이브 코딩으로 웹서비스를 완성하세요.",
  },
  {
    slug: "monthly-vibe-coding-2026-02",
    gradient: "from-cyan-500 via-blue-500 to-indigo-600",
    emoji: "🤖",
    label: "AI 아이디어 공모전",
    title: "월간 바이브 코딩 해커톤",
    subtitle: "바이브 코딩 경험을 개선하는 창의적인 아이디어를 제안하세요.",
  },
  {
    slug: "aimers-8-model-lite",
    gradient: "from-purple-500 via-violet-500 to-indigo-600",
    emoji: "⚡",
    label: "종료된 해커톤",
    title: "Aimers 8기 : 모델 경량화",
    subtitle: "성능과 속도를 함께 최적화하는 LLM 경량화 대회.",
  },
];

export default function HomePage() {
  const [hackathons, setHackathons] = useState<HackathonSummary[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [top3, setTop3] = useState<{ teamName: string; score: number; hackathon: string }[]>([]);

  useEffect(() => {
    initStorage();
    setHackathons(getHackathons());
    setTeams(getTeams().slice(0, 3));

    const lbs = getLeaderboards();
    const allEntries = lbs.flatMap((lb) => {
      const h = hackathonSummaries.find((hh) => hh.slug === lb.hackathonSlug);
      return lb.entries.map((e) => ({
        teamName: e.teamName,
        score: e.score,
        hackathon: h ? (h.title.length > 20 ? h.title.slice(0, 20) + "…" : h.title) : lb.hackathonSlug,
      }));
    });
    setTop3(allEntries.sort((a, b) => b.score - a.score).slice(0, 3));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setBannerIdx((p) => (p + 1) % BANNERS.length), 4000);
    return () => clearInterval(id);
  }, []);

  const banner = BANNERS[bannerIdx];

  return (
    <div className="min-h-screen">
      {/* 히어로 배너 */}
      <div className={`relative bg-gradient-to-br ${banner.gradient} overflow-hidden transition-all duration-700`}>
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl text-white">
            <div className="text-sm font-medium bg-white/20 inline-block px-3 py-1 rounded-full mb-4">
              {banner.label}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {banner.emoji} {banner.title}
            </h1>
            <p className="text-white/80 text-lg mb-6">{banner.subtitle}</p>
            <div className="flex gap-3">
              <Link href={`/hackathons/${banner.slug}`}>
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                  자세히 보기
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/hackathons">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  전체 해커톤
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setBannerIdx(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === bannerIdx ? "bg-white w-6" : "bg-white/40 w-2"
              }`}
            />
          ))}
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* 통계 바 */}
      <div className="bg-gray-900 dark:bg-gray-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">{hackathonSummaries.length}</div>
            <div className="text-xs text-gray-400">총 해커톤</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {hackathonSummaries.filter((h) => h.status === "ongoing").length}
            </div>
            <div className="text-xs text-gray-400">진행 중</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">5+</div>
            <div className="text-xs text-gray-400">참가 팀</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-14">
        {/* 해커톤 미리보기 */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                해커톤
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                지금 참여 가능한 해커톤을 확인하세요.
              </p>
            </div>
            <Link href="/hackathons">
              <Button variant="ghost" className="text-blue-600 dark:text-blue-400">
                전체 보기 <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.slice(0, 3).map((h) => (
              <HackathonCard key={h.slug} hackathon={h} />
            ))}
          </div>
        </section>

        {/* 팀 모집 미리보기 */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                팀원 모집 중
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                함께할 팀원을 찾거나 팀에 합류하세요.
              </p>
            </div>
            <Link href="/camp">
              <Button variant="ghost" className="text-blue-600 dark:text-blue-400">
                전체 보기 <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {teams.map((team) => (
              <Card key={team.teamCode} className="dark:border-gray-700 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{team.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        team.isOpen
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {team.isOpen ? "모집중" : "마감"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{team.intro}</p>
                  <div className="flex flex-wrap gap-1">
                    {team.lookingFor.slice(0, 3).map((role) => (
                      <span
                        key={role}
                        className="text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 랭킹 Top3 */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                랭킹 Top 3
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">전체 해커톤 통합 순위입니다.</p>
            </div>
            <Link href="/rankings">
              <Button variant="ghost" className="text-blue-600 dark:text-blue-400">
                전체 보기 <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {top3.map((entry, i) => (
              <div
                key={entry.teamName}
                className={`rounded-2xl p-5 ${
                  i === 0
                    ? "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800"
                    : i === 1
                    ? "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-700 border border-gray-200 dark:border-gray-600"
                    : "bg-gradient-to-br from-orange-50 to-amber-50/50 dark:from-orange-900/10 border border-orange-100 dark:border-orange-900/30"
                }`}
              >
                <div className="text-3xl mb-2">{["🥇", "🥈", "🏅"][i]}</div>
                <div className="font-bold text-lg text-gray-900 dark:text-white">{entry.teamName}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{entry.hackathon}</div>
                <div className="font-bold text-xl mt-2 text-blue-600 dark:text-blue-400">
                  {typeof entry.score === "number" && entry.score < 1
                    ? entry.score.toFixed(4)
                    : entry.score}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA 배너 */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">지금 바로 참여하세요!</h2>
          <p className="text-white/80 mb-6">해커톤에 참가하고 팀원을 모집해 최고의 솔루션을 만들어보세요.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/hackathons">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
                해커톤 참가하기
              </Button>
            </Link>
            <Link href="/camp">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
              >
                팀원 찾기
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
