export function setupCountdown(targetDateString, onUpdate) {
  const targetDate = new Date(targetDateString).getTime();
  
  const calculate = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      onUpdate({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return false; // Stop interval
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    onUpdate({ days, hours, minutes, seconds });
    return true; // Continue interval
  };

  calculate();
  const interval = setInterval(() => {
    if (!calculate()) {
      clearInterval(interval);
    }
  }, 1000);

  return interval; // Return for manual cleanup
}
