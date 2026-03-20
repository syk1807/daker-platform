"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Heart, Send, Bell, BellOff, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser, saveUser, getHackathons, getSubmissions, initStorage } from "@/lib/storage";
import { hackathonSummaries } from "@/lib/data/hackathons";
import { UserProfile, HackathonSummary, Submission } from "@/types";
import StatusBadge from "@/components/hackathon/StatusBadge";

const ROLES = ["Frontend", "Backend", "ML Engineer", "Designer", "PM"];

export default function MyPage() {
  const [user, setUser] = useState<UserProfile>({
    nickname: "",
    skills: [],
    bookmarks: [],
    joinedHackathons: [],
  });
  const [hackathons, setHackathons] = useState<HackathonSummary[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [saved, setSaved] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    initStorage();
    const u = getUser();
    setUser(u);
    setHackathons(getHackathons());
    setSubmissions(getSubmissions());
    setNotifEnabled(Notification?.permission === "granted");
  }, []);

  const handleSave = () => {
    saveUser(user);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleSkill = (skill: string) => {
    setUser((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const bookmarkedHackathons = hackathons.filter((h) => user.bookmarks.includes(h.slug));

  const requestNotification = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifEnabled(perm === "granted");
    if (perm === "granted") {
      new Notification("DAKER 알림 설정 완료!", {
        body: "해커톤 마감 임박 시 알림을 받을 수 있습니다.",
        icon: "/favicon.ico",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="h-7 w-7" />
          내 정보
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          프로필을 설정하면 나에게 맞는 팀을 추천받을 수 있습니다.
        </p>
      </div>

      {/* 프로필 설정 */}
      <Card className="dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-base">프로필 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>닉네임</Label>
            <Input
              placeholder="사용할 닉네임을 입력하세요"
              value={user.nickname}
              onChange={(e) => setUser((p) => ({ ...p, nickname: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label>나의 스킬 (팀 매칭 추천에 사용)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => toggleSkill(role)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    user.skills.includes(role)
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-400"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              선택한 스킬: {user.skills.length > 0 ? user.skills.join(", ") : "없음"}
            </p>
          </div>
          <Button onClick={handleSave} className="w-full">
            {saved ? "✅ 저장됨!" : "저장하기"}
          </Button>
        </CardContent>
      </Card>

      {/* 알림 설정 */}
      <Card className="dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {notifEnabled ? (
                <Bell className="h-5 w-5 text-green-500" />
              ) : (
                <BellOff className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <div className="font-medium text-sm">마감 임박 알림</div>
                <div className="text-xs text-gray-500">
                  {notifEnabled ? "알림이 설정되어 있습니다." : "해커톤 마감 24시간 전 알림을 받으세요."}
                </div>
              </div>
            </div>
            {!notifEnabled ? (
              <Button size="sm" variant="outline" onClick={requestNotification}>
                알림 허용
              </Button>
            ) : (
              <span className="text-xs text-green-500 font-medium">활성화됨</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 북마크한 해커톤 */}
      <Card className="dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-400" />
            북마크한 해커톤 ({bookmarkedHackathons.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookmarkedHackathons.length > 0 ? (
            <div className="space-y-2">
              {bookmarkedHackathons.map((h) => (
                <Link key={h.slug} href={`/hackathons/${h.slug}`}>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={h.status} />
                      <span className="text-sm font-medium line-clamp-1">{h.title}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm">
              <Heart className="h-8 w-8 mx-auto mb-2 opacity-30" />
              북마크한 해커톤이 없습니다.
              <br />
              해커톤 카드의 하트 버튼을 눌러보세요!
            </div>
          )}
        </CardContent>
      </Card>

      {/* 내 제출 내역 */}
      <Card className="dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="h-4 w-4 text-blue-500" />
            제출 내역 ({submissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length > 0 ? (
            <div className="space-y-2">
              {submissions.map((sub) => {
                const h = hackathonSummaries.find((hh) => hh.slug === sub.hackathonSlug);
                const typeLabel = { plan: "기획서", web: "웹링크", pdf: "PDF" }[sub.type] || sub.type;
                return (
                  <div key={sub.id} className="flex items-start justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                          {typeLabel}
                        </span>
                        <span className="text-xs text-gray-400">{h?.title.slice(0, 20)}…</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{sub.content}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {new Date(sub.submittedAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm">
              <Send className="h-8 w-8 mx-auto mb-2 opacity-30" />
              아직 제출한 내역이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
