import cronstrue from "cronstrue";
import {
  lastDayOfMonth,
  isWeekend,
  addDays,
  subDays,
  getDay,
  startOfMonth,
  getDaysInMonth,
  isSaturday,
  isSunday,
  previousFriday,
  getDate,
  nextMonday,
  addYears,
  isAfter,
  isBefore,
  addSeconds,
  isSameDay,
} from "date-fns";

const monthAliases = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

const dayAliases = {
  SUN: 1,
  MON: 2,
  TUE: 3,
  WED: 4,
  THU: 5,
  FRI: 6,
  SAT: 7,
};

type ParsedExpression =
  | { type: "static"; values: number[] }
  | { type: "last-day" } // L
  | { type: "last-day-offset"; offset: number } // L-3
  | { type: "last-weekday"; day: number } // 6L (last Friday)
  | { type: "weekday-nearest"; day: number } // 15W
  | { type: "last-weekday-of-month" } // LW
  | { type: "nth-weekday"; day: number; occurrence: number } // 6#3 (third Friday)
  | { type: "no-specific-value" } // ?
  | { type: "unspecified-year" }; // empty year

type ParsedCronExpression = {
  seconds: ParsedExpression;
  minutes: ParsedExpression;
  hours: ParsedExpression;
  dayOfMonth: ParsedExpression;
  month: ParsedExpression;
  dayOfWeek: ParsedExpression;
  year: ParsedExpression;
};

// parse
function getSeconds(expression: string): ParsedExpression {
  const values = parseTimeField(expression, "seconds", 59);
  return { type: "static", values };
}

function getMinutes(expression: string): ParsedExpression {
  const values = parseTimeField(expression, "minutes", 59);
  return { type: "static", values };
}

function getHours(expression: string): ParsedExpression {
  const values = parseTimeField(expression, "hours", 23);
  return { type: "static", values };
}

function getDayOfMonth(expression: string): ParsedExpression {
  expression = expression.trim();

  // Disallow '#' in day-of-month
  if (expression.includes("#")) {
    throw new Error(
      "Invalid day-of-month expression: '#' is not allowed in day-of-month field"
    );
  }

  // Explicitly disallow L in lists, ranges, steps
  if (expression.includes("L")) {
    if (/^L(-\d+)?$/.test(expression)) {
      // valid: L or L-2 etc.
    } else if (expression.includes("-")) {
      throw new Error(
        "Invalid day-of-month expression: cannot specify ranges with 'L'"
      );
    } else if (expression.includes(",")) {
      throw new Error(
        "Invalid day-of-month expression: cannot specify lists with 'L'"
      );
    } else if (expression.includes("/")) {
      throw new Error(
        "Invalid day-of-month expression: cannot specify steps with 'L'"
      );
    }
  }

  // Explicitly disallow W in lists, ranges, steps
  if (expression.includes("W")) {
    if (expression.includes(",")) {
      throw new Error(
        "Invalid day-of-month expression: 'W' can only be specified for a single day, not lists"
      );
    }
    if (expression.includes("-")) {
      throw new Error(
        "Invalid day-of-month expression: 'W' can only be specified for a single day, not ranges"
      );
    }
    if (expression.includes("/")) {
      throw new Error(
        "Invalid day-of-month expression: 'W' can only be specified for a single day, not steps"
      );
    }
  }

  if (expression === "?") {
    return { type: "no-specific-value" };
  }

  // Handle L expressions
  if (expression === "L") {
    return { type: "last-day" };
  }

  if (expression === "LW") {
    return { type: "last-weekday-of-month" };
  }

  const lastOffsetMatch = expression.match(/^L-(\d+)$/);
  if (lastOffsetMatch) {
    const offset = parseInt(lastOffsetMatch[1], 10);
    if (offset < 0 || offset > 31) {
      throw new Error(
        `Invalid day-of-month expression: invalid offset in last day: ${expression}`
      );
    }
    return { type: "last-day-offset", offset };
  }

  // Handle W expressions
  const weekdayMatch = expression.match(/^(\d{1,2})W$/);
  if (weekdayMatch) {
    const day = parseInt(weekdayMatch[1], 10);
    if (day < 1 || day > 31) {
      throw new Error(
        `Invalid day-of-month expression: invalid day in weekday: ${expression}`
      );
    }
    return { type: "weekday-nearest", day };
  }

  // Handle regular expressions (including step expressions like "1/5")
  const values = parseTimeField(expression, "day-of-month", 31, 1);
  return { type: "static", values };
}

