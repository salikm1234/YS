export const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  export const calculateBreakBank = (workMinutes, conversionRate) => {
    return Math.floor(workMinutes / conversionRate);
  };
  
  export const isInTimeRange = (startTime, endTime, currentTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const current = new Date(currentTime);
  
    return current >= start && current <= end;
  };

  export const convertToPST = (date) => {
    const utcDate = new Date(date.toISOString()); // Convert to UTC first
    const offset = utcDate.getTimezoneOffset() + 480; // PST is UTC-8 (480 minutes)
    return new Date(utcDate.getTime() - offset * 60 * 1000);
  };
  
  export const getFormattedDate = (date) => {
    const pstDate = convertToPST(date);
    return pstDate.toISOString().split('T')[0]; // Return YYYY-MM-DD
  };