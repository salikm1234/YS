import { toPacificTime } from './timeUtils';

/**
 * Schedule tasks into time blocks with Pomodoro breaks.
 * @param {Array} tasks - List of tasks to schedule.
 * @param {Object} preferences - User preferences (work/break intervals, busy times).
 */
export const scheduleTasks = (tasks, preferences) => {
  const { workInterval, breakInterval, busyTimes, sleepStart, sleepEnd } = preferences;

  // Sort tasks by priority (e.g., High > Medium > Low) and duration
  tasks.sort((a, b) => {
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority] || a.duration - b.duration;
  });

  const scheduledBlocks = [];
  let currentTime = new Date().setHours(8, 0, 0, 0); // Start scheduling at 8 AM
  let endOfDay = new Date().setHours(sleepStart, 0, 0, 0); // Sleep time (e.g., 10 PM)

  tasks.forEach((task) => {
    const taskStart = new Date(currentTime);

    // Check if the task fits before the sleep time
    if (taskStart.getTime() + task.duration * 60000 > endOfDay) {
      // If not, push it to the next day
      currentTime = new Date().setHours(8, 0, 0, 0); // Reset to 8 AM the next day
      endOfDay = new Date().setHours(sleepEnd, 0, 0, 0);
    }

    // Skip any busy time slots
    for (const busy of busyTimes) {
      const busyStart = new Date(busy.start);
      const busyEnd = new Date(busy.end);

      if (taskStart >= busyStart && taskStart < busyEnd) {
        currentTime = busyEnd.getTime();
      }
    }

    // Schedule task
    const taskEnd = currentTime + task.duration * 60000; // Add task duration in milliseconds
    scheduledBlocks.push({
      ...task,
      start: toPacificTime(currentTime),
      end: toPacificTime(taskEnd),
    });

    // Add Pomodoro break if there's enough time
    const breakStart = taskEnd;
    const breakEnd = breakStart + breakInterval * 60000;

    if (breakEnd <= endOfDay) {
      scheduledBlocks.push({
        taskName: 'Break',
        duration: breakInterval,
        start: toPacificTime(breakStart),
        end: toPacificTime(breakEnd),
      });
    }

    currentTime = breakEnd; // Move current time to after the break
  });

  return scheduledBlocks;
};
