'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Home, LogOut, Music } from 'lucide-react';

export function Navigation() {
  const router = useRouter();
  const { role, sessionCode, resetGame } = useGameStore();

  const handleLeave = () => {
    if (confirm('Are you sure you want to leave this game?')) {
      resetGame();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('musicQuiz_session');
      }
      router.push('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
            <Music className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Blind Test
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {sessionCode && (
              <div className="hidden sm:block text-sm text-muted-foreground">
                Code: <span className="font-mono font-bold text-lg">{sessionCode}</span>
              </div>
            )}

            {role && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLeave}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave Game
              </Button>
            )}

            {!role && (
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