function getMonth(expression: string): ParsedExpression {
  // Disallow 'L', 'W', '#' in month field
  if (/[LW#]/i.test(expression)) {
    throw new Error(
      "Invalid month expression: special characters 'L', 'W', or '#' are not allowed in month field"
    );
  }
  const values = parseTimeField(expression, "month", 12, 1, monthAliases);
  return { type: "static", values };
}

function getDayOfWeek(expression: string): ParsedExpression {
  expression = expression.trim();

  expression = replaceAliases(expression, dayAliases, "day-of-week");

  // Disallow 'W' in day-of-week
  if (expression.includes("W")) {
    throw new Error(
      "Invalid day-of-week expression: 'W' is not allowed in day-of-week field"
    );
  }

  // Explicitly disallow L in lists, ranges
  if (expression.includes("L")) {
    if (expression.includes(",")) {
      throw new Error(
        "Invalid day-of-week expression: cannot specify lists with 'L'"
      );
    } else if (expression.includes("-")) {
      throw new Error(
        "Invalid day-of-week expression: cannot specify ranges with 'L'"
      );
    }
  }

  if (expression === "?") {
    return { type: "no-specific-value" };
  }

  // Handle standalone "L" - means Saturday (7)
  if (expression === "L") {
    return { type: "static", values: [7] };
  }

  // Handle L expressions (last occurrence) - fixed regex to allow 1-2 digits
  const lastWeekdayMatch = expression.match(/^(\d{1,2})L$/);
  if (lastWeekdayMatch) {
    const day = parseInt(lastWeekdayMatch[1], 10);
    if (day < 1 || day > 7) {
      throw new Error(
        `Invalid day-of-week expression: invalid day in last weekday: ${expression}`
      );
    }
    return { type: "last-weekday", day };
  }

  const nthWeekdayMatch = expression.match(/^(\d+)#([1-6])$/);
  if (nthWeekdayMatch) {
    const day = parseInt(nthWeekdayMatch[1], 10);
    const occurrence = parseInt(nthWeekdayMatch[2], 10);
    if (day < 1 || day > 7 || occurrence < 1 || occurrence > 6) {
      throw new Error(
        `Invalid day-of-week expression: invalid nth weekday: ${expression}`
      );
    }
    return { type: "nth-weekday", day, occurrence };
  }

  // Handle regular expressions (including step expressions like "1/2", "MON/2")
  const values = parseTimeField(expression, "day-of-week", 7, 1);
  return { type: "static", values };
}

function getYear(expression: string): ParsedExpression {
  // Handle empty year (optional field)
  if (!expression || !expression.trim()) {
    return { type: "unspecified-year" };
  }

  const values = parseTimeField(expression, "year", 2099, 1970);
  return { type: "static", values };
}

// parse utils
function parseTimeField(
  expression: string,
  fieldName: string,
  maxValue: number,
  minValue: number = 0,
  aliases?: Record<string, number>
) {
  // Handle empty or whitespace
  if (!expression || !expression.trim()) {
    throw new Error(`Invalid ${fieldName} expression: empty`);
  }

  expression = expression.trim();

  if (expression === "*") {
    return Array.from(
      { length: maxValue - minValue + 1 },
      (_, i) => minValue + i
    );
  }

  // Convert aliases to numbers if provided
  if (aliases) {
    expression = replaceAliases(expression, aliases, fieldName);
  }

  // Handle step values (e.g., "*/15", "0/15", "5/15")
  const stepMatch = expression.match(/^(\*|\d{1,4})\/(\d{1,4})$/);
  if (stepMatch) {
    const startPart = stepMatch[1];
    const step = parseInt(stepMatch[2], 10);

    if (step <= 0 || step > maxValue - minValue + 1) {
      throw new Error(
        `Invalid ${fieldName} expression: invalid step value: ${expression}`
      );
    }

    const start = startPart === "*" ? minValue : parseInt(startPart, 10);
    if (start < minValue || start > maxValue) {
      throw new Error(
        `Invalid ${fieldName} expression: invalid start value: ${expression}`
      );
    }

    const result = [];
    for (let i = start; i <= maxValue; i += step) {
      result.push(i);
    }
    return result;
  }

  // Handle range (e.g., "10-20")
  const rangeMatch = expression.match(/^(\d{1,4})-(\d{1,4})$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);

    if (
      start < minValue ||
      start > maxValue ||
      end < minValue ||
      end > maxValue ||
      start > end
    ) {
      throw new Error(
        `Invalid ${fieldName} expression: invalid range: ${expression}`
      );
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // Handle range with step (e.g., "10-20/2")
  const rangeStepMatch = expression.match(/^(\d{1,4})-(\d{1,4})\/(\d{1,4})$/);
  if (rangeStepMatch) {
    const start = parseInt(rangeStepMatch[1], 10);
    const end = parseInt(rangeStepMatch[2], 10);
    const step = parseInt(rangeStepMatch[3], 10);

    if (
      start < minValue ||
      start > maxValue ||
      end < minValue ||
      end > maxValue ||
      start > end ||
      step <= 0 ||
      step > maxValue - minValue + 1
    ) {
      throw new Error(
        `Invalid ${fieldName} expression: invalid range/step: ${expression}`
      );
    }

    const result = [];
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
    return result;
  }

  // Handle comma-separated values (e.g., "0,15,30,45")
  const commaMatch = expression.match(/^(\d{1,4}(?:,\d{1,4})+)$|^(\d{1,4})$/);
  if (commaMatch) {
    const values = expression.split(",").map((val) => {
      const num = parseInt(val.trim(), 10);
      if (fieldName === "year" && (num < 1970 || num > 2099)) {
        throw new Error(
          `Invalid year expression: year must be between 1970 and 2099, got: ${num}`
        );
      }
      if (isNaN(num) || num < minValue || num > maxValue) {
        throw new Error(
          `Invalid ${fieldName} expression: invalid value: ${val}`
        );
      }
      return num;
    });
    return [...new Set(values)].sort((a, b) => a - b);
  }

  throw new Error(
    `Invalid ${fieldName} expression: ${expression} not supported`
  );
}

function replaceAliases(
  expression: string,
  aliases: Record<string, number>,
  fieldName: string
): string {
  return expression.replace(/[A-Z]{3}/gi, (match) => {
    const upperMatch = match.toUpperCase();
    if (aliases[upperMatch] !== undefined) {
      return aliases[upperMatch].toString();
    }
    throw new Error(`Invalid ${fieldName} expression: invalid alias: ${match}`);
  });
}

// evaluate
function evaluateSeconds(expression: ParsedExpression): number[] {
  switch (expression.type) {
    case "static":
      return expression.values;
    default:
      return [];
  }
}

function evaluateMinutes(expression: ParsedExpression): number[] {
  switch (expression.type) {
    case "static":
      return expression.values;
    default:
      return [];
  }
}

function evaluateHours(expression: ParsedExpression): number[] {
  switch (expression.type) {
    case "static":
      return expression.values;
    default:
      return [];
  }
}

function evaluateDayOfMonth(
  expression: ParsedExpression,
  year: number,
  month: number
): number[] {
  switch (expression.type) {
    case "static":
      return expression.values;

    case "last-day":
      return [getDate(lastDayOfMonth(new Date(year, quartzToJsMonth(month))))];

    case "last-day-offset": {
      const lastDay = lastDayOfMonth(new Date(year, quartzToJsMonth(month)));
      const targetDate = subDays(lastDay, expression.offset);

      if (
        getDate(targetDate) < 1 ||
        targetDate.getMonth() !== quartzToJsMonth(month)
      ) {
        // Out of range for this month, so skip this month
        return [];
      }
      return [getDate(targetDate)];
    }

    case "weekday-nearest":
      return [findNearestWeekday(expression.day, year, month)];

    case "last-weekday-of-month":
      return [findLastWeekdayOfMonth(year, month)];

    case "no-specific-value":
      return [];

    default:
      return [];
  }
}

function evaluateMonth(expression: ParsedExpression): number[] {
  switch (expression.type) {
    case "static":
      return expression.values;
    default:
      return [];
  }
}

function evaluateDayOfWeek(
  expression: ParsedExpression,
  year: number,
  month: number
): number[] {
  switch (expression.type) {
    case "static":
      return expression.values;

    case "last-weekday": {
      const lastWeekdayDay = findLastWeekdayOccurrence(
        expression.day,
        year,
        month
      );
      return [lastWeekdayDay];
    }

    case "nth-weekday": {
      const nthWeekdayDay = findNthWeekdayOccurrence(
        expression.day,
        expression.occurrence,
        year,
        month
      );
      // Return empty array for impossible nth (e.g. 6th Friday in a 4-Friday month)
      return nthWeekdayDay ? [nthWeekdayDay] : [];
    }

    case "no-specific-value":
      return [];

    default:
      return [];
  }
}

function evaluateYear(expression: ParsedExpression): number[] | null {
  switch (expression.type) {
    case "static":
      return expression.values;
    case "unspecified-year":
      return null; // null means "any year"
    default:
      return [];
  }
}

// evaluate utils
function findNearestWeekday(
  targetDay: number,
  year: number,
  month: number
): number {
  const daysInMonth = getDaysInMonth(new Date(year, quartzToJsMonth(month)));

  // Ensure target day is valid for the month
  if (targetDay > daysInMonth) {
    targetDay = daysInMonth;
  }

  const targetDate = new Date(year, quartzToJsMonth(month), targetDay);

  if (!isWeekend(targetDate)) {
    return targetDay;
  }

  // If Saturday, try Friday first
  if (isSaturday(targetDate)) {
    const friday = subDays(targetDate, 1);
    if (friday.getMonth() === quartzToJsMonth(month)) {
      return getDate(friday);
    }
    // If Friday is in previous month, try Monday
    const monday = nextMonday(targetDate);
    if (monday.getMonth() === quartzToJsMonth(month)) {
      return getDate(monday);
    }
  }

  // If Sunday, try Monday first
  if (isSunday(targetDate)) {
    const monday = nextMonday(targetDate);
    if (monday.getMonth() === quartzToJsMonth(month)) {
      return getDate(monday);
    }
    // If Monday is in next month, try Friday
    const friday = previousFriday(targetDate);
    if (friday.getMonth() === quartzToJsMonth(month)) {
      return getDate(friday);
    }
  }

  return targetDay;
}

function findLastWeekdayOfMonth(year: number, month: number): number {
  const lastDay = lastDayOfMonth(new Date(year, quartzToJsMonth(month)));

  if (!isWeekend(lastDay)) {
    return getDate(lastDay);
  }

  // Find the last Friday of the month
  const lastFriday = previousFriday(lastDay);
  return getDate(lastFriday);
}

function findLastWeekdayOccurrence(
  dayOfWeek: number,
  year: number,
  month: number
): number {
  const lastDay = lastDayOfMonth(new Date(year, quartzToJsMonth(month)));
  const lastDayOfWeek = getDay(lastDay);

  const targetDay = quartzToDateFnsDay(dayOfWeek);
  const daysBack = (lastDayOfWeek - targetDay + 7) % 7;
  const targetDate = subDays(lastDay, daysBack);

  return getDate(targetDate);
}

function findNthWeekdayOccurrence(
  dayOfWeek: number,
  occurrence: number,
  year: number,
  month: number
): number | null {
  const firstDay = startOfMonth(new Date(year, quartzToJsMonth(month)));
  const firstDayOfWeek = getDay(firstDay);

  const targetDay = quartzToDateFnsDay(dayOfWeek);

  // Calculate days to add to get to first occurrence
  let daysToAdd = (targetDay - firstDayOfWeek + 7) % 7;

  // Add weeks for the nth occurrence
  daysToAdd += (occurrence - 1) * 7;

  const targetDate = addDays(firstDay, daysToAdd);

  // Check if the target date is still in the same month
  if (targetDate.getMonth() !== quartzToJsMonth(month)) {
    return null;
  }

  return getDate(targetDate);
}

function findEarliestTimeOnDay(
  parsed: ParsedCronExpression,
  year: number,
  month: number,
  day: number,
  fromDate: Date
): Date | null {
  const validHours = evaluateHours(parsed.hours).sort((a, b) => a - b);
  const validMinutes = evaluateMinutes(parsed.minutes).sort((a, b) => a - b);
  const validSeconds = evaluateSeconds(parsed.seconds).sort((a, b) => a - b);

  const dayStart = new Date(year, quartzToJsMonth(month), day, 0, 0, 0, 0);
  const isToday = isSameDay(dayStart, fromDate);

  for (const hour of validHours) {
    // Skip past hours if we're looking at today
    if (isToday && hour < fromDate.getHours()) continue;

    for (const minute of validMinutes) {
      // Skip past minutes if we're looking at today and current hour
      if (
        isToday &&
        hour === fromDate.getHours() &&
        minute < fromDate.getMinutes()
      )
        continue;

      for (const second of validSeconds) {
        // Skip past seconds if we're looking at today, current hour, and current minute
        if (
          isToday &&
          hour === fromDate.getHours() &&
          minute === fromDate.getMinutes() &&
          second <= fromDate.getSeconds()
        )
          continue;

        const targetDate = new Date(
          year,
          quartzToJsMonth(month),
          day,
          hour,
          minute,
          second,
          0
        );

        // Return the first valid time that's after fromDate
        if (isAfter(targetDate, fromDate)) {
          return targetDate;
        }
      }
    }
  }

  return null;
}

function getDaysFromDayOfWeek(
  validDaysOfWeek: number[],
  year: number,
  month: number
): number[] {
  const days: number[] = [];
  const daysInMonth = getDaysInMonth(new Date(year, quartzToJsMonth(month)));

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, quartzToJsMonth(month), day);
    const dateFnsDay = getDay(date);
    const quartzDay = dateFnsToQuartzDay(dateFnsDay);

    if (validDaysOfWeek.includes(quartzDay)) {
      days.push(day);
    }
  }

  return days;
}

// Conversion utilities to avoid inline errors
function dateFnsToQuartzDay(dateFnsDay: number): number {
  // date-fns: 0=SUN, 1=MON, 2=TUE, 3=WED, 4=THU, 5=FRI, 6=SAT
  // Quartz:   1=SUN, 2=MON, 3=TUE, 4=WED, 5=THU, 6=FRI, 7=SAT
  return dateFnsDay + 1;
}

function quartzToDateFnsDay(quartzDay: number): number {
  // Quartz:   1=SUN, 2=MON, 3=TUE, 4=WED, 5=THU, 6=FRI, 7=SAT
  // date-fns: 0=SUN, 1=MON, 2=TUE, 3=WED, 4=THU, 5=FRI, 6=SAT
  return quartzDay - 1;
}

function jsToQuartzMonth(jsMonth: number): number {
  // JS Date: 0=JAN, 1=FEB, ..., 11=DEC
  // Quartz:  1=JAN, 2=FEB, ..., 12=DEC
  return jsMonth + 1;
}

function quartzToJsMonth(quartzMonth: number): number {
  // Quartz:  1=JAN, 2=FEB, ..., 12=DEC
  // JS Date: 0=JAN, 1=FEB, ..., 11=DEC
  return quartzMonth - 1;
}

// parse
export function parseCron(cronExpression: string): ParsedCronExpression {
  if (!cronExpression) {
    throw new Error("Empty cron expression");
  }

  const parts = cronExpression.trim().split(/\s+/);

  // Validate number of parts (6 or 7 fields)
  if (parts.length < 6 || parts.length > 7) {
    throw new Error(
      `Invalid cron expression: expected 6 or 7 fields, got ${parts.length}`
    );
  }

  // If year is omitted, add empty string
  if (parts.length === 6) {
    parts.push("");
  }

  const [seconds, minutes, hours, dayOfMonth, month, dayOfWeek, year] = parts;

  // Validate day-of-month and day-of-week mutual exclusivity
  const domHasValue = dayOfMonth !== "?";
  const dowHasValue = dayOfWeek !== "?";

  if (domHasValue && dowHasValue) {
    throw new Error(
      "Cannot specify both day-of-month and day-of-week. Use '?' in one of these fields."
    );
  }
  if (!domHasValue && !dowHasValue) {
    throw new Error(
      "At least one of day-of-month or day-of-week must be specified (not '?')."
    );
  }

  return {
    seconds: getSeconds(seconds),
    minutes: getMinutes(minutes),
    hours: getHours(hours),
    dayOfMonth: getDayOfMonth(dayOfMonth),
    month: getMonth(month),
    dayOfWeek: getDayOfWeek(dayOfWeek),
    year: getYear(year),
  };
}

// evaluate
function getNextParsedCronDate(
  cron: ParsedCronExpression,
  start: Date = new Date()
) {
  // Start searching from the next second to avoid returning current time
  let searchDate = addSeconds(start, 1);

  // Determine search limit based on whether year is specified
  const hasSpecificYear = cron.year.type === "static";
  const searchLimit = hasSpecificYear ? 130 : 4; // 130 years if specific year, 4 years otherwise
  const maxDate = addYears(searchDate, searchLimit);

  while (isBefore(searchDate, maxDate)) {
    const year = searchDate.getFullYear();
    const month = jsToQuartzMonth(searchDate.getMonth());

    // Check if current year matches
    const validYears = evaluateYear(cron.year);
    if (validYears !== null && !validYears.includes(year)) {
      // Skip to next valid year
      const nextValidYear = validYears.find((y) => y > year);
      if (nextValidYear) {
        searchDate = new Date(nextValidYear, 0, 1, 0, 0, 0, 0);
        continue;
      } else {
        // No more valid years in our range
        return null;
      }
    }

    // Check if current month matches
    const validMonths = evaluateMonth(cron.month);
    if (!validMonths.includes(month)) {
      // Skip to next valid month
      const nextValidMonth = validMonths.find((m) => m > month);
      if (nextValidMonth) {
        searchDate = new Date(
          year,
          quartzToJsMonth(nextValidMonth),
          1,
          0,
          0,
          0,
          0
        );
        continue;
      } else {
        // Skip to next year
        searchDate = new Date(year + 1, 0, 1, 0, 0, 0, 0);
        continue;
      }
    }

    // Get valid days for this month/year
    const validDaysOfMonth = evaluateDayOfMonth(cron.dayOfMonth, year, month);
    const validDaysOfWeek = evaluateDayOfWeek(cron.dayOfWeek, year, month);

    // Combine day constraints (OR logic - either day-of-month OR day-of-week)
    let validDays: number[] = [];

    if (cron.dayOfMonth.type === "no-specific-value") {
      // Use day-of-week only
      if (cron.dayOfWeek.type === "static") {
        // For static day-of-week (like MON-FRI), convert to actual day numbers
        validDays = getDaysFromDayOfWeek(validDaysOfWeek, year, month);
      } else {
        // For special day-of-week expressions (like 6L, 6#3), validDaysOfWeek already contains day numbers
        validDays = validDaysOfWeek;
      }
    } else if (cron.dayOfWeek.type === "no-specific-value") {
      // Use day-of-month only
      validDays = validDaysOfMonth.filter((day) => {
        // Validate day exists in this month
        const daysInMonth = getDaysInMonth(
          new Date(year, quartzToJsMonth(month))
        );
        return day >= 1 && day <= daysInMonth;
      });
    } else {
      // This shouldn't happen due to mutual exclusivity validation
      throw new Error("Both day-of-month and day-of-week specified");
    }

    // Sort valid days
    const sortedValidDays = validDays.sort((a, b) => a - b);

    // Filter days based on current position
    const fromYear = start.getFullYear();
    const fromMonth = jsToQuartzMonth(start.getMonth());
    const fromDay = start.getDate();

    const relevantDays = sortedValidDays.filter((day) => {
      if (year > fromYear) return true;
      if (year < fromYear) return false;
      if (month > fromMonth) return true;
      if (month < fromMonth) return false;
      return day >= fromDay;
    });

    for (const day of relevantDays) {
      const result = findEarliestTimeOnDay(cron, year, month, day, start);
      if (result) {
        return result;
      }
    }

    // No valid date found in this month, move to next month
    if (month === 12) {
      searchDate = new Date(year + 1, 0, 1, 0, 0, 0, 0);
    } else {
      searchDate = new Date(year, quartzToJsMonth(month + 1), 1, 0, 0, 0, 0);
    }
  }

  return null; // No valid date found in the search range
}

export function getNextCronDate(
  cronExpression: string,
  start: Date = new Date()
): Date | null {
  const cron = parseCron(cronExpression);
  return getNextParsedCronDate(cron, start);
}

export function getCronDatesBetween(
  cronExpression: string,
  start: Date,
  end: Date,
  maxCount = 1000
): Date[] {
  const cron = parseCron(cronExpression);

  const results: Date[] = [];
  let current = start;
  let count = 0;

  while (true) {
    const next = getNextParsedCronDate(cron, current);
    if (!next || next >= end || count >= maxCount) break;
    results.push(next);
    current = next;
    count++;
  }

  return results;
}

// format
export function formatCron(cronExpression: string, locale?: string | null) {
  const result = cronstrue.toString(cronExpression, {
    throwExceptionOnParseError: false,
    locale,
  });

  if (
    result.search("undefined") === -1 &&
    cronExpression &&
    cronExpression.length
  ) {
    return result;
  }

  return "-";
}
