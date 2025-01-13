export const insertBreaks = (tasks, breakInterval) => {
    const tasksWithBreaks = [];
  
    tasks.forEach((task, index) => {
      tasksWithBreaks.push(task);
  
      if (index < tasks.length - 1) {
        const nextTaskStart = new Date(tasks[index + 1].start);
        const taskEnd = new Date(task.end);
        const breakStart = new Date(taskEnd);
        const breakEnd = new Date(taskEnd.getTime() + breakInterval * 60 * 1000);
  
        if (breakEnd <= nextTaskStart) {
          tasksWithBreaks.push({
            taskName: "Break",
            start: breakStart.toISOString(),
            end: breakEnd.toISOString(),
            category: "Break",
            id: `break-${breakStart.getTime()}`,
          });
        }
      }
    });
  
    return tasksWithBreaks;
  };
  