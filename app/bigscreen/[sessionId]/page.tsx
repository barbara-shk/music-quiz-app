'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { BigScreenDisplay } from '@/components/bigscreen/BigScreenDisplay';
import { Loader2 } from 'lucide-react';

export default function BigScreenPage() {
  const params = useParams();
  const { connected, emit } = useSocket();
  const { sessionId, setRole } = useGameStore();

  const urlSessionId = params.sessionId as string;

  useEffect(() => {
    setRole('big-screen');
  }, [setRole]);

  useEffect(() => {
    if (connected && !sessionId) {
      emit('session:join-bigscreen', urlSessionId);
    }
  }, [connected, sessionId, urlSessionId, emit]);

  if (!sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-xl">Connecting to session...</p>
        </div>
      </div>
    );
  }

  return <BigScreenDisplay />;
}
