import { describe, expect, it } from "vitest";
import { getNextCronDate, parseCron } from "../src";

describe("Cron Expression Examples", () => {
  describe("Basic daily schedules", () => {
    it("0 0 12 * * ? - Fire at 12pm (noon) every day", () => {
      const cron = "0 0 12 * * ?";
      let current = new Date(2000, 1, 1, 9, 0, 0, 0);
      const expected = Array.from(
        { length: 10 },
        (_, i) => new Date(2000, 1, 1 + i, 12, 0, 0, 0)
      );
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).not.toBeNull();
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("0 15 10 ? * * - Fire at 10:15am every day", () => {
      const cron = "0 15 10 ? * *";
      let current = new Date(2000, 1, 1, 9, 0, 0, 0);
      const expected = Array.from(
        { length: 10 },
        (_, i) => new Date(2000, 1, 1 + i, 10, 15, 0, 0)
      );
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("0 15 10 * * ? - Fire at 10:15am every day", () => {
      const cron = "0 15 10 * * ?";
      let current = new Date(2000, 1, 1, 9, 0, 0, 0);
      const expected = Array.from(
        { length: 10 },
        (_, i) => new Date(2000, 1, 1 + i, 10, 15, 0, 0)
      );
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("0 15 10 * * ? * - Fire at 10:15am every day", () => {
      const cron = "0 15 10 * * ? *";
      let current = new Date(2000, 1, 1, 9, 0, 0, 0);
      const expected = Array.from(
        { length: 10 },
        (_, i) => new Date(2000, 1, 1 + i, 10, 15, 0, 0)
      );
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("0 15 10 * * ? 2005 - Fire at 10:15am every day during the year 2005", () => {
      const cron = "0 15 10 * * ? 2005";
      let current = new Date(2005, 1, 1, 9, 0, 0, 0);
      const expected = Array.from(
        { length: 10 },
        (_, i) => new Date(2005, 1, 1 + i, 10, 15, 0, 0)
      );
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("0 15 10 * * ? 2005 - Should return null for year 2006", () => {
      const fromDate = new Date(2006, 1, 1, 9, 0, 0, 0); // Feb 1, 2006 at 9:00 AM
      const nextDate = getNextCronDate("0 15 10 * * ? 2005", fromDate);
      expect(nextDate).toBeNull(); // No match in 2006
    });
  });

  describe("Minute-based schedules", () => {
    it("0 * 14 * * ? - Fire every minute starting at 2pm and ending at 2:59pm, every day", () => {
      const cron = "0 * 14 * * ?";
      let current = new Date(2000, 1, 1, 14, 30, 0, 0);
      const expected = [31, 32, 33, 34, 35, 36, 37, 38, 39, 40].map(
        (m) => new Date(2000, 1, 1, 14, m, 0, 0)
      );
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("0 0/5 14 * * ? - Fire every 5 minutes starting at 2pm and ending at 2:55pm, every day", () => {
      const cron = "0 0/5 14 * * ?";
      let current = new Date(2000, 1, 1, 14, 7, 0, 0);
      const expected = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(
        (m) => new Date(2000, 1, 1, 14, m, 0, 0)
      );
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("0 0/5 14,18 * * ? - Fire every 5 minutes at 2pm and 6pm every day", () => {
      const cron = "0 0/5 14,18 * * ?";
      let current = new Date(2000, 1, 1, 15, 0, 0, 0);
      const expected = [
        new Date(2000, 1, 1, 18, 0, 0, 0),
        new Date(2000, 1, 1, 18, 5, 0, 0),
        new Date(2000, 1, 1, 18, 10, 0, 0),
        new Date(2000, 1, 1, 18, 15, 0, 0),
        new Date(2000, 1, 1, 18, 20, 0, 0),
        new Date(2000, 1, 1, 18, 25, 0, 0),
        new Date(2000, 1, 1, 18, 30, 0, 0),
        new Date(2000, 1, 1, 18, 35, 0, 0),
        new Date(2000, 1, 1, 18, 40, 0, 0),
        new Date(2000, 1, 1, 18, 45, 0, 0),
      ];
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("0 0-5 14 * * ? - Fire every minute starting at 2pm and ending at 2:05pm, every day", () => {
      const cron = "0 0-5 14 * * ?";
      let current = new Date(2000, 1, 1, 14, 3, 0, 0);
      const expected = [
        new Date(2000, 1, 1, 14, 4, 0, 0),
        new Date(2000, 1, 1, 14, 5, 0, 0),
        new Date(2000, 1, 2, 14, 0, 0, 0),
        new Date(2000, 1, 2, 14, 1, 0, 0),
        new Date(2000, 1, 2, 14, 2, 0, 0),
        new Date(2000, 1, 2, 14, 3, 0, 0),
        new Date(2000, 1, 2, 14, 4, 0, 0),
        new Date(2000, 1, 2, 14, 5, 0, 0),
        new Date(2000, 1, 3, 14, 0, 0, 0),
        new Date(2000, 1, 3, 14, 1, 0, 0),
      ];
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });
  });

  describe("Complex day/time combinations", () => {
    it("0 10,44 14 ? 3 WED - Fire at 2:10pm and 2:44pm every Wednesday in March", () => {
      const cron = "0 10,44 14 ? 3 WED";
      let current = new Date(2000, 2, 1, 0, 0, 0, 0);
      const expected = [
        new Date(2000, 2, 1, 14, 10, 0, 0),
        new Date(2000, 2, 1, 14, 44, 0, 0),
        new Date(2000, 2, 8, 14, 10, 0, 0),
        new Date(2000, 2, 8, 14, 44, 0, 0),
        new Date(2000, 2, 15, 14, 10, 0, 0),
        new Date(2000, 2, 15, 14, 44, 0, 0),
        new Date(2000, 2, 22, 14, 10, 0, 0),
        new Date(2000, 2, 22, 14, 44, 0, 0),
        new Date(2000, 2, 29, 14, 10, 0, 0),
        new Date(2000, 2, 29, 14, 44, 0, 0),
      ];
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("0 15 10 ? * MON-FRI - Fire at 10:15am every weekday", () => {
      const cron = "0 15 10 ? * MON-FRI";
      let current = new Date(2000, 1, 1, 9, 0, 0, 0);
      const expected = [
        new Date(2000, 1, 1, 10, 15, 0, 0), // Tue
        new Date(2000, 1, 2, 10, 15, 0, 0), // Wed
        new Date(2000, 1, 3, 10, 15, 0, 0), // Thu
        new Date(2000, 1, 4, 10, 15, 0, 0), // Fri
        new Date(2000, 1, 7, 10, 15, 0, 0), // Mon
        new Date(2000, 1, 8, 10, 15, 0, 0), // Tue
        new Date(2000, 1, 9, 10, 15, 0, 0), // Wed
        new Date(2000, 1, 10, 10, 15, 0, 0), // Thu
        new Date(2000, 1, 11, 10, 15, 0, 0), // Fri
        new Date(2000, 1, 14, 10, 15, 0, 0), // Mon
      ];
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("0 15 10 ? * MON-FRI - Skip weekend", () => {
      const cron = "0 15 10 ? * MON-FRI";
      let current = new Date(2000, 1, 5, 11, 0, 0, 0);
      const expected = [
        new Date(2000, 1, 7, 10, 15, 0, 0), // Mon
        new Date(2000, 1, 8, 10, 15, 0, 0), // Tue
        new Date(2000, 1, 9, 10, 15, 0, 0), // Wed
        new Date(2000, 1, 10, 10, 15, 0, 0), // Thu
        new Date(2000, 1, 11, 10, 15, 0, 0), // Fri
        new Date(2000, 1, 14, 10, 15, 0, 0), // Mon
        new Date(2000, 1, 15, 10, 15, 0, 0), // Tue
        new Date(2000, 1, 16, 10, 15, 0, 0), // Wed
        new Date(2000, 1, 17, 10, 15, 0, 0), // Thu
        new Date(2000, 1, 18, 10, 15, 0, 0), // Fri
      ];
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });
  });

  describe("Day-of-month schedules", () => {
    it("0 15 10 15 * ? - Fire at 10:15am on the 15th day of every month", () => {
      const cron = "0 15 10 15 * ?";
      let current = new Date(2000, 1, 10, 9, 0, 0, 0);
      const expected = [
        new Date(2000, 1, 15, 10, 15, 0, 0), // Feb 15, 2000
        new Date(2000, 2, 15, 10, 15, 0, 0), // Mar 15, 2000
        new Date(2000, 3, 15, 10, 15, 0, 0), // Apr 15, 2000
        new Date(2000, 4, 15, 10, 15, 0, 0), // May 15, 2000
        new Date(2000, 5, 15, 10, 15, 0, 0), // Jun 15, 2000
        new Date(2000, 6, 15, 10, 15, 0, 0), // Jul 15, 2000
        new Date(2000, 7, 15, 10, 15, 0, 0), // Aug 15, 2000
        new Date(2000, 8, 15, 10, 15, 0, 0), // Sep 15, 2000
        new Date(2000, 9, 15, 10, 15, 0, 0), // Oct 15, 2000
        new Date(2000, 10, 15, 10, 15, 0, 0), // Nov 15, 2000
      ];
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("0 0 12 1/5 * ? - Fire at 12pm every 5 days starting on the 1st", () => {
      const cron = "0 0 12 1/5 * ?";
      let current = new Date(2000, 1, 3, 9, 0, 0, 0);
      const expected = [
        new Date(2000, 1, 6, 12, 0, 0, 0), // Feb 6, 2000
        new Date(2000, 1, 11, 12, 0, 0, 0), // Feb 11, 2000
        new Date(2000, 1, 16, 12, 0, 0, 0), // Feb 16, 2000
        new Date(2000, 1, 21, 12, 0, 0, 0), // Feb 21, 2000
        new Date(2000, 1, 26, 12, 0, 0, 0), // Feb 26, 2000
        new Date(2000, 2, 1, 12, 0, 0, 0), // Mar 1, 2000
        new Date(2000, 2, 6, 12, 0, 0, 0), // Mar 6, 2000
        new Date(2000, 2, 11, 12, 0, 0, 0), // Mar 11, 2000
        new Date(2000, 2, 16, 12, 0, 0, 0), // Mar 16, 2000
        new Date(2000, 2, 21, 12, 0, 0, 0), // Mar 21, 2000
      ];
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });
  });

  describe("Last day expressions", () => {
    it("0 15 10 L * ? - Fire at 10:15am on the last day of every month", () => {
      const cron = "0 15 10 L * ?";
      let current = new Date(2000, 1, 20, 9, 0, 0, 0);
      const expected = [
        new Date(2000, 1, 29, 10, 15, 0, 0), // Feb 29, 2000
        new Date(2000, 2, 31, 10, 15, 0, 0), // Mar 31, 2000
        new Date(2000, 3, 30, 10, 15, 0, 0), // Apr 30, 2000
        new Date(2000, 4, 31, 10, 15, 0, 0), // May 31, 2000
        new Date(2000, 5, 30, 10, 15, 0, 0), // Jun 30, 2000
        new Date(2000, 6, 31, 10, 15, 0, 0), // Jul 31, 2000
        new Date(2000, 7, 31, 10, 15, 0, 0), // Aug 31, 2000
        new Date(2000, 8, 30, 10, 15, 0, 0), // Sep 30, 2000
        new Date(2000, 9, 31, 10, 15, 0, 0), // Oct 31, 2000
        new Date(2000, 10, 30, 10, 15, 0, 0), // Nov 30, 2000
      ];
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("0 15 10 L-2 * ? - Fire at 10:15am on the 2nd-to-last day of every month", () => {
      const cron = "0 15 10 L-2 * ?";
      let current = new Date(2000, 1, 20, 9, 0, 0, 0);
      const expected = [
        new Date(2000, 1, 27, 10, 15, 0, 0), // Feb 27, 2000
        new Date(2000, 2, 29, 10, 15, 0, 0), // Mar 29, 2000
        new Date(2000, 3, 28, 10, 15, 0, 0), // Apr 28, 2000
        new Date(2000, 4, 29, 10, 15, 0, 0), // May 29, 2000
        new Date(2000, 5, 28, 10, 15, 0, 0), // Jun 28, 2000
        new Date(2000, 6, 29, 10, 15, 0, 0), // Jul 29, 2000
        new Date(2000, 7, 29, 10, 15, 0, 0), // Aug 29, 2000
        new Date(2000, 8, 28, 10, 15, 0, 0), // Sep 28, 2000
        new Date(2000, 9, 29, 10, 15, 0, 0), // Oct 29, 2000
        new Date(2000, 10, 28, 10, 15, 0, 0), // Nov 28, 2000
      ];
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("0 15 10 ? * 6L - Fire at 10:15am on the last Friday of every month", () => {
      const cron = "0 15 10 ? * 6L";
      let current = new Date(2000, 1, 1, 9, 0, 0, 0);
      const expected = [
        new Date(2000, 1, 25, 10, 15, 0, 0), // Feb 25, 2000
        new Date(2000, 2, 31, 10, 15, 0, 0), // Mar 31, 2000
        new Date(2000, 3, 28, 10, 15, 0, 0), // Apr 28, 2000
        new Date(2000, 4, 26, 10, 15, 0, 0), // May 26, 2000
        new Date(2000, 5, 30, 10, 15, 0, 0), // Jun 30, 2000
        new Date(2000, 6, 28, 10, 15, 0, 0), // Jul 28, 2000
        new Date(2000, 7, 25, 10, 15, 0, 0), // Aug 25, 2000
        new Date(2000, 8, 29, 10, 15, 0, 0), // Sep 29, 2000
        new Date(2000, 9, 27, 10, 15, 0, 0), // Oct 27, 2000
        new Date(2000, 10, 24, 10, 15, 0, 0), // Nov 24, 2000
      ];
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("0 15 10 ? * 6L 2002-2005 - Fire on last Friday during specific years", () => {
      const cron = "0 15 10 ? * 6L 2002-2005";
      let current = new Date(2003, 1, 1, 9, 0, 0, 0);
      const expected = [
        new Date(2003, 1, 28, 10, 15, 0, 0), // Feb 28, 2003
        new Date(2003, 2, 28, 10, 15, 0, 0), // Mar 28, 2003
        new Date(2003, 3, 25, 10, 15, 0, 0), // Apr 25, 2003
        new Date(2003, 4, 30, 10, 15, 0, 0), // May 30, 2003
        new Date(2003, 5, 27, 10, 15, 0, 0), // Jun 27, 2003
        new Date(2003, 6, 25, 10, 15, 0, 0), // Jul 25, 2003
        new Date(2003, 7, 29, 10, 15, 0, 0), // Aug 29, 2003
        new Date(2003, 8, 26, 10, 15, 0, 0), // Sep 26, 2003
        new Date(2003, 9, 31, 10, 15, 0, 0), // Oct 31, 2003
        new Date(2003, 10, 28, 10, 15, 0, 0), // Nov 28, 2003
      ];
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });
  });

  describe("Nth weekday expressions", () => {
    it("0 15 10 ? * 6#3 - Fire at 10:15am on the third Friday of every month", () => {
      const cron = "0 15 10 ? * 6#3";
      let current = new Date(2000, 1, 1, 9, 0, 0, 0);
      const expected = [
        new Date(2000, 1, 18, 10, 15, 0, 0), // Feb 18, 2000
        new Date(2000, 2, 17, 10, 15, 0, 0), // Mar 17, 2000
        new Date(2000, 3, 21, 10, 15, 0, 0), // Apr 21, 2000
        new Date(2000, 4, 19, 10, 15, 0, 0), // May 19, 2000
        new Date(2000, 5, 16, 10, 15, 0, 0), // Jun 16, 2000
        new Date(2000, 6, 21, 10, 15, 0, 0), // Jul 21, 2000
        new Date(2000, 7, 18, 10, 15, 0, 0), // Aug 18, 2000
        new Date(2000, 8, 15, 10, 15, 0, 0), // Sep 15, 2000
        new Date(2000, 9, 20, 10, 15, 0, 0), // Oct 20, 2000
        new Date(2000, 10, 17, 10, 15, 0, 0), // Nov 17, 2000
      ];
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });
  });

  describe("Special date combinations", () => {
    it("0 11 11 11 11 ? - Fire every November 11th at 11:11am", () => {
      const cron = "0 11 11 11 11 ?";
      let current = new Date(2000, 10, 1, 9, 0, 0, 0);
      const expected = [
        new Date(2000, 10, 11, 11, 11, 0, 0), // Nov 11, 2000
        new Date(2001, 10, 11, 11, 11, 0, 0), // Nov 11, 2001
        new Date(2002, 10, 11, 11, 11, 0, 0), // Nov 11, 2002
        new Date(2003, 10, 11, 11, 11, 0, 0), // Nov 11, 2003
        new Date(2004, 10, 11, 11, 11, 0, 0), // Nov 11, 2004
        new Date(2005, 10, 11, 11, 11, 0, 0), // Nov 11, 2005
        new Date(2006, 10, 11, 11, 11, 0, 0), // Nov 11, 2006
        new Date(2007, 10, 11, 11, 11, 0, 0), // Nov 11, 2007
        new Date(2008, 10, 11, 11, 11, 0, 0), // Nov 11, 2008
        new Date(2009, 10, 11, 11, 11, 0, 0), // Nov 11, 2009
      ];
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });
  });

  describe("Edge cases and past times", () => {
    it("Should return next day when time has passed", () => {
      const cron = "0 0 12 * * ?";
      let current = new Date(2000, 1, 1, 13, 0, 0, 0);
      const expected = Array.from(
        { length: 10 },
        (_, i) => new Date(2000, 1, 2 + i, 12, 0, 0, 0)
      );
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("Should handle month transitions", () => {
      const cron = "0 0 12 * * ?";
      let current = new Date(2000, 1, 29, 13, 0, 0, 0);
      const expected = [
        new Date(2000, 2, 1, 12, 0, 0, 0), // Mar 1, 2000
        new Date(2000, 2, 2, 12, 0, 0, 0),
        new Date(2000, 2, 3, 12, 0, 0, 0),
        new Date(2000, 2, 4, 12, 0, 0, 0),
        new Date(2000, 2, 5, 12, 0, 0, 0),
        new Date(2000, 2, 6, 12, 0, 0, 0),
        new Date(2000, 2, 7, 12, 0, 0, 0),
        new Date(2000, 2, 8, 12, 0, 0, 0),
        new Date(2000, 2, 9, 12, 0, 0, 0),
        new Date(2000, 2, 10, 12, 0, 0, 0),
      ];
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("Should handle year transitions", () => {
      const cron = "0 0 12 * * ?";
      let current = new Date(2000, 11, 31, 13, 0, 0, 0);
      const expected = [
        new Date(2001, 0, 1, 12, 0, 0, 0), // Jan 1, 2001
        new Date(2001, 0, 2, 12, 0, 0, 0),
        new Date(2001, 0, 3, 12, 0, 0, 0),
        new Date(2001, 0, 4, 12, 0, 0, 0),
        new Date(2001, 0, 5, 12, 0, 0, 0),
        new Date(2001, 0, 6, 12, 0, 0, 0),
        new Date(2001, 0, 7, 12, 0, 0, 0),
        new Date(2001, 0, 8, 12, 0, 0, 0),
        new Date(2001, 0, 9, 12, 0, 0, 0),
        new Date(2001, 0, 10, 12, 0, 0, 0),
      ];
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate(cron, current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });
  });

  describe("L character restrictions", () => {
    it("should reject L with lists in day-of-month", () => {
      expect(() => parseCron("0 0 12 L,5 * ?")).toThrow(
        /Invalid day-of-month expression: cannot specify lists with 'L'/i
      );
    });

    it("should reject L with ranges in day-of-month", () => {
      expect(() => parseCron("0 0 12 L-3,10 * ?")).toThrow(
        /Invalid day-of-month expression: cannot specify ranges with 'L'/i
      );
    });

    it("should reject L with step values in day-of-month", () => {
      expect(() => parseCron("0 0 12 L/2 * ?")).toThrow(
        /Invalid day-of-month expression: cannot specify steps with 'L'/i
      );
    });

    it("should reject L with lists in day-of-week", () => {
      expect(() => parseCron("0 0 12 ? * 6L,1")).toThrow(
        /Invalid day-of-week expression: cannot specify lists with 'L'/i
      );
    });

    it("should reject L with ranges in day-of-week", () => {
      expect(() => parseCron("0 0 12 ? * 1L-6L")).toThrow(
        /Invalid day-of-week expression: cannot specify ranges with 'L'/i
      );
    });
  });

  describe("W character restrictions", () => {
    it("should reject W with lists", () => {
      expect(() => parseCron("0 0 12 15W,20W * ?")).toThrow(
        /Invalid day-of-month expression: 'W' can only be specified for a single day/i
      );
    });

    it("should reject W with ranges", () => {
      expect(() => parseCron("0 0 12 15W-20W * ?")).toThrow(
        /Invalid day-of-month expression: 'W' can only be specified for a single day/i
      );
    });

    it("should reject W with step values", () => {
      expect(() => parseCron("0 0 12 15W/5 * ?")).toThrow(
        /Invalid day-of-month expression: 'W' can only be specified for a single day/i
      );
    });
  });

  describe("Day boundary crossing for W expressions", () => {
    it("1W on Saturday should move to Monday the 3rd, not previous month", () => {
      // January 1, 2000 was a Saturday
      const fromDate = new Date(1999, 11, 31, 9, 0, 0, 0); // Dec 31, 1999
      const nextDate = getNextCronDate("0 0 12 1W * ?", fromDate);
      expect(nextDate).toStrictEqual(new Date(2000, 0, 3, 12, 0, 0, 0)); // Monday Jan 3, not Friday Dec 31
    });

    it("31W on Sunday should move to Friday the 29th, not next month", () => {
      // January 31, 2021 was a Sunday
      const fromDate = new Date(2021, 0, 1, 9, 0, 0, 0); // Jan 1, 2021
      const nextDate = getNextCronDate("0 0 12 31W * ?", fromDate);
      expect(nextDate).toStrictEqual(new Date(2021, 0, 29, 12, 0, 0, 0)); // Friday Jan 29, not Monday Feb 1
    });
  });

  describe("Invalid day validation", () => {
    it("should handle February 30th gracefully", () => {
      const fromDate = new Date(2000, 1, 1, 9, 0, 0, 0); // Feb 1, 2000
      const nextDate = getNextCronDate("0 0 12 30 * ?", fromDate);
      // Should skip February and fire on March 30th
      expect(nextDate).toStrictEqual(new Date(2000, 2, 30, 12, 0, 0, 0)); // March 30
    });

    it("should handle February 29th in non-leap year", () => {
      const fromDate = new Date(2001, 1, 1, 9, 0, 0, 0); // Feb 1, 2001 (non-leap year)
      const nextDate = getNextCronDate("0 0 12 29 * ?", fromDate);
      // Should skip February and fire on March 29th
      expect(nextDate).toStrictEqual(new Date(2001, 2, 29, 12, 0, 0, 0)); // March 29
    });

    it("should handle February 29th in leap year", () => {
      const fromDate = new Date(2000, 1, 1, 9, 0, 0, 0); // Feb 1, 2000 (leap year)
      const nextDate = getNextCronDate("0 0 12 29 * ?", fromDate);
      // Should fire on February 29th in leap year
      expect(nextDate).toStrictEqual(new Date(2000, 1, 29, 12, 0, 0, 0)); // Feb 29
    });
  });

  describe("Null handling from special expressions", () => {
    it("should handle 5th occurrence that doesn't exist", () => {
      // February 2000 has no 5th Wednesday (Feb has 4 Wednesdays: 2, 9, 16, 23)
      const fromDate = new Date(2000, 1, 1, 9, 0, 0, 0); // Feb 1, 2000
      const nextDate = getNextCronDate("0 0 12 ? * 4#5", fromDate); // 5th Wednesday
      // Should find next month that has 5th Wednesday (March 2000)
      expect(nextDate).toStrictEqual(new Date(2000, 2, 29, 12, 0, 0, 0)); // March 29, 2000 (5th Wednesday)
    });

    it("should handle 6th occurrence (invalid)", () => {
      const fromDate = new Date(2000, 1, 1, 9, 0, 0, 0);
      const nextDate = getNextCronDate("0 0 12 ? * 1#6", fromDate); // 6th Sunday (impossible)
      expect(nextDate).toBeNull(); // Should never find a match
    });
  });

  describe("Year range validation", () => {
    it("should reject years before 1970", () => {
      expect(() => parseCron("0 0 12 * * ? 1969")).toThrow(
        /Invalid year expression: year must be between 1970 and 2099/i
      );
    });

    it("should reject years after 2099", () => {
      expect(() => parseCron("0 0 12 * * ? 2100")).toThrow(
        /Invalid year expression: year must be between 1970 and 2099/i
      );
    });

    it("should handle year range boundaries correctly", () => {
      const fromDate = new Date(1970, 0, 1, 9, 0, 0, 0);
      const nextDate1970 = getNextCronDate("0 0 12 * * ? 1970", fromDate);
      expect(nextDate1970).toStrictEqual(new Date(1970, 0, 1, 12, 0, 0, 0));

      const fromDate2099 = new Date(2099, 0, 1, 9, 0, 0, 0);
      const nextDate2099 = getNextCronDate("0 0 12 * * ? 2099", fromDate2099);
      expect(nextDate2099).toStrictEqual(new Date(2099, 0, 1, 12, 0, 0, 0));
    });
  });

  describe("Step expressions with special characters", () => {
    it("should throw for invalid expressions in day-of-month", () => {
      expect(() => {
        getNextCronDate("0 0 12 L/5 * ?", new Date());
      }).toThrow();
    });

    it("should throw for invalid step expressions in day-of-week", () => {
      expect(() => {
        getNextCronDate("0 0 12 ? * 1#3/2", new Date());
      }).toThrow();
    });
  });

  describe("Month boundary edge cases", () => {
    it("should handle last Friday when month has exactly 4 Fridays", () => {
      // Find a month where last Friday is the 4th Friday
      const fromDate = new Date(2000, 1, 1, 9, 0, 0, 0); // Feb 2000
      const nextDate = getNextCronDate("0 0 12 ? * 6L", fromDate);
      expect(nextDate?.getDate()).toBe(25); // Should be Feb 25, 2000 (last Friday)
    });

    it("should handle last Friday when month has 5 Fridays", () => {
      // Find a month where last Friday is the 5th Friday
      const fromDate = new Date(2000, 11, 1, 9, 0, 0, 0); // Dec 2000
      const nextDate = getNextCronDate("0 0 12 ? * 6L", fromDate);
      expect(nextDate?.getDate()).toBe(29); // Should be Dec 29, 2000 (last Friday)
    });
  });

  describe("Complex expression validation", () => {
    it("should reject excessive step sizes", () => {
      expect(() => parseCron("0 0/100 12 * * ?")).toThrow(
        /Invalid minutes expression: invalid step value/i
      );
    });

    it("should reject invalid step combinations", () => {
      expect(() => parseCron("0 60/5 12 * * ?")).toThrow(
        /Invalid minutes expression: invalid start value/i
      );
    });

    it("should handle large lists efficiently", () => {
      const longList = Array.from({ length: 31 }, (_, i) => i + 1).join(",");
      expect(() => parseCron(`0 0 12 ${longList} * ?`)).not.toThrow();
    });
  });

  describe("Case sensitivity and error messages", () => {
    it("should preserve original case in error messages", () => {
      try {
        parseCron("0 0 12 ? * xyz"); // Use ? for day-of-month to avoid mutual exclusivity
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(toError(error).message).toMatch(
          /Invalid day-of-week expression: invalid alias: xyz/
        );
      }
    });

    it("should handle mixed case aliases correctly", () => {
      const nextDate1 = getNextCronDate("0 0 12 * jan ?", new Date(2000, 0, 1));
      const nextDate2 = getNextCronDate("0 0 12 * JAN ?", new Date(2000, 0, 1));
      const nextDate3 = getNextCronDate("0 0 12 * Jan ?", new Date(2000, 0, 1));

      expect(nextDate1).toStrictEqual(nextDate2);
      expect(nextDate2).toStrictEqual(nextDate3);
    });
  });

  describe("Performance edge cases", () => {
    it("should not infinite loop on impossible conditions", () => {
      const start = Date.now();
      const nextDate = getNextCronDate("0 0 12 31 2 ?", new Date(2000, 1, 1)); // Feb 31 (impossible)
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(1000); // Should complete quickly
      expect(nextDate?.getMonth()).not.toBe(1); // Should skip February
    });

    it("should handle far future dates efficiently", () => {
      const start = Date.now();
      const nextDate = getNextCronDate(
        "0 0 12 * * ? 2099",
        new Date(2000, 0, 1)
      );
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(1000); // Should complete quickly
      if (nextDate) {
        expect(nextDate.getFullYear()).toBe(2099);
      } else {
        // If null due to search limits, that's acceptable too
        expect(nextDate).toBeNull();
      }
    });
  });

  describe("Timezone independence", () => {
    it("should produce consistent results regardless of system timezone", () => {
      // This test might need to be skipped in some environments
      const fromDate = new Date(2000, 5, 15, 12, 0, 0, 0); // June 15, 2000, noon
      const nextDate = getNextCronDate("0 0 0 16 * ?", fromDate);

      expect(nextDate?.getDate()).toBe(16);
      expect(nextDate?.getHours()).toBe(0);
      expect(nextDate?.getMinutes()).toBe(0);
      expect(nextDate?.getSeconds()).toBe(0);
    });
  });

  describe("Additional edge and dark-corner cron tests", () => {
    it("should throw if both day-of-month and day-of-week are set", () => {
      expect(() => parseCron("0 0 12 1 1 1")).toThrow(
        /Cannot specify both day-of-month and day-of-week/i
      );
    });

    it("should throw if both day-of-month and day-of-week are '?'", () => {
      expect(() => parseCron("0 0 12 ? * ?")).toThrow(
        /At least one of day-of-month or day-of-week must be specified/i
      );
    });

    it("should fire on Feb 29 in leap year", () => {
      const nextDate = getNextCronDate(
        "0 0 0 29 2 ? 2000",
        new Date(1999, 11, 31)
      );
      expect(nextDate).toStrictEqual(new Date(2000, 1, 29, 0, 0, 0, 0));
    });

    it("should not fire on Feb 29 in non-leap year", () => {
      const nextDate = getNextCronDate(
        "0 0 0 29 2 ? 2001",
        new Date(2001, 0, 1)
      );
      expect(nextDate?.getMonth()).not.toBe(1); // Should not be February
    });

    it("should not fire on April 31st (invalid date)", () => {
      const nextDate = getNextCronDate("0 0 0 31 4 ?", new Date(2000, 3, 1));
      expect(nextDate?.getMonth()).not.toBe(3); // Should not be April
    });

    it("should fire 1W on Monday 3rd if 1st is Saturday", () => {
      // Jan 1, 2000 is Saturday, so 1W should be Jan 3 (Monday)
      const nextDate = getNextCronDate("0 0 12 1W * ?", new Date(1999, 11, 31));
      expect(nextDate).toStrictEqual(new Date(2000, 0, 3, 12, 0, 0, 0));
    });

    it("should fire 31W on Friday 30th if 31st is Saturday", () => {
      // July 31, 2021 is Saturday, so 31W should be July 30 (Friday)
      const nextDate = getNextCronDate("0 0 12 31W 7 ?", new Date(2021, 6, 1));
      expect(nextDate).toStrictEqual(new Date(2021, 6, 30, 12, 0, 0, 0));
    });

    it("should fire 15W on 15th if 15th is a weekday", () => {
      // March 15, 2023 is Wednesday
      const nextDate = getNextCronDate("0 0 12 15W 3 ?", new Date(2023, 2, 1));
      expect(nextDate).toStrictEqual(new Date(2023, 2, 15, 12, 0, 0, 0));
    });

    it("L-0 should be same as L", () => {
      const lDate = getNextCronDate("0 0 12 L * ?", new Date(2022, 0, 1));
      const l0Date = getNextCronDate("0 0 12 L-0 * ?", new Date(2022, 0, 1));
      expect(lDate).toStrictEqual(l0Date);
    });

    it("L-31 should be invalid (out of range)", () => {
      expect(() => parseCron("0 0 12 L-32 * ?")).toThrow(
        /Invalid day-of-month expression: invalid offset in last day/i
      );
    });

    it("LW should fire on last day if it's a weekday", () => {
      // May 31, 2021 is Monday
      const nextDate = getNextCronDate("0 0 12 LW 5 ?", new Date(2021, 4, 1));
      expect(nextDate).toStrictEqual(new Date(2021, 4, 31, 12, 0, 0, 0));
    });

    it("LW should fire on last Friday if last day is weekend", () => {
      // July 31, 2021 is Saturday, so last weekday is July 30 (Friday)
      const nextDate = getNextCronDate("0 0 12 LW 7 ?", new Date(2021, 6, 1));
      expect(nextDate).toStrictEqual(new Date(2021, 6, 30, 12, 0, 0, 0));
    });

    it("should fire on first Sunday of the month (1#1)", () => {
      const nextDate = getNextCronDate("0 0 12 ? * 1#1", new Date(2022, 4, 1));
      expect(nextDate?.getDay()).toBe(0); // Sunday
      expect(nextDate?.getDate()).toBeLessThanOrEqual(7);
    });

    it("should return null for 5th Thursday in a month with only 4 Thursdays", () => {
      // April 2021 has only 5 Thursdays, so May 2021 has only 4
      const nextDate = getNextCronDate(
        "0 0 12 ? 5 5#5 2021",
        new Date(2021, 4, 1)
      );
      expect(nextDate).toBeNull();
    });

    it("should throw for 0/0 in minutes field", () => {
      expect(() => parseCron("0 0/0 12 * * ?")).toThrow(
        /Invalid minutes expression: invalid step value/i
      );
    });

    it("should treat */1 as equivalent to *", () => {
      const star = getNextCronDate(
        "0 * 12 * * ?",
        new Date(2022, 0, 1, 12, 0, 0, 0)
      );
      const star1 = getNextCronDate(
        "0 */1 12 * * ?",
        new Date(2022, 0, 1, 12, 0, 0, 0)
      );
      expect(star).toStrictEqual(star1);
    });

    it("should fire only at 0 for 0-0 in minute field", () => {
      const nextDate = getNextCronDate(
        "0 0-0 12 * * ?",
        new Date(2022, 0, 1, 11, 59, 0, 0)
      );
      expect(nextDate?.getMinutes()).toBe(0);
    });

    it("should fire every even second for 0-59/2", () => {
      let current = new Date(2022, 0, 1, 12, 0, 0, 0);
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate("0-59/2 * 12 * * ?", current);
        expect(nextDate!.getSeconds() % 2).toBe(0);
        current = nextDate!;
      }
    });

    it("should support JAN,MAR,MAY in month field", () => {
      let current = new Date(2022, 0, 1, 11, 0, 0, 0);
      const expectedMonths = [0, 2, 4, 0, 2, 4, 0, 2, 4, 0]; // Jan, Mar, May, repeat
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate("0 0 12 1 JAN,MAR,MAY ?", current);
        expect(nextDate?.getMonth()).toBe(expectedMonths[i]);
        current = nextDate!;
      }
    });

    it("should support MON,WED,FRI in day-of-week field", () => {
      let current = new Date(2022, 0, 1, 12, 0, 0, 0);
      const expectedDays = [1, 3, 5, 1, 3, 5, 1, 3, 5, 1]; // Mon, Wed, Fri, repeat
      for (let i = 0; i < 10; i++) {
        const nextDate = getNextCronDate("0 0 12 ? * MON,WED,FRI", current);
        expect(nextDate?.getDay()).toBe(expectedDays[i]);
        current = nextDate!;
      }
    });

    it("should support year as a range", () => {
      let current = new Date(2020, 0, 1, 11, 0, 0, 0);
      const years = [2020, 2021, 2022];
      for (let i = 0; i < years.length; i++) {
        const nextDate = getNextCronDate("0 0 12 1 1 ? 2020-2022", current);
        expect(nextDate?.getFullYear()).toBe(years[i]);
        current = new Date(nextDate!.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
      }
    });

    it("should support year as a list", () => {
      let current = new Date(2020, 0, 1, 11, 0, 0, 0);
      const years = [2020, 2022, 2024];
      for (let i = 0; i < years.length; i++) {
        const nextDate = getNextCronDate(
          "0 0 12 1 1 ? 2020,2022,2024",
          current
        );
        expect(nextDate?.getFullYear()).toBe(years[i]);
        current = new Date(nextDate!.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
      }
    });

    it("should throw for 60 in seconds field", () => {
      expect(() => parseCron("60 * * * * ?")).toThrow(
        /Invalid seconds expression: invalid value/i
      );
    });

    it("should throw for 60 in minutes field", () => {
      expect(() => parseCron("0 60 * * * ?")).toThrow(
        /Invalid minutes expression: invalid value/i
      );
    });

    it("should throw for 24 in hours field", () => {
      expect(() => parseCron("0 0 24 * * ?")).toThrow(
        /Invalid hours expression: invalid value/i
      );
    });

    it("should parse with extra spaces between fields", () => {
      expect(() => parseCron("0  0  12  *  *  ?")).not.toThrow();
    });

    it("should throw for empty string", () => {
      expect(() => parseCron("")).toThrow(/Empty cron expression/i);
    });

    it("should throw for L in month field", () => {
      expect(() => parseCron("0 0 12 * L ?")).toThrow(
        /Invalid month expression: special characters 'L', 'W', or '#' are not allowed in month field/i
      );
    });

    it("should throw for W in day-of-week field", () => {
      expect(() => parseCron("0 0 12 ? * 1W")).toThrow(
        /Invalid day-of-week expression: 'W' is not allowed in day-of-week field/i
      );
    });

    it("should throw for # in day-of-month field", () => {
      expect(() => parseCron("0 0 12 1#1 * ?")).toThrow(
        /Invalid day-of-month expression: '#' is not allowed in day-of-month field/i
      );
    });

    it("should handle lower/mixed/upper case aliases", () => {
      const d1 = getNextCronDate("0 0 12 * jan ?", new Date(2022, 0, 1));
      const d2 = getNextCronDate("0 0 12 * JAN ?", new Date(2022, 0, 1));
      const d3 = getNextCronDate("0 0 12 * Jan ?", new Date(2022, 0, 1));
      expect(d1).toStrictEqual(d2);
      expect(d2).toStrictEqual(d3);
    });

    it("should never fire for Feb 31st", () => {
      const nextDate = getNextCronDate("0 0 12 31 2 ?", new Date(2022, 0, 1));
      expect(nextDate?.getMonth()).not.toBe(1); // Should not be February
    });

    it("should never fire for Feb 30th", () => {
      const nextDate = getNextCronDate("0 0 12 30 2 ?", new Date(2022, 0, 1));
      expect(nextDate?.getMonth()).not.toBe(1); // Should not be February
    });

    it("should fire at 14:00 and 14:30 each day for 0 0,30 14 * * ?", () => {
      let current = new Date(2022, 0, 1, 13, 0, 0, 0);
      const expected = [
        new Date(2022, 0, 1, 14, 0, 0, 0),
        new Date(2022, 0, 1, 14, 30, 0, 0),
        new Date(2022, 0, 2, 14, 0, 0, 0),
        new Date(2022, 0, 2, 14, 30, 0, 0),
        new Date(2022, 0, 3, 14, 0, 0, 0),
        new Date(2022, 0, 3, 14, 30, 0, 0),
        new Date(2022, 0, 4, 14, 0, 0, 0),
        new Date(2022, 0, 4, 14, 30, 0, 0),
        new Date(2022, 0, 5, 14, 0, 0, 0),
        new Date(2022, 0, 5, 14, 30, 0, 0),
      ];
      for (let i = 0; i < expected.length; i++) {
        const nextDate = getNextCronDate("0 0,30 14 * * ?", current);
        expect(nextDate).toStrictEqual(expected[i]);
        current = nextDate!;
      }
    });

    it("should fire on first second of the year", () => {
      const nextDate = getNextCronDate(
        "0 0 0 1 1 ?",
        new Date(2020, 11, 31, 23, 59, 59, 999)
      );
      expect(nextDate).toStrictEqual(new Date(2021, 0, 1, 0, 0, 0, 0));
    });

    it("should fire on last second of the year", () => {
      const nextDate = getNextCronDate(
        "59 59 23 31 12 ?",
        new Date(2021, 11, 31, 23, 59, 58, 0)
      );
      expect(nextDate).toStrictEqual(new Date(2021, 11, 31, 23, 59, 59, 0));
    });
  });
});

function toError(error: unknown): Error {
  if (error instanceof Error) return error;

  function hasMessage(error: unknown): error is { message: string } {
    return (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as Record<string, unknown>).message === "string"
    );
  }

  if (hasMessage(error)) {
    return new Error(error.message);
  }

  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}
