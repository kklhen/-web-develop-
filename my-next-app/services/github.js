export async function getCommits(type = 'total') {
  try {
    const response = await fetch('https://api.github.com/repos/kklhen/-web-develop-/commits', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error('获取提交数据失败');
    }

    const commits = await response.json();

    switch (type) {
      case 'total':
        return { count: commits.length };
      case 'latest':
        return commits[0] ? {
          message: commits[0].commit.message,
          date: commits[0].commit.author.date,
          author: commits[0].commit.author.name
        } : null;
      case 'frequency':
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentCommits = commits.filter(commit => 
          new Date(commit.commit.author.date) > lastWeek
        );
        return { weeklyCount: recentCommits.length };
      case 'authors':
        const uniqueAuthors = new Set(
          commits.map(commit => commit.commit.author.name)
        );
        return { contributorsCount: uniqueAuthors.size };
      default:
        return { count: commits.length };
    }
  } catch (error) {
    console.error('获取提交数据时出错:', error);
    throw error;
  }
}