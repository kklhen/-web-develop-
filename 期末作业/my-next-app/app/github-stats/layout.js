export default function GitHubStatsLayout({ children }) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">GitHub 数据分析</h2>
            <div className="border-t border-gray-200 pt-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}