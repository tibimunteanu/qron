# qron

A quartz cron TypesScript implementation.

## Installation

```
npm install qron
```

## Usage

```ts
import {
  parseCron,
  getNextCronDate,
  getCronDatesBetween,
  formatCron,
} from "qron";
import { addMonths } from "date-fns";

const cron = "0 0 1/4 * * ? *";

const from = new Date();
const nextDate = getNextCronDate(cron, from);

const start = new Date();
const end = addMonths(new Date(), 2);
const dates = getCronDatesBetween(cron, start, end);

const formatted = formatCron(cron);

console.log(formatted, nextDate, dates);
```
