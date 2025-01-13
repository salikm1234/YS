export const rescheduleTasks = async (tasks, constraints) => {
  const { workInterval, breakInterval, busyTimes, sleepStart, sleepEnd } = constraints;

  const scheduledTasks = [];
  let currentTime = new Date().setHours(sleepEnd, 0, 0, 0); // Start after wake-up time

  console.log("Initial currentTime:", new Date(currentTime).toISOString());

  tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  tasks.forEach((task) => {
    try {
      console.log("Scheduling task:", task);

      const taskStart = new Date(currentTime);
      const taskEnd = new Date(taskStart.getTime() + task.duration * 60 * 1000);

      if (isNaN(taskStart) || isNaN(taskEnd)) {
        throw new Error(`Invalid task dates for task: ${JSON.stringify(task)}`);
      }

      scheduledTasks.push({
        ...task,
        start: taskStart.toISOString(),
        end: taskEnd.toISOString(),
      });

      currentTime = taskEnd.getTime();

      // Schedule a break
      const breakStart = new Date(currentTime);
      const breakEnd = new Date(breakStart.getTime() + breakInterval * 60 * 1000);

      console.log(`Break: start = ${breakStart.toISOString()}, end = ${breakEnd.toISOString()}`);

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

        currentTime = breakEnd.getTime();
      }
    } catch (error) {
      console.error("Error scheduling task:", error.message);
    }
  });

  return scheduledTasks;
};
