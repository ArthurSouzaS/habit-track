import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { todayKey } from '@/lib/dates';

/** Data de hoje (`AAAA-MM-DD`) que se atualiza na virada do dia e ao voltar para o app. */
export function useToday() {
  const [today, setToday] = useState(todayKey);

  useEffect(() => {
    const refresh = () => setToday(todayKey());
    const interval = setInterval(refresh, 60_000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, []);

  return today;
}
