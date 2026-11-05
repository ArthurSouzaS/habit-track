import { fireEvent, render, screen } from '@testing-library/react-native';

import { WeekdayPicker } from '@/components/weekday-picker';
import { AppThemeProvider } from '@/context/theme-context';
import type { Weekday } from '@/types/habit';

describe('WeekdayPicker', () => {
  it('marca e desmarca dias mantendo a ordem da semana', async () => {
    const onChange = jest.fn();
    const value: Weekday[] = [1, 5];
    await render(
      <AppThemeProvider>
        <WeekdayPicker value={value} onChange={onChange} color="#6C5CE7" />
      </AppThemeProvider>,
    );

    expect(screen.getByLabelText('Seg')).toBeChecked();
    expect(screen.getByLabelText('Qua')).not.toBeChecked();

    await fireEvent.press(screen.getByLabelText('Qua'));
    expect(onChange).toHaveBeenLastCalledWith([1, 3, 5]);

    await fireEvent.press(screen.getByLabelText('Seg'));
    expect(onChange).toHaveBeenLastCalledWith([5]);
  });
});
