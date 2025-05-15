import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sakila 영화 대여 서비스",
  description: "Sakila 데이터베이스 기반 영화 대여 애플리케이션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="bg-white shadow">
          <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">Sakila</Link>
            
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-800 hover:text-blue-600">홈</Link>
              <Link href="/films" className="text-gray-800 hover:text-blue-600">영화</Link>
              <Link href="#" className="text-gray-800 hover:text-blue-600">카테고리</Link>
              <Link href="#" className="text-gray-800 hover:text-blue-600">배우</Link>
              <Link href="#" className="text-gray-800 hover:text-blue-600">대여</Link>
            </div>
            
            <div className="flex items-center">
              <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">로그인</button>
            </div>
          </nav>
        </header>
        
        <main className="min-h-screen">{children}</main>
        
        <footer className="bg-gray-800 text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Sakila 영화 대여</h3>
                <p className="text-gray-300">최고의 영화 대여 서비스를 제공합니다.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">링크</h3>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-gray-300 hover:text-white">홈</Link></li>
                  <li><Link href="/films" className="text-gray-300 hover:text-white">영화</Link></li>
                  <li><Link href="#" className="text-gray-300 hover:text-white">카테고리</Link></li>
                  <li><Link href="#" className="text-gray-300 hover:text-white">배우</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">서비스</h3>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-300 hover:text-white">대여</Link></li>
                  <li><Link href="#" className="text-gray-300 hover:text-white">도움말</Link></li>
                  <li><Link href="#" className="text-gray-300 hover:text-white">자주 묻는 질문</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">문의</h3>
                <p className="text-gray-300">이메일: info@sakila.com</p>
                <p className="text-gray-300">전화: 123-456-7890</p>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-300">
              <p>&copy; {new Date().getFullYear()} Sakila 영화 대여 서비스. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
