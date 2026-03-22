"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Search, ExternalLink, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Team } from "@/types";
import {
  getTeams, saveTeam, generateTeamCode, initStorage, getUser,
  getMyTeamCodes,
} from "@/lib/storage";
import { hackathonSummaries } from "@/lib/data/hackathons";

const ROLES = ["Frontend", "Backend", "ML Engineer", "Designer", "PM"];

const EMPTY_FORM = {
  name: "",
  hackathonSlug: "daker-handover-2026-03",
  intro: "",
  lookingFor: [] as string[],
  contactUrl: "",
};

export default function CampPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeamCodes, setMyTeamCodes] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedHackathon, setSelectedHackathon] = useState("all");
  const [showOpen, setShowOpen] = useState(false);
  const [mySkills, setMySkills] = useState<string[]>([]);

  // 팀 생성/수정 다이얼로그
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const refreshTeams = () => {
    setTeams(getTeams());
    setMyTeamCodes(getMyTeamCodes());
  };

  useEffect(() => {
    initStorage();
    refreshTeams();
    const user = getUser();
    setMySkills(user.skills || []);
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("hackathon");
    if (slug) setSelectedHackathon(slug);
  }, []);

  const openCreateDialog = () => {
    setEditingTeam(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (team: Team) => {
    setEditingTeam(team);
    setForm({
      name: team.name,
      hackathonSlug: team.hackathonSlug,
      intro: team.intro,
      lookingFor: [...team.lookingFor],
      contactUrl: team.contact.url === "#" ? "" : team.contact.url,
    });
    setDialogOpen(true);
  };

  const toggleRole = (role: string) => {
    setForm((prev) => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(role)
        ? prev.lookingFor.filter((r) => r !== role)
        : [...prev.lookingFor, role],
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingTeam) {
      // 수정
      const updated: Team = {
        ...editingTeam,
        name: form.name,
        hackathonSlug: form.hackathonSlug,
        intro: form.intro,
        lookingFor: form.lookingFor,
        contact: { type: "link", url: form.contactUrl || "#" },
      };
      saveTeam(updated);
    } else {
      // 생성
      const newTeam: Team = {
        teamCode: generateTeamCode(),
        hackathonSlug: form.hackathonSlug,
        name: form.name,
        isOpen: true,
        memberCount: 1,
        lookingFor: form.lookingFor,
        intro: form.intro,
        contact: { type: "link", url: form.contactUrl || "#" },
        createdAt: new Date().toISOString(),
      };
      saveTeam(newTeam, true);
    }
    refreshTeams();
    setDialogOpen(false);
  };

  const handleCloseRecruitment = (team: Team) => {
    saveTeam({ ...team, isOpen: false });
    refreshTeams();
  };

  // 팀 매칭 추천: 내 스킬을 필요로 하는 팀 상단 정렬
  const sorted = [...teams].sort((a, b) => {
    const aMatch = mySkills.some((s) => a.lookingFor.includes(s)) ? -1 : 0;
    const bMatch = mySkills.some((s) => b.lookingFor.includes(s)) ? -1 : 0;
    return aMatch - bMatch;
  });

  const filtered = sorted.filter((t) => {
    if (selectedHackathon !== "all" && t.hackathonSlug !== selectedHackathon) return false;
    if (showOpen && !t.isOpen) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.intro.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getHackathonTitle = (slug: string) =>
    hackathonSummaries.find((h) => h.slug === slug)?.title || slug;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">팀원 모집</h1>
          <p className="text-gray-500 dark:text-gray-400">함께할 팀원을 찾거나, 새 팀을 만들어보세요.</p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          팀 만들기
        </Button>

        {/* 생성/수정 다이얼로그 */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTeam ? "팀 정보 수정" : "새 팀 만들기"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>팀 이름 *</Label>
                <Input
                  placeholder="팀 이름을 입력하세요"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>해커톤</Label>
                <select
                  value={form.hackathonSlug}
                  onChange={(e) => setForm((p) => ({ ...p, hackathonSlug: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700"
                >
                  {hackathonSummaries.map((h) => (
                    <option key={h.slug} value={h.slug}>{h.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>팀 소개</Label>
                <Textarea
                  placeholder="팀을 소개하거나, 어떤 프로젝트를 하고 싶은지 적어주세요"
                  value={form.intro}
                  onChange={(e) => setForm((p) => ({ ...p, intro: e.target.value }))}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>모집 역할 (복수 선택)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => toggleRole(role)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        form.lookingFor.includes(role)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>연락처 링크</Label>
                <Input
                  placeholder="오픈카카오톡 or 구글폼 링크"
                  value={form.contactUrl}
                  onChange={(e) => setForm((p) => ({ ...p, contactUrl: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <Button className="w-full" onClick={handleSave} disabled={!form.name.trim()}>
                {editingTeam ? "수정 완료" : "팀 생성하기"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 필터 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="팀명, 소개 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            checked={showOpen}
            onChange={(e) => setShowOpen(e.target.checked)}
            className="rounded"
          />
          모집중만 보기
        </label>
      </div>

      {/* 해커톤 탭 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedHackathon("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedHackathon === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          전체
        </button>
        {hackathonSummaries.map((h) => (
          <button
            key={h.slug}
            onClick={() => setSelectedHackathon(h.slug)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedHackathon === h.slug
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {h.title.length > 20 ? h.title.slice(0, 20) + "…" : h.title}
          </button>
        ))}
      </div>

      {/* 팀 추천 안내 */}
      {mySkills.length > 0 && (
        <div className="mb-4 px-4 py-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-sm text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800">
          ✨ 나의 스킬({mySkills.join(", ")})을 필요로 하는 팀이 상단에 표시됩니다.
        </div>
      )}

      {/* 팀 카드 그리드 */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((team) => {
            const isMatch = mySkills.some((s) => team.lookingFor.includes(s));
            const isMine = myTeamCodes.includes(team.teamCode);
            return (
              <Card
                key={team.teamCode}
                className={`dark:border-gray-700 ${isMatch ? "ring-2 ring-purple-400 dark:ring-purple-600" : ""} ${isMine ? "ring-2 ring-blue-400 dark:ring-blue-600" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-900 dark:text-white">{team.name}</span>
                        {isMine && <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">내 팀</span>}
                        {isMatch && !isMine && <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full">추천</span>}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{getHackathonTitle(team.hackathonSlug).slice(0, 25)}…</div>
                    </div>
                    <Badge variant={team.isOpen ? "default" : "secondary"} className="text-xs shrink-0">
                      {team.isOpen ? "모집중" : "마감"}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 min-h-[2.5rem]">
                    {team.intro || "팀 소개가 없습니다."}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {team.lookingFor.length > 0 ? team.lookingFor.map((role) => (
                      <span
                        key={role}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          mySkills.includes(role)
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
                            : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {role} 구함
                      </span>
                    )) : (
                      <span className="text-xs text-gray-400">모집 포지션 없음</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>👥 {team.memberCount}명</span>
                    <div className="flex items-center gap-2">
                      {team.contact.url && team.contact.url !== "#" && (
                        <a
                          href={team.contact.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                          연락하기
                        </a>
                      )}
                      {isMine && (
                        <>
                          <button
                            onClick={() => openEditDialog(team)}
                            className="flex items-center gap-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <Pencil className="h-3 w-3" />
                            수정
                          </button>
                          {team.isOpen && (
                            <button
                              onClick={() => handleCloseRecruitment(team)}
                              className="flex items-center gap-0.5 text-red-400 hover:text-red-600"
                            >
                              <XCircle className="h-3 w-3" />
                              마감
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {search ? "검색 결과가 없습니다" : "아직 팀이 없습니다"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">첫 번째 팀을 만들어보세요!</p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            팀 만들기
          </Button>
        </div>
      )}
    </div>
  );
}
