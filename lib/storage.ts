import { HackathonSummary, Team, Leaderboard, Submission, UserProfile } from "@/types";
import { hackathonSummaries } from "./data/hackathons";
import { initialTeams } from "./data/teams";
import { initialLeaderboards } from "./data/leaderboards";

const KEYS = {
  hackathons: "daker_hackathons",
  teams: "daker_teams",
  leaderboards: "daker_leaderboards",
  submissions: "daker_submissions",
  user: "daker_user",
  theme: "daker_theme",
  myTeams: "daker_my_teams",
  applications: "daker_applications",
} as const;

export interface TeamApplication {
  id: string;
  teamCode: string;
  applicantName: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  appliedAt: string;
}

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// 최초 실행 시 더미 데이터 초기화
export function initStorage(): void {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(KEYS.hackathons)) {
    setItem(KEYS.hackathons, hackathonSummaries);
  }
  if (!localStorage.getItem(KEYS.teams)) {
    setItem(KEYS.teams, initialTeams);
  }
  if (!localStorage.getItem(KEYS.leaderboards)) {
    setItem(KEYS.leaderboards, initialLeaderboards);
  }
  if (!localStorage.getItem(KEYS.submissions)) {
    setItem(KEYS.submissions, []);
  }
}

// Hackathons
export function getHackathons(): HackathonSummary[] {
  return getItem<HackathonSummary[]>(KEYS.hackathons, hackathonSummaries);
}

// Teams
export function getTeams(): Team[] {
  return getItem<Team[]>(KEYS.teams, initialTeams);
}

export function saveTeam(team: Team, markAsMine = false): void {
  const teams = getTeams();
  const idx = teams.findIndex((t) => t.teamCode === team.teamCode);
  if (idx >= 0) {
    teams[idx] = team;
  } else {
    teams.push(team);
  }
  setItem(KEYS.teams, teams);
  if (markAsMine) {
    const mine = getMyTeamCodes();
    if (!mine.includes(team.teamCode)) {
      setItem(KEYS.myTeams, [...mine, team.teamCode]);
    }
  }
}

// My Teams
export function getMyTeamCodes(): string[] {
  return getItem<string[]>(KEYS.myTeams, []);
}

// Applications
export function getApplications(): TeamApplication[] {
  return getItem<TeamApplication[]>(KEYS.applications, []);
}

export function saveApplication(app: TeamApplication): void {
  const apps = getApplications();
  const idx = apps.findIndex((a) => a.id === app.id);
  if (idx >= 0) apps[idx] = app; else apps.push(app);
  setItem(KEYS.applications, apps);
}

export function updateApplicationStatus(id: string, status: "accepted" | "rejected"): void {
  const apps = getApplications();
  const app = apps.find((a) => a.id === id);
  if (app) {
    app.status = status;
    setItem(KEYS.applications, apps);
    if (status === "accepted") {
      const teams = getTeams();
      const team = teams.find((t) => t.teamCode === app.teamCode);
      if (team) { team.memberCount += 1; setItem(KEYS.teams, teams); }
    }
  }
}

export function deleteTeam(teamCode: string): void {
  const teams = getTeams().filter((t) => t.teamCode !== teamCode);
  setItem(KEYS.teams, teams);
}

// Leaderboards
export function getLeaderboards(): Leaderboard[] {
  return getItem<Leaderboard[]>(KEYS.leaderboards, initialLeaderboards);
}

export function getLeaderboardBySlug(slug: string): Leaderboard | undefined {
  return getLeaderboards().find((l) => l.hackathonSlug === slug);
}

// Submissions
export function getSubmissions(): Submission[] {
  return getItem<Submission[]>(KEYS.submissions, []);
}

export function saveSubmission(submission: Submission): void {
  const subs = getSubmissions();
  const idx = subs.findIndex(
    (s) => s.hackathonSlug === submission.hackathonSlug && s.type === submission.type
  );
  if (idx >= 0) {
    subs[idx] = submission;
  } else {
    subs.push(submission);
  }
  setItem(KEYS.submissions, subs);
}

// User Profile
export function getUser(): UserProfile {
  return getItem<UserProfile>(KEYS.user, {
    nickname: "",
    skills: [],
    bookmarks: [],
    joinedHackathons: [],
  });
}

export function saveUser(user: UserProfile): void {
  setItem(KEYS.user, user);
}

export function toggleBookmark(slug: string): void {
  const user = getUser();
  const idx = user.bookmarks.indexOf(slug);
  if (idx >= 0) {
    user.bookmarks.splice(idx, 1);
  } else {
    user.bookmarks.push(slug);
  }
  saveUser(user);
}

// Theme
export function getTheme(): "light" | "dark" {
  return getItem<"light" | "dark">(KEYS.theme, "light");
}

export function saveTheme(theme: "light" | "dark"): void {
  setItem(KEYS.theme, theme);
}

// 팀 코드 생성
export function generateTeamCode(): string {
  return "T-" + Math.random().toString(36).substr(2, 6).toUpperCase();
}
