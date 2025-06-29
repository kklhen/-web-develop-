import { notFound } from 'next/navigation';

async function getCommitDetail(commitId) {
  try {
    // 模拟2秒延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 模拟随机错误，用于测试错误处理（已禁用）
    if (Math.random() < 0.0) { // 已将概率设为0，不再抛出模拟错误
      throw new Error('模拟的数据获取错误');
    }

    const response = await fetch(`https://api.github.com/repos/kklhen/-web-develop-/commits/${commitId}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
      next: { revalidate: 3600 } // 缓存1小时
    });

    if (response.status === 404) {
      return notFound();
    }

    if (!response.ok) {
      throw new Error('获取提交详情失败');
    }

    return await response.json();
  } catch (error) {
    console.error('获取提交详情时出错:', error);
    throw error;
  }
}

export async function generateMetadata({ params }) {
  const commit = await getCommitDetail(params.commitId);
  return {
    title: `提交详情 - ${commit.commit.message}`,
    description: `由 ${commit.commit.author.name} 提交于 ${new Date(commit.commit.author.date).toLocaleString()}`
  };
}

export default async function CommitDetailPage({ params }) {
  let commit;
  let error = null;

  try {
    commit = await getCommitDetail(params.commitId);
  } catch (e) {
    error = e.message;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">提交详情</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          {error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-semibold mb-2">提交信息</h2>
                <p className="text-gray-700">{commit.commit.message}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-semibold mb-2">提交者信息</h2>
                <div className="flex items-center space-x-4">
                  <img
                    src={commit.author?.avatar_url}
                    alt={commit.commit.author.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-gray-700">名称: {commit.commit.author.name}</p>
                    <p className="text-gray-700">邮箱: {commit.commit.author.email}</p>
                    <p className="text-gray-700">
                      提交时间: {new Date(commit.commit.author.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-semibold mb-2">提交详情</h2>
                <p className="text-gray-700">SHA: {commit.sha}</p>
                <p className="text-gray-700">父提交: {commit.parents.map(parent => parent.sha).join(', ')}</p>
              </div>

              <div>
                <a
                  href={commit.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-150 ease-in-out"
                >
                  在 GitHub 上查看
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}