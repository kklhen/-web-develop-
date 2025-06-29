import Link from 'next/link';

async function getCommits() {
  try {
    const response = await fetch('https://api.github.com/repos/kklhen/-web-develop-/commits', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
      next: { revalidate: 3600 } // 缓存1小时
    });

    if (!response.ok) {
      throw new Error('获取提交数据失败');
    }

    return await response.json();
  } catch (error) {
    console.error('获取提交数据时出错:', error);
    throw error;
  }
}

export default async function GitHubStats() {
  let commits = [];
  let error = null;

  try {
    commits = await getCommits();
  } catch (e) {
    error = e.message;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">GitHub 提交历史</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          {error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <ul className="space-y-4">
              {commits.map((commit) => (
                <li key={commit.sha} className="border-b border-gray-200 pb-4">
                  <Link 
                    href={`/github-stats/commits/${commit.sha}`}
                    className="block hover:bg-gray-50 transition duration-150 ease-in-out"
                  >
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-gray-500">
                        提交者: {commit.commit.author.name}
                      </p>
                      <p className="text-base text-gray-900">
                        {commit.commit.message}
                      </p>
                      <p className="text-sm text-gray-500">
                        提交时间: {new Date(commit.commit.author.date).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}