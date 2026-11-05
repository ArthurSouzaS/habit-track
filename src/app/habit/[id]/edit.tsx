import { router, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/empty-state';
import { HabitForm } from '@/components/habit-form';
import { Screen } from '@/components/screen';
import { useHabit, useHabits } from '@/context/habits-context';

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = useHabit(id);
  const { updateHabit, loaded } = useHabits();

  if (!habit) {
    return (
      <Screen edges={['bottom']}>
        {loaded && <EmptyState emoji="🔍" title="Hábito não encontrado" message="Ele pode ter sido excluído." />}
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']} contentContainerStyle={{ paddingBottom: 48 }}>
      <HabitForm
        initial={habit}
        submitLabel="Salvar alterações"
        onSubmit={(input) => {
          updateHabit(habit.id, input);
          if (router.canGoBack()) router.back();
          else router.replace({ pathname: '/habit/[id]', params: { id: habit.id } });
        }}
      />
    </Screen>
  );
}
