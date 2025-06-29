export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">提交详情</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]"></div>
              <div className="h-4 w-4 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]"></div>
              <div className="h-4 w-4 animate-bounce rounded-full bg-blue-500"></div>
            </div>
            <p className="text-gray-600">正在加载提交详情...</p>
          </div>
        </div>
      </div>
    </main>
  );
}