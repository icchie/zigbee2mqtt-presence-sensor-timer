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
    this.sensor = settings.get().presence_sensor_timer_extension?.sensor || "aqara_sensor_1";
    this.timerDuration = settings.get().presence_sensor_timer_extension?.timer_duration || 30;
    this.timer = null;

    logger.info("PresenceSensorTimer loaded successfully");
  }

  start() {
    this.logger.info("PresenceSensorTimer started");

    this.eventBus.onStateChange(this, (data) => {
      this.onStateChange(data);
    });
  }

  onStateChange(data) {
    if (data?.entity?.name === this.sensor) {
      const updatedPresenceEvent = data?.update?.presence_event;

      if (["away", "approach", "enter"].includes(updatedPresenceEvent)) {
        this.logger.info(`PresenceSensorTimer ${updatedPresenceEvent} event detected. Starting/Resetting timer.`);
        this.startTimer();
        this.publishEnterEvent();
      }
    }
  }

  startTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.logger.debug("PresenceSensorTimer Existing timer cleared.");
    }
    this.timer = setTimeout(() => {
      this.publishLeaveEvent();
    }, this.timerDuration * 1000);
    this.logger.debug(`PresenceSensorTimer Timer started for ${this.timerDuration} seconds.`);
  }

  publishEnterEvent() {
    try {
      const enterPayload = { presence: true };
      this.mqtt.publish(this.sensor, JSON.stringify(enterPayload));
      this.logger.info(`PresenceSensorTimer Published presence true`);
    } catch (error) {
      this.logger.error(`PresenceSensorTimer Error publishing enter event: ${error.message}`, {
        stack: error.stack,
      });
    }
  }

  publishLeaveEvent() {
    try {
      const leavePayload = {
        reset_nopresence_status: "",
      };
      this.mqtt.publish(this.sensor, JSON.stringify(leavePayload));
      this.logger.info("PresenceSensorTimer Published presence false");
    } catch (error) {
      this.logger.error(`PresenceSensorTimer Error publishing leave event: ${error.message}`, {
        stack: error.stack,
      });
    }
  }

  stop() {
    this.eventBus.removeListeners(this);
    if (this.timer) {
      clearTimeout(this.timer);
      this.logger.debug("PresenceSensorTimer Timer cleared on stop.");
    }
    this.logger.info("PresenceSensorTimer stopped");
  }
}

module.exports = PresenceSensorTimer;
