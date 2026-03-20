export type HackathonStatus = "ongoing" | "upcoming" | "ended";

export interface HackathonSummary {
  slug: string;
  title: string;
  status: HackathonStatus;
  tags: string[];
  thumbnailUrl: string;
  period: {
    timezone: string;
    submissionDeadlineAt: string;
    endAt: string;
  };
  links: {
    detail: string;
    rules: string;
    faq: string;
  };
}

export interface PrizeItem {
  place: string;
  amountKRW: number;
}

export interface Milestone {
  name: string;
  at: string;
}

export interface ScoreBreakdown {
  key: string;
  label: string;
  weightPercent: number;
}

export interface SubmissionItem {
  key: string;
  title: string;
  format: string;
}

export interface HackathonDetail {
  slug: string;
  title: string;
  sections: {
    overview: {
      summary: string;
      teamPolicy: {
        allowSolo: boolean;
        maxTeamSize: number;
      };
    };
    info: {
      notice: string[];
      links: {
        rules: string;
        faq: string;
      };
    };
    eval: {
      metricName: string;
      description: string;
      scoreSource?: string;
      scoreDisplay?: {
        label: string;
        breakdown: ScoreBreakdown[];
      };
      limits?: {
        maxRuntimeSec: number;
        maxSubmissionsPerDay: number;
      };
    };
    schedule: {
      timezone: string;
      milestones: Milestone[];
    };
    prize: {
      items: PrizeItem[];
    };
    teams: {
      campEnabled: boolean;
      listUrl: string;
    };
    submit: {
      allowedArtifactTypes: string[];
      submissionUrl: string;
      guide: string[];
      submissionItems?: SubmissionItem[];
    };
    leaderboard: {
      publicLeaderboardUrl: string;
      note: string;
    };
  };
}

export interface Team {
  teamCode: string;
  hackathonSlug: string;
  name: string;
  isOpen: boolean;
  memberCount: number;
  lookingFor: string[];
  intro: string;
  contact: {
    type: string;
    url: string;
  };
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  teamName: string;
  score: number;
  submittedAt: string;
  scoreBreakdown?: {
    participant: number;
    judge: number;
  };
  artifacts?: {
    webUrl?: string;
    pdfUrl?: string;
    planTitle?: string;
  };
}

export interface Leaderboard {
  hackathonSlug: string;
  updatedAt: string;
  entries: LeaderboardEntry[];
}

export interface Submission {
  id: string;
  hackathonSlug: string;
  teamCode: string;
  type: "plan" | "web" | "pdf";
  content: string;
  submittedAt: string;
}

export interface UserProfile {
  nickname: string;
  skills: string[];
  bookmarks: string[];
  joinedHackathons: string[];
}
