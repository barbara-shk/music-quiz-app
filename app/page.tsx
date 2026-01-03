'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-4">
      <div className="w-full max-w-4xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white drop-shadow-lg md:text-7xl">
            Blind Test
          </h1>
          <p className="text-xl text-white/90 md:text-2xl">
            Music Quiz Game - Test your musical knowledge!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/master" className="block">
            <Card className="group h-full cursor-pointer transition-all hover:scale-105 hover:shadow-2xl">
              <CardHeader className="space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 transition-colors group-hover:bg-purple-200">
                  <Music className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Create Game</CardTitle>
                <CardDescription className="text-base">
                  I'm the game master and want to host a quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700">
                  Create Game
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/team" className="block">
            <Card className="group h-full cursor-pointer transition-all hover:scale-105 hover:shadow-2xl">
              <CardHeader className="space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 transition-colors group-hover:bg-orange-200">
                  <Users className="h-10 w-10 text-orange-600" />
                </div>
                <CardTitle className="text-2xl">Join Game</CardTitle>
                <CardDescription className="text-base">
                  I'm a player and want to join an existing quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700">
                  Join Game
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <p className="text-sm text-white/80">
          Choose your role to get started
        </p>
      </div>
    </div>
  );
}
