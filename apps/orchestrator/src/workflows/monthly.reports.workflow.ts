import { continueAsNew, proxyActivities, sleep } from '@temporalio/workflow';
import { ReportsActivity } from '@gitroom/orchestrator/activities/reports.activity';

const { sendMonthlyReports } = proxyActivities<ReportsActivity>({
  startToCloseTimeout: '30 minutes',
  retry: {
    maximumAttempts: 3,
    backoffCoefficient: 2,
    initialInterval: '10 minutes',
  },
});

// Checks a few times a day; ReportsService.sendMonthly only acts on the
// first days of a month and sends each month's report once. Started with
// the other background jobs when RUN_CRON is set.
export async function monthlyReportsWorkflow() {
  for (let run = 0; run < 60; run++) {
    await sendMonthlyReports();
    await sleep('6 hours');
  }
  return await continueAsNew<typeof monthlyReportsWorkflow>();
}
