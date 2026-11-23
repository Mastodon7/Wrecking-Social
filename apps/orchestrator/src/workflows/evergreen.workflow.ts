import { continueAsNew, proxyActivities, sleep } from '@temporalio/workflow';
import { EvergreenActivity } from '@gitroom/orchestrator/activities/evergreen.activity';

const { planEvergreen } = proxyActivities<EvergreenActivity>({
  startToCloseTimeout: '30 minutes',
  retry: {
    maximumAttempts: 3,
    backoffCoefficient: 2,
    initialInterval: '5 minutes',
  },
});

// Every few hours, keeps the next 7 days of evergreen slots filled
// (EvergreenService.plan). Started with the other background jobs when
// RUN_CRON is set.
export async function evergreenWorkflow() {
  for (let run = 0; run < 60; run++) {
    await planEvergreen();
    await sleep('6 hours');
  }
  return await continueAsNew<typeof evergreenWorkflow>();
}
