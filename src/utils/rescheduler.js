/**
 * Reschedule tasks dynamically based on start times and constraints.
 * @param {Array} tasks - List of tasks to be scheduled.
 * @param {Object} constraints - User constraints (Pomodoro, busy times, sleep schedule).
 */
export const rescheduleTasks = (tasks, constraints) => {
    const { workInterval, breakInterval, busyTimes, sleepStart, sleepEnd } = constraints;
  
    // Sort tasks by priority and duration
    tasks.sort((a, b) => {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority] || a.duration - b.duration;
    });
  
    const rescheduledTasks = [];
    let currentTime = new Date().setHours(8, 0, 0, 0); // Start scheduling at 8 AM
    let endOfDay = new Date().setHours(sleepStart, 0, 0, 0); // Sleep start time (e.g., 10 PM)
  
    tasks.forEach((task) => {
      // Adjust start time for busy times
      for (const busy of busyTimes) {
        const busyStart = new Date(busy.start).getTime();
        const busyEnd = new Date(busy.end).getTime();
  
        if (currentTime >= busyStart && currentTime < busyEnd) {
          currentTime = busyEnd; // Skip to the end of the busy time
        }
      }
  
      // Ensure task fits within the day
      const taskEnd = currentTime + task.duration * 60000; // Task end in milliseconds
      if (taskEnd > endOfDay) {
        // Push to the next day
        currentTime = new Date().setHours(8, 0, 0, 0); // Reset to 8 AM the next day
        endOfDay = new Date().setHours(sleepEnd, 0, 0, 0); // Reset sleep end time
      }
  
      // Schedule the task
      const taskStart = new Date(currentTime);
      const taskStop = new Date(currentTime + task.duration * 60000);
      rescheduledTasks.push({
        ...task,
        start: taskStart.toISOString(),
        end: taskStop.toISOString(),
      });
  
      // Add Pomodoro break
      currentTime = taskStop.getTime();
      const breakStart = currentTime;
      const breakEnd = currentTime + breakInterval * 60000;
      if (breakEnd <= endOfDay) {
        rescheduledTasks.push({
          taskName: "Break",
          duration: breakInterval,
          start: new Date(breakStart).toISOString(),
          end: new Date(breakEnd).toISOString(),
        });
        currentTime = breakEnd;
      }
    });
  
    return rescheduledTasks;
  };
  