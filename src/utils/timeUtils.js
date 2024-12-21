export const toPacificTime = (utcTime) => {
    const date = new Date(utcTime);
    const options = { timeZone: 'America/Los_Angeles', hour12: false };
    return date.toLocaleString('en-US', options);
  };
  
  export const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  