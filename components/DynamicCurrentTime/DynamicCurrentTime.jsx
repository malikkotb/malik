import { useEffect } from "react";

export default function DynamicCurrentTime() {
  const defaultTimezone = "Europe/Amsterdam";

  useEffect(() => {
    // Initialize Dynamic Current Time
    initDynamicCurrentTime();
  }, []); // Run once on mount

  function initDynamicCurrentTime() {
    // Helper function to format numbers with leading zero
    const formatNumber = (number) =>
      number.toString().padStart(2, "0");

    // Function to create a time formatter with the correct timezone
    const createFormatter = (timezone) => {
      return new Intl.DateTimeFormat([], {
        timeZone: timezone,
        timeZoneName: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    };

    // Function to parse the formatted string into parts
    const parseFormattedTime = (formattedDateTime) => {
      const match = formattedDateTime.match(
        /(\d+):(\d+):(\d+)\s*([\w+]+)/
      );
      if (match) {
        return {
          hours: match[1],
          minutes: match[2],
          seconds: match[3],
          timezone: match[4],
        };
      }
      return null;
    };

    // Function to update the time for all elements
    const updateTime = () => {
      document
        .querySelectorAll("[data-current-time]")
        .forEach((element) => {
          const timezone =
            element.getAttribute("data-current-time") ||
            defaultTimezone;
          const formatter = createFormatter(timezone);
          const now = new Date();
          const formattedDateTime = formatter.format(now);

          const timeParts = parseFormattedTime(formattedDateTime);
          if (timeParts) {
            const { hours, minutes, seconds, timezone } = timeParts;

            // Update child elements if they exist
            const hoursElem = element.querySelector(
              "[data-current-time-hours]"
            );
            const minutesElem = element.querySelector(
              "[data-current-time-minutes]"
            );
            const secondsElem = element.querySelector(
              "[data-current-time-seconds]"
            );
            const timezoneElem = element.querySelector(
              "[data-current-time-timezone]"
            );

            if (hoursElem) hoursElem.textContent = hours;
            if (minutesElem) minutesElem.textContent = minutes;
            if (secondsElem) secondsElem.textContent = seconds;
            if (timezoneElem) timezoneElem.textContent = timezone;
          }
        });
    };

    // Initial update and interval for subsequent updates
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Cleanup interval when component unmounts
    return () => clearInterval(interval);
  }

  return (
    <div className="flex gap-1 opacity-65">
      <p>{new Date().toLocaleDateString('en-US', {weekday: 'long'}).toUpperCase()}</p>
      <span>|</span>
      <p data-current-time={defaultTimezone}>
        <span data-current-time-hours>9</span>:
        <span data-current-time-minutes>00</span>:
        <span data-current-time-seconds>24</span>
        {/* <span data-current-time-timezone className="ml-1">CET</span> */}
      </p>
    </div>
  );
}
