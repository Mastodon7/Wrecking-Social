import { continueAsNew, proxyActivities, sleep } from '@temporalio/workflow';
import { PostActivity } from '@gitroom/orchestrator/activities/post.activity';

const { deleteDisconnectedChannels } = proxyActivities<PostActivity>({
  startToCloseTimeout: '10 minute',
  retry: {
    maximumAttempts: 3,
    backoffCoefficient: 1,
    initialInterval: '2 minutes',
  },
});

// Once a day, removes the channels that have needed a reconnect for 14 days
// (see PostsService.deleteChannelsDisconnectedFor). Started with the other
// background jobs when RUN_CRON is set.
export async function disconnectedChannelsWorkflow() {
  await deleteDisconnectedChannels();
  for (let day = 0; day < 30; day++) {
    await sleep('1 day');
    await deleteDisconnectedChannels();
  }

  // Keep the history small
  return await continueAsNew<typeof disconnectedChannelsWorkflow>();
}
