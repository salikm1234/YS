export const scheduleTasks = (tasks, constraints) => {
  const { workInterval, breakInterval, busyTimes, sleepStart, sleepEnd } = constraints;

  const scheduledTasks = [];
  let currentTime = new Date().setHours(sleepEnd, 0, 0, 0); // Start after wake-up time

  tasks.forEach((task) => {
    const taskStart = new Date(currentTime);
    const taskEnd = new Date(taskStart.getTime() + task.duration * 60 * 1000);

    // Skip tasks during sleep hours
    if (taskStart.getHours() >= sleepStart || taskEnd.getHours() < sleepEnd) {
      currentTime = new Date(taskEnd).setHours(sleepEnd, 0, 0, 0); // Move to next wake-up time
      return;
    }

    scheduledTasks.push({
      ...task,
      start: taskStart.toISOString(),
      end: taskEnd.toISOString(),
    });

    currentTime = taskEnd.getTime(); // Move to end of task

    // Schedule a break
    const breakStart = new Date(currentTime);
    const breakEnd = new Date(breakStart.getTime() + breakInterval * 60 * 1000);

    if (
      breakStart.getHours() < sleepStart &&
      breakStart.getHours() >= sleepEnd &&
      !busyTimes.some(
        (busy) =>
          breakStart.toISOString() >= busy.start &&
          breakEnd.toISOString() < busy.end
      )
    ) {
      scheduledTasks.push({
        taskName: "Break",
        start: breakStart.toISOString(),
        end: breakEnd.toISOString(),
        category: "Break",
        id: `break-${breakStart.getTime()}`,
      });

      currentTime = breakEnd.getTime(); // Move to end of break
    }
  });

  return scheduledTasks;
};
