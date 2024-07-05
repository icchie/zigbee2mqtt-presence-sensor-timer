class PresenceSensorTimer {
  constructor(zigbee, mqtt, state, publishEntityState, eventBus, settings, logger) {
    logger.info("Loading PresenceSensorTimer");

    this.zigbee = zigbee;
    this.mqtt = mqtt;
    this.state = state;
    this.publishEntityState = publishEntityState;
    this.eventBus = eventBus;
    this.settings = settings;
    this.logger = logger;

    this.mqttBaseTopic = settings.get().mqtt.base_topic;
    this.sensorConfigs = settings.get().presence_sensor_timer_extension?.sensors || [];
    this.timers = new Map();

    logger.info("PresenceSensorTimer loaded successfully");
  }

  start() {
    this.logger.info("PresenceSensorTimer started");

    this.eventBus.onStateChange(this, (data) => {
      this.onStateChange(data);
    });
  }

  onStateChange(data) {
    const sensorConfig = this.sensorConfigs.find((config) => config.sensor === data?.entity?.name);
    if (sensorConfig) {
      const updatedPresenceEvent = data?.update?.presence_event;

      if (["away", "approach", "enter"].includes(updatedPresenceEvent)) {
        this.logger.info(
          `PresenceSensorTimer ${updatedPresenceEvent} event detected for ${sensorConfig.sensor}. Starting/Resetting timer.`,
        );
        this.startTimer(sensorConfig);
        this.publishEnterEvent(sensorConfig.sensor);
      }
    }
  }

  startTimer(sensorConfig) {
    if (this.timers.has(sensorConfig.sensor)) {
      clearTimeout(this.timers.get(sensorConfig.sensor));
      this.logger.debug(`PresenceSensorTimer Existing timer cleared for ${sensorConfig.sensor}.`);
    }
    const timer = setTimeout(() => {
      this.publishLeaveEvent(sensorConfig.sensor);
    }, sensorConfig.timer_duration * 1000);
    this.timers.set(sensorConfig.sensor, timer);
    this.logger.debug(
      `PresenceSensorTimer Timer started for ${sensorConfig.sensor} with duration ${sensorConfig.timer_duration} seconds.`,
    );
  }

  publishEnterEvent(sensor) {
    try {
      const enterPayload = { presence: true };
      this.mqtt.publish(sensor, JSON.stringify(enterPayload));
      this.logger.info(`PresenceSensorTimer Published presence true for ${sensor}`);
    } catch (error) {
      this.logger.error(`PresenceSensorTimer Error publishing enter event for ${sensor}: ${error.message}`, {
        stack: error.stack,
      });
    }
  }

  publishLeaveEvent(sensor) {
    try {
      const leavePayload = {
        reset_nopresence_status: "",
      };
      this.mqtt.publish(sensor, JSON.stringify(leavePayload));
      this.logger.info(`PresenceSensorTimer Published presence false for ${sensor}`);
    } catch (error) {
      this.logger.error(`PresenceSensorTimer Error publishing leave event for ${sensor}: ${error.message}`, {
        stack: error.stack,
      });
    }
  }

  stop() {
    this.eventBus.removeListeners(this);
    for (const [sensor, timer] of this.timers) {
      clearTimeout(timer);
      this.logger.debug(`PresenceSensorTimer Timer cleared on stop for ${sensor}.`);
    }
    this.timers.clear();
    this.logger.info("PresenceSensorTimer stopped");
  }
}

module.exports = PresenceSensorTimer;
