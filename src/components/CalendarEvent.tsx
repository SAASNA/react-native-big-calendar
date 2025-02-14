import dayjs from 'dayjs';
import * as React from 'react';

import { OVERLAP_OFFSET, u } from '../commonStyles';
import { useCalendarTouchableOpacityProps } from '../hooks/useCalendarTouchableOpacityProps';
import { EventCellStyle, EventRenderer, ICalendarEventBase } from '../interfaces';
import { useTheme } from '../theme/ThemeContext';
import { DAY_MINUTES, getRelativeTopInDay, getStyleForOverlappingEvent, hours, typedMemo } from '../utils';
import { DefaultCalendarEventRenderer } from './DefaultCalendarEventRenderer';

const getEventCellPositionStyle = (start: Date, end: Date, dayMinutes: number, startHours: number) => {
  const relativeHeight = 100 * (1 / dayMinutes) * dayjs(end).diff(start, 'minute');
  const relativeTop = getRelativeTopInDay(dayjs(start).subtract(startHours, 'hour'), dayMinutes);
  return {
    height: `${relativeHeight}%`,
    top: `${relativeTop}%`,
  };
};

interface CalendarEventProps<T extends ICalendarEventBase> {
  event: T;
  onPressEvent?: (event: T) => void;
  eventCellStyle?: EventCellStyle<T>;
  showTime: boolean;
  eventCount?: number;
  eventOrder?: number;
  overlapOffset?: number;
  renderEvent?: EventRenderer<T>;
  ampm: boolean;
  dayMinutes: number;
  hours?: any;
  startHour?: any;
}

function _CalendarEvent<T extends ICalendarEventBase>({
  event,
  onPressEvent,
  eventCellStyle,
  showTime,
  eventCount = 1,
  eventOrder = 0,
  overlapOffset = OVERLAP_OFFSET,
  renderEvent,
  ampm,
  dayMinutes,
  hours = [],
  startHour = 0
}: CalendarEventProps<T>) {
  const theme = useTheme();

  const palettes = React.useMemo(
    () => [theme.palette.primary, ...theme.eventCellOverlappings],
    [theme],
  );

  const touchableOpacityProps = useCalendarTouchableOpacityProps({
    event,
    eventCellStyle,
    onPressEvent,
    injectedStyles: [
      getEventCellPositionStyle(event.start, event.end, dayMinutes, startHour),
      getStyleForOverlappingEvent(eventOrder, overlapOffset, palettes),
      u['absolute'],
      u['mt-2'],
      u['mx-3'],
    ],
  });

  const textColor = React.useMemo(() => {
    const fgColors = palettes.map((p) => p.contrastText);
    return fgColors[eventCount % fgColors.length] || fgColors[0];
  }, [eventCount, palettes]);

  if (renderEvent) {
    return renderEvent(event, touchableOpacityProps);
  }

  return (
    <DefaultCalendarEventRenderer
      event={event}
      showTime={showTime}
      dayMinutes={dayMinutes}
      hours={hours}
      startHour={startHour}
      ampm={ampm}
      touchableOpacityProps={touchableOpacityProps}
      textColor={textColor}
    />
  );
}

export const CalendarEvent = typedMemo(_CalendarEvent);
