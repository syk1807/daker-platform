export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="font-bold text-lg text-blue-600 dark:text-blue-400 mb-1">🚀 DAKER</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              DACON 원정대 — 데이터 경진대회 팀 빌딩 플랫폼
            </p>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            © 2026 DAKER. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
