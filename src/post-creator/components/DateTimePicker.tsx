import React from 'react';
import dayjs from 'dayjs';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

/**
 * Date and Time Picker Component
 */
export const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange }) => {
  const current = dayjs(value);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = dayjs(e.target.value)
      .hour(current.hour())
      .minute(current.minute())
      .toDate();
    onChange(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const newDate = current.hour(hours).minute(minutes).toDate();
    onChange(newDate);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-newTextColor mb-3">Schedule</label>

      <div className="grid grid-cols-2 gap-3">
        {/* Date input */}
        <div>
          <label className="block text-xs text-textItemBlur mb-1">Date</label>
          <input
            type="date"
            value={current.format('YYYY-MM-DD')}
            onChange={handleDateChange}
            min={dayjs().format('YYYY-MM-DD')}
            className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:border-btnPrimary focus:outline-none"
          />
        </div>

        {/* Time input */}
        <div>
          <label className="block text-xs text-textItemBlur mb-1">Time</label>
          <input
            type="time"
            value={current.format('HH:mm')}
            onChange={handleTimeChange}
            className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:border-btnPrimary focus:outline-none"
          />
        </div>
      </div>

      {/* Display formatted datetime */}
      <div className="mt-2 text-xs text-textItemBlur">
        Posting on: <span className="text-newTextColor font-medium">{current.format('MMMM D, YYYY [at] HH:mm')}</span>
      </div>
    </div>
  );
};
