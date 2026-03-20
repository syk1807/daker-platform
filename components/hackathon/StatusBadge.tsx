import { Badge } from "@/components/ui/badge";
import { HackathonStatus } from "@/types";

const config: Record<HackathonStatus, { label: string; className: string }> = {
  ongoing: {
    label: "진행중",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200",
  },
  upcoming: {
    label: "예정",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200",
  },
  ended: {
    label: "종료",
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200",
  },
};

export default function StatusBadge({ status }: { status: HackathonStatus }) {
  const { label, className } = config[status];
  return (
    <Badge variant="outline" className={className}>
      {status === "ongoing" && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse inline-block" />}
      {label}
    </Badge>
  );
}
