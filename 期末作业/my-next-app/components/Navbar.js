import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link href="/" className="text-white hover:text-gray-300">
            首页
          </Link>
          <Link href="/practice" className="text-white hover:text-gray-300">
            练习
          </Link>
          <Link href="/github-stats" className="text-white hover:text-gray-300">
            GitHub 统计
          </Link>
        </div>
      </div>
    </nav>
  );
}