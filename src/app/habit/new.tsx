import { router } from 'expo-router';

import { HabitForm } from '@/components/habit-form';
import { Screen } from '@/components/screen';
import { useHabits } from '@/context/habits-context';
import { successFeedback } from '@/lib/haptics';

export default function NewHabitScreen() {
  const { addHabit } = useHabits();

  return (
    <Screen edges={['bottom']} contentContainerStyle={{ paddingBottom: 48 }}>
      <HabitForm
        submitLabel="Criar hábito"
        onSubmit={(input) => {
          addHabit(input);
          successFeedback();
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
      />
    </Screen>
  );
}
