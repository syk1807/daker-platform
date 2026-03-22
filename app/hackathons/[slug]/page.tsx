"use client";

import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Trophy, Users, FileText, Calendar, Info,
  Star, Send, BarChart2, ExternalLink, Heart
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/hackathon/StatusBadge";
import CountdownTimer from "@/components/hackathon/CountdownTimer";
import { hackathonDetails, hackathonSummaries } from "@/lib/data/hackathons";
import { initialLeaderboards } from "@/lib/data/leaderboards";
import {
  getTeams, getSubmissions, saveSubmission,
  toggleBookmark, getUser, initStorage
} from "@/lib/storage";
import { Team, Submission } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatAmount(amount: number) {
  return (amount / 10000).toLocaleString() + "만원";
}

const PLACE_EMOJI: Record<string, string> = { "1st": "🥇", "2nd": "🥈", "3rd": "🏅" };

export default function HackathonDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const summary = hackathonSummaries.find((h) => h.slug === slug);
  const detail = hackathonDetails.find((h) => h.slug === slug);

  if (!summary || !detail) {
    notFound();
  }

  const [teams, setTeams] = useState<Team[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [submitForm, setSubmitForm] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [appliedTeams, setAppliedTeams] = useState<string[]>([]);

  // 리더보드는 정적 데이터 직접 사용
  const leaderboard = initialLeaderboards.find((l) => l.hackathonSlug === slug);

  useEffect(() => {
    initStorage();
    setTeams(getTeams().filter((t) => t.hackathonSlug === slug));
    setSubmissions(getSubmissions().filter((s) => s.hackathonSlug === slug));
    const user = getUser();
    setBookmarked(user.bookmarks.includes(slug));
    const applied = JSON.parse(localStorage.getItem("daker_applied_teams") || "[]");
    setAppliedTeams(applied);
  }, [slug]);

  const handleApply = (teamCode: string) => {
    const updated = appliedTeams.includes(teamCode)
      ? appliedTeams.filter((c) => c !== teamCode)
      : [...appliedTeams, teamCode];
    setAppliedTeams(updated);
    localStorage.setItem("daker_applied_teams", JSON.stringify(updated));
  };

  const handleBookmark = () => {
    toggleBookmark(slug);
    setBookmarked((prev) => !prev);
  };

  const handleSubmit = (type: "plan" | "web" | "pdf") => {
    const content = submitForm[type] || "";
    if (!content.trim()) return;
    const sub: Submission = {
      id: Date.now().toString(),
      hackathonSlug: slug,
      teamCode: "MY_TEAM",
      type,
      content,
      submittedAt: new Date().toISOString(),
    };
    saveSubmission(sub);
    setSubmissions(getSubmissions().filter((s) => s.hackathonSlug === slug));
    setSubmitForm((prev) => ({ ...prev, [type]: "" }));
    setSubmitSuccess(type);
    setTimeout(() => setSubmitSuccess(null), 3000);
  };

  const nextMilestone = detail.sections.schedule.milestones.find(
    (m) => new Date(m.at) > new Date()
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 뒤로가기 */}
      <Link href="/hackathons" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        해커톤 목록
      </Link>

      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <StatusBadge status={summary.status} />
            {summary.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {detail.title}
          </h1>
          {nextMilestone && (
            <CountdownTimer targetDate={nextMilestone.at} label={`${nextMilestone.name}까지`} />
          )}
        </div>
        <Button
          variant="outline"
          onClick={handleBookmark}
          className={`shrink-0 ${bookmarked ? "border-red-300 text-red-500" : ""}`}
        >
          <Heart className={`h-4 w-4 mr-2 ${bookmarked ? "fill-red-400 text-red-400" : ""}`} />
          {bookmarked ? "북마크 해제" : "북마크"}
        </Button>
      </div>

      {/* 탭 */}
      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {[
            { value: "overview", label: "개요", icon: <Info className="h-3.5 w-3.5" /> },
            { value: "info", label: "안내", icon: <FileText className="h-3.5 w-3.5" /> },
            { value: "eval", label: "평가", icon: <Star className="h-3.5 w-3.5" /> },
            { value: "schedule", label: "일정", icon: <Calendar className="h-3.5 w-3.5" /> },
            { value: "prize", label: "상금", icon: <Trophy className="h-3.5 w-3.5" /> },
            { value: "teams", label: "팀", icon: <Users className="h-3.5 w-3.5" /> },
            { value: "submit", label: "제출", icon: <Send className="h-3.5 w-3.5" /> },
            { value: "leaderboard", label: "리더보드", icon: <BarChart2 className="h-3.5 w-3.5" /> },
          ].map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1 text-xs sm:text-sm">
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* 개요 */}
        <TabsContent value="overview">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">대회 소개</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {detail.sections.overview.summary}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-500 mb-1">팀 구성</div>
                  <div className="font-semibold">
                    {detail.sections.overview.teamPolicy.allowSolo ? "개인 참가 가능" : "팀 참가 필수"}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-500 mb-1">최대 팀원</div>
                  <div className="font-semibold">{detail.sections.overview.teamPolicy.maxTeamSize}명</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 안내 */}
        <TabsContent value="info">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">공지사항</h2>
                <ul className="space-y-2">
                  {detail.sections.info.notice.map((n, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-3">
                <a href={detail.sections.info.links.rules} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    규정 보기
                  </Button>
                </a>
                <a href={detail.sections.info.links.faq} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    FAQ
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 평가 */}
        <TabsContent value="eval">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">평가 지표: {detail.sections.eval.metricName}</h2>
                <p className="text-gray-600 dark:text-gray-300">{detail.sections.eval.description}</p>
              </div>
              {detail.sections.eval.scoreDisplay && (
                <div>
                  <h3 className="font-medium mb-3">{detail.sections.eval.scoreDisplay.label}</h3>
                  <div className="space-y-3">
                    {detail.sections.eval.scoreDisplay.breakdown.map((b) => (
                      <div key={b.key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-300">{b.label}</span>
                          <span className="font-semibold">{b.weightPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${b.weightPercent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {detail.sections.eval.limits && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">최대 실행 시간</div>
                    <div className="font-semibold">{detail.sections.eval.limits.maxRuntimeSec}초</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">일일 최대 제출</div>
                    <div className="font-semibold">{detail.sections.eval.limits.maxSubmissionsPerDay}회</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 일정 */}
        <TabsContent value="schedule">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">대회 일정</h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-4">
                  {detail.sections.schedule.milestones.map((m, i) => {
                    const isPast = new Date(m.at) < new Date();
                    const isCurrent = i === detail.sections.schedule.milestones.findIndex(
                      (ms) => new Date(ms.at) > new Date()
                    );
                    return (
                      <div key={i} className="flex items-start gap-4 pl-10 relative">
                        <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${
                          isPast
                            ? "bg-gray-300 border-gray-300 dark:bg-gray-600 dark:border-gray-600"
                            : isCurrent
                            ? "bg-blue-500 border-blue-500 animate-pulse"
                            : "bg-white border-gray-300 dark:bg-gray-800"
                        }`} />
                        <div className={`flex-1 pb-1 ${isPast ? "opacity-50" : ""}`}>
                          <div className={`font-medium text-sm ${isCurrent ? "text-blue-600 dark:text-blue-400" : ""}`}>
                            {m.name} {isCurrent && <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">진행중</span>}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{formatDate(m.at)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 상금 */}
        <TabsContent value="prize">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">시상 내역</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {detail.sections.prize.items.map((item) => (
                  <div
                    key={item.place}
                    className={`rounded-2xl p-6 text-center ${
                      item.place === "1st"
                        ? "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-700"
                        : item.place === "2nd"
                        ? "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border border-gray-200 dark:border-gray-700"
                        : "bg-gradient-to-br from-orange-50 to-amber-50/50 dark:from-orange-900/10 border border-orange-100 dark:border-orange-900/30"
                    }`}
                  >
                    <div className="text-4xl mb-2">{PLACE_EMOJI[item.place] || "🎖️"}</div>
                    <div className="font-bold text-lg mb-1">{item.place}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatAmount(item.amountKRW)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 팀 */}
        <TabsContent value="teams">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">참여 팀 ({teams.length})</h2>
              <Link href={`/camp?hackathon=${slug}`}>
                <Button size="sm">
                  <Users className="h-4 w-4 mr-1.5" />
                  팀 모집 보드로 이동
                </Button>
              </Link>
            </div>
            {teams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams.map((team) => (
                  <Card key={team.teamCode} className="dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold">{team.name}</div>
                        <Badge variant={team.isOpen ? "default" : "secondary"} className="text-xs">
                          {team.isOpen ? "모집중" : "마감"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{team.intro}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {team.lookingFor.map((role) => (
                          <span key={role} className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                            {role} 구함
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t dark:border-gray-700">
                        {team.isOpen ? (
                          <Button
                            size="sm"
                            variant={appliedTeams.includes(team.teamCode) ? "secondary" : "default"}
                            className="flex-1 text-xs"
                            onClick={() => handleApply(team.teamCode)}
                          >
                            {appliedTeams.includes(team.teamCode) ? "✅ 지원 완료 (취소)" : "이 팀에 지원하기"}
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-400">모집 마감된 팀입니다</span>
                        )}
                        {team.contact.url && team.contact.url !== "#" && (
                          <a href={team.contact.url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              연락하기
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>아직 등록된 팀이 없습니다.</p>
                <Link href={`/camp?hackathon=${slug}`}>
                  <Button variant="outline" size="sm" className="mt-3">팀 만들기</Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>

        {/* 제출 */}
        <TabsContent value="submit">
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">제출 가이드</h3>
              <ul className="space-y-1">
                {detail.sections.submit.guide.map((g, i) => (
                  <li key={i} className="text-sm text-blue-700 dark:text-blue-400 flex items-start gap-1.5">
                    <span className="mt-0.5">{i + 1}.</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>

            {detail.sections.submit.submissionItems ? (
              <div className="space-y-4">
                {detail.sections.submit.submissionItems.map((item) => {
                  const existing = submissions.find((s) => s.type === item.key as "plan" | "web" | "pdf");
                  return (
                    <Card key={item.key} className="dark:border-gray-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          {existing && <span className="w-2 h-2 rounded-full bg-green-500" />}
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {existing && (
                          <div className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-2 rounded-lg">
                            ✅ 제출됨: {existing.content} <span className="opacity-60">({new Date(existing.submittedAt).toLocaleDateString("ko-KR")})</span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          {item.format === "text_or_url" ? (
                            <Textarea
                              placeholder="기획서 내용이나 링크를 입력하세요"
                              value={submitForm[item.key] || ""}
                              onChange={(e) => setSubmitForm((p) => ({ ...p, [item.key]: e.target.value }))}
                              rows={3}
                            />
                          ) : (
                            <Input
                              placeholder={item.format === "url" ? "https://your-site.vercel.app" : "https://...pdf"}
                              value={submitForm[item.key] || ""}
                              onChange={(e) => setSubmitForm((p) => ({ ...p, [item.key]: e.target.value }))}
                            />
                          )}
                          <Button
                            onClick={() => handleSubmit(item.key as "plan" | "web" | "pdf")}
                            className="shrink-0"
                          >
                            {existing ? "수정" : "제출"}
                          </Button>
                        </div>
                        {submitSuccess === item.key && (
                          <p className="text-sm text-green-600 dark:text-green-400">✅ 제출이 저장되었습니다!</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="dark:border-gray-700">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    허용 파일 유형: {detail.sections.submit.allowedArtifactTypes.join(", ")}
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="제출물 링크 또는 내용"
                      value={submitForm["general"] || ""}
                      onChange={(e) => setSubmitForm((p) => ({ ...p, general: e.target.value }))}
                    />
                    <Button onClick={() => handleSubmit("web")}>제출</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* 리더보드 */}
        <TabsContent value="leaderboard">
          <Card className="dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">리더보드</h2>
                {leaderboard && (
                  <span className="text-xs text-gray-400">
                    업데이트: {new Date(leaderboard.updatedAt).toLocaleDateString("ko-KR")}
                  </span>
                )}
              </div>
              {leaderboard && leaderboard.entries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-2 px-3 font-medium text-gray-500 w-16">순위</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500">팀명</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-500">점수</th>
                        {leaderboard.entries[0]?.scoreBreakdown && (
                          <>
                            <th className="text-right py-2 px-3 font-medium text-gray-500 hidden sm:table-cell">참가자</th>
                            <th className="text-right py-2 px-3 font-medium text-gray-500 hidden sm:table-cell">심사위원</th>
                          </>
                        )}
                        <th className="text-right py-2 px-3 font-medium text-gray-500 hidden md:table-cell">제출일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.entries.map((entry) => (
                        <tr
                          key={entry.rank}
                          className={`border-b dark:border-gray-800 ${
                            entry.rank === 1 ? "bg-yellow-50 dark:bg-yellow-900/10" :
                            entry.rank === 2 ? "bg-gray-50 dark:bg-gray-800/50" : ""
                          }`}
                        >
                          <td className="py-3 px-3 font-bold">
                            {entry.rank <= 3 ? ["🥇", "🥈", "🏅"][entry.rank - 1] : entry.rank}
                          </td>
                          <td className="py-3 px-3 font-medium">
                            {entry.teamName}
                            {entry.artifacts?.webUrl && (
                              <a href={entry.artifacts.webUrl} target="_blank" rel="noopener noreferrer"
                                className="ml-2 text-blue-500 hover:text-blue-600">
                                <ExternalLink className="h-3 w-3 inline" />
                              </a>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                            {typeof entry.score === "number" && entry.score < 1
                              ? entry.score.toFixed(4)
                              : entry.score}
                          </td>
                          {entry.scoreBreakdown && (
                            <>
                              <td className="py-3 px-3 text-right text-gray-500 hidden sm:table-cell">{entry.scoreBreakdown.participant}</td>
                              <td className="py-3 px-3 text-right text-gray-500 hidden sm:table-cell">{entry.scoreBreakdown.judge}</td>
                            </>
                          )}
                          <td className="py-3 px-3 text-right text-gray-400 text-xs hidden md:table-cell">
                            {new Date(entry.submittedAt).toLocaleDateString("ko-KR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <BarChart2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>아직 리더보드 데이터가 없습니다.</p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-4">{detail.sections.leaderboard.note}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
