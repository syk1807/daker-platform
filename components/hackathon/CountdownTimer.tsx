"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface Props {
  targetDate: string;
  label?: string;
}

function calcTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer({ targetDate, label = "마감까지" }: Props) {
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500">
        <Clock className="h-4 w-4" />
        <span>마감됨</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-orange-500" />
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && (
          <span className="font-bold text-orange-600 dark:text-orange-400">{timeLeft.days}일</span>
        )}
        <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
          {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
