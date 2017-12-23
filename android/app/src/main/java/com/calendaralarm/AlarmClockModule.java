package com.calendaralarm;

import android.content.Intent;
import android.provider.AlarmClock;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.*;

import java.util.Map;
import java.util.HashMap;

public class AlarmClockModule extends ReactContextBaseJavaModule {
  public AlarmClockModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "AlarmClock";
  }

  @ReactMethod
  public void schedule(String message, int hour, int minute) {
    Intent i = new Intent(AlarmClock.ACTION_SET_ALARM);
    i.putExtra(AlarmClock.EXTRA_MESSAGE, message);
    i.putExtra(AlarmClock.EXTRA_HOUR, hour);
    i.putExtra(AlarmClock.EXTRA_MINUTES, minute);
    i.putExtra(AlarmClock.EXTRA_SKIP_UI, true);
    getReactApplicationContext().startActivity(i);
  }
}
