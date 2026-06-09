import { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';

export default function GameLoop() {
  const { gameTick, syncDB } = useGameStore();

  useEffect(() => {
    // 10 times a second for smooth currency ticking
    const ticker = setInterval(() => {
      gameTick();
    }, 100);

    // Sync to DB every 30 seconds
    const syncer = setInterval(() => {
      syncDB();
    }, 30000);

    // Sync on window beforeunload
    const handleUnload = () => {
      syncDB();
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(ticker);
      clearInterval(syncer);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [gameTick, syncDB]);

  return null;
}
