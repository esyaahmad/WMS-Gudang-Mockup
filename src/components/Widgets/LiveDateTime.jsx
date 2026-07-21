import { useState, useEffect } from "react";

export default function LiveDateTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };

  const getDayName = (dayIndex) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[dayIndex];
  };

  const getMonthName = (monthIndex) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    return months[monthIndex];
  };

  const dayName = getDayName(currentTime.getDay());
  const date = currentTime.getDate();
  const month = getMonthName(currentTime.getMonth());
  const year = currentTime.getFullYear();
  const hours = formatTime(currentTime.getHours());
  const minutes = formatTime(currentTime.getMinutes());
  const seconds = formatTime(currentTime.getSeconds());

  return (
    <p>
      {`${dayName}, ${date} ${month} ${year} ${hours}:${minutes}:${seconds}`}
    </p>
  );
}
