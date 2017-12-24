import BackgroundJob from "react-native-background-job";

import BackgroundAlarmCreatorJob from './background-alarm-creator-job';

const BG_JOB_KEY = "BG_JOB_KEY";
const EXECUTION_TIMEOUT_SECONDS = 30;
const SCHEDULE_INTERVAL_SECONDS = 3600;

BackgroundJob.register({
  jobKey: BG_JOB_KEY,
  job: () => {
    console.log(`Background job fired on ${new Date()}. Key = ${BG_JOB_KEY}`);
    new BackgroundAlarmCreatorJob().tryRun();
  }
});

export default class BackgroundWorker {
  static updateJob(enabled) {
    BackgroundJob.cancelAll();
    if (!enabled) {
      return;
    }

    BackgroundJob.schedule({
      jobKey: BG_JOB_KEY,
      period: SCHEDULE_INTERVAL_SECONDS * 1000,
      timeout: EXECUTION_TIMEOUT_SECONDS * 1000,
      persist: true,
    });
  }
}
