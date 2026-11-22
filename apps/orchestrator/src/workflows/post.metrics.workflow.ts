import { continueAsNew, proxyActivities, sleep } from '@temporalio/workflow';
import { PostActivity } from '@gitroom/orchestrator/activities/post.activity';

const { collectPostMetrics } = proxyActivities<PostActivity>({
  // one run measures up to 2000 posts with a pause between platform calls
  startToCloseTimeout: '2 hours',
  retry: {
    maximumAttempts: 2,
    backoffCoefficient: 1,
    initialInterval: '10 minutes',
  },
});

// Once a day, saves the engagement numbers of recent posts so Insights can
// compare them over time (InsightsService.collectMetrics). Started with the
// other background jobs when RUN_CRON is set.
export async function postMetricsWorkflow() {
  await collectPostMetrics();
  for (let day = 0; day < 30; day++) {
    await sleep('1 day');
    await collectPostMetrics();
  }

  // Keep the history small
  return await continueAsNew<typeof postMetricsWorkflow>();
}
