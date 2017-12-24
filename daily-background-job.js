import BackgroundJob from "react-native-background-job";

import Preferences from './preferences';
import { todayMidnightRelativeTime } from './util';


const EXECUTION_TIMEOUT_SECONDS = 30;
const SCHEDULE_INTERVAL_SECONDS = 3600;
const CONFIG_NAME_MAIN = "BackgroundWorker.%s.config";
const CONFIG_NAME_LAST_RUN = "BackgroundWorker.%s.lastRun";


export default class DailyBackgroundJob {
  constructor(jobKey) {
    this.jobKey = jobKey;
    this.configNameMain = CONFIG_NAME_MAIN.replace('%s', this.jobKey);
    this.configNameLastRun = CONFIG_NAME_LAST_RUN.replace('%s', this.jobKey);
  }

  // Required fields in config: enabled, scheduledHour, scheduledMinute
  // Optional fields in config: checkIntervalSeconds, callbackTimeoutSeconds
  schedule(config) {
    if (!config
        || config.enabled === undefined
        || config.scheduledHour === undefined
        || config.scheduledMinute === undefined)
    {
      throw `Invalid argument 'config', got: ${config}`;
    }

    Preferences.save(this.configNameMain, config);
    this._scheduleJob(config);
  }

  register(callback) {
    BackgroundJob.register({
      jobKey: this.jobKey,
      job: () => {
        console.log(`Checking whether to run ${this.jobKey} callback.`);
        this.runIfScheduled(callback);
      }
    });
  }

  runIfScheduled(callback) {
    this._loadPreferences()
      .catch(error => {
        throw `Failed config load for background job ${this.jobKey}: ${error}`;
      })
      .then(values => {
        const [config, lastRun] = values;

        const [shouldRun, message] = this._shouldRun(config, lastRun);
        if (!shouldRun) {
          console.log(message);
          return;
        }

        return this._executeCallback(callback);
      })
      .catch(error => {
        console.error(`Failed scheduling job ${this.jobKey}: ${error}`);
      });
  }

  _scheduleJob(config) {
    BackgroundJob.cancelAll();
    if (!config.enabled) {
      return;
    }

    const period = config.checkIntervalSeconds || SCHEDULE_INTERVAL_SECONDS;
    const timeout = config.callbackTimeoutSeconds || EXECUTION_TIMEOUT_SECONDS;
    BackgroundJob.schedule({
      jobKey: this.jobKey,
      period: period * 1000,
      timeout: timeout * 1000,
      persist: true,
    });
  }

  _loadPreferences() {
    pConfig = Preferences.load(this.configNameMain);
    pLastRun = Preferences.load(this.configNameLastRun)
      .then(dateStr => new Date(dateStr))
      .catch(error => {
        return todayMidnightRelativeTime(-24, 0);  // yesterday midnight
      });

    return Promise.all([pConfig, pLastRun]);
  }

  // Return true if config enabled and within correct time window.
  // (last run before scheduled time, current time after)
  _shouldRun(config, lastRunDate) {
    if (!config.enabled) {
      return [false, `Skipping job ${this.jobKey}: config not enabled`];
    }

    const scheduledDate = todayMidnightRelativeTime(
        config.scheduledHour, config.scheduledMinute);
    const now = new Date();
    const shouldRun = (lastRunDate < scheduledDate && now >= scheduledDate);
    if (!shouldRun) {
      const msg = `Job ${this.jobKey} not scheduled right now: ` +
                  `lastRunDate: ${lastRunDate}, ` +
                  `scheduledDate: ${scheduledDate}, ` +
                  `now: ${now}`;
      return [false, msg];
    }

    return [true, ''];
  }

  _executeCallback(callback) {
    let result = undefined;
    try {
      result = callback();
    } catch (error) {
      console.error(`Failed to invoke ${this.jobKey} callback: ${error}`);
      return result;
    } finally {
      Preferences.save(this.configNameLastRun, new Date().toISOString());
    }

    var resultIsPromise = (result && typeof(result.then) == 'function');
    if (resultIsPromise) {
      return result.catch(error => {
        console.error(`Callback ${this.jobKey} returned rejected promise: ${error}`);
      });
    } else {
      return result;
    }
  }
}
