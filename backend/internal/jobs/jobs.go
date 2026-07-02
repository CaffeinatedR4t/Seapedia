package jobs

// Jobs package — background workers and cron schedules.
//
// Planned jobs:
//   overdue_worker.go — runs on a schedule (or via Admin endpoint) to sweep
//                       orders past their delivery SLA and trigger auto-refund.
//                       Uses robfig/cron/v3 or a manual endpoint for time simulation.
