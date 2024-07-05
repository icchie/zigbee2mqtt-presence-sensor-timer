# zigbee2mqtt-presence-sensor-timer

This is an extension for [Zigbee2MQTT](https://www.zigbee2mqtt.io/) that publishes the presence status of an Aqara FP1 sensor based on its presence_event.

## Description

The zigbee2mqtt-presence-sensor-timer is designed to enhance the functionality of the Aqara FP1 presence sensor when used with Zigbee2MQTT. It addresses specific limitations of the FP1 sensor and provides a more reliable presence detection mechanism.

### Background on Aqara FP1 Sensor

The Aqara FP1 sensor has two types of presence detection events:

1. `presence`: A boolean value indicating whether presence is detected. This event updates relatively slowly, with intervals of around 10 seconds between updates.

2. `presence_event`: This provides more detailed presence information with four possible states:

   - "away"
   - "approach"
   - "enter"
   - "leave"

   The `presence_event` updates more frequently than the `presence` boolean.

A known issue with the FP1 sensor is that the `presence` boolean sometimes fails to return to `false` after detecting presence, leading to false positive presence detections.

### Purpose and Functionality of this Extension

This extension was created to solve the limitations of the FP1 sensor and provide a more responsive and reliable presence detection system. Here's how it works:

1. Event Triggering:

   - The extension listens for specific `presence_event` values from the FP1 sensor: "enter", "away", and "approach".
   - When any of these events are received, the extension immediately triggers a `presence: true` event, which is faster than waiting for the FP1's native `presence` update.

2. Timer Mechanism:

   - Upon receiving a triggering event, the extension starts a configurable timer.
   - This timer is reset and extended each time a new triggering event is received.
   - If the timer expires without being reset, it indicates that no presence has been detected for the specified duration.

3. Presence Reset:
   - When the timer expires, the extension publishes a `reset_nopresence_status: ""` event.
   - This event resets the internal state of the FP1 sensor to indicate no presence.
   - Subsequently, the FP1 sensor will publish a `presence: false` event.

Key features:

- Utilizes the more responsive `presence_event` data instead of relying solely on the `presence` boolean.
- Provides faster `presence: true` updates for more responsive automation.
- Implements a configurable timer to determine when to consider a space vacated after the last detected presence.
- Automatically resets the FP1 sensor state to avoid stuck 'presence' values.
- Publishes an updated presence status that is more suitable for integration with home automation systems.

By using this extension, users can achieve more accurate and responsive presence detection in their smart home setups, leading to more reliable automations and energy savings.

## Features

- Converts Aqara FP1 presence events into a simple, reliable presence status
- Provides faster presence detection than native FP1 updates
- Configurable timer for presence timeout
- Mitigates the issue of stuck 'presence' values
- Easy integration with Zigbee2MQTT

## Installation

There are two methods to install the zigbee2mqtt-presence-sensor-timer:

### Method 1: Manual File Placement

1. Locate the Zigbee2MQTT extension directory:
   ```
   data/extension/
   ```
2. Download the JavaScript file for this extension.
3. Place the downloaded .js file in the extension directory.

### Method 2: Using Zigbee2MQTT Web Interface

1. Open the Zigbee2MQTT web interface.
2. Navigate to the "Extensions" section.
3. Click on "Add extension" or a similar option.
4. In the new extension form:
   - Enter `presence-sensor-timer-extension.js` as the filename.
   - Copy the entire content of the `presence-sensor-timer-extension.js` file.
   - Paste the content into the code editor in the web interface.
5. Save the new extension.

This method allows you to add the extension directly through the Zigbee2MQTT management interface without needing to access the file system directly.

## Configuration

To configure the zigbee2mqtt-presence-sensor-timer for multiple sensors, you need to add the following settings to your Zigbee2MQTT `configuration.yaml` file:

```yaml
presence_sensor_timer_extension:
  sensors:
    - sensor: aqara_sensor_1
      timer_duration: 45
    - sensor: aqara_sensor_2
      timer_duration: 60
    - sensor: aqara_sensor_3
      timer_duration: 30
```

### Configuration Options

- `sensors`: A list of sensor configurations. Each sensor configuration consists of:
  - `sensor`: The Friendly Name of your Aqara FP1 sensor as configured in Zigbee2MQTT. This is used to identify which sensor the extension should monitor.
  - `timer_duration`: The duration (in seconds) for the presence timer. This determines how long the presence status will remain "present" after the last detected movement.

You can add as many sensors as you need, each with its own timer duration. Make sure to adjust these values according to your specific setup and requirements. The Friendly Name for each `sensor` should match exactly how it appears in your Zigbee2MQTT configuration.

## Usage

Using the zigbee2mqtt-presence-sensor-timer is straightforward:

1. Install the extension using one of the methods described in the Installation section.
2. Configure the extension in your `configuration.yaml` file as explained in the Configuration section.
3. Restart Zigbee2MQTT to apply the changes.

Once these steps are completed, the extension will automatically start working. It will interpret the presence events from your Aqara FP1 sensor and publish updated presence statuses based on the configured timer duration.

No additional setup or interaction is required. The extension will continue to operate as long as Zigbee2MQTT is running and the configuration remains in place.

## Contributing

Contributions to improve zigbee2mqtt-presence-sensor-timer are welcome and appreciated. To contribute:

1. Fork the repository to your own GitHub account.
2. Clone the project to your machine.
3. Create a branch locally with a succinct but descriptive name.
4. Commit changes to the branch.
5. Push changes to your fork.
6. Open a Pull Request in our repository.

By forking the project, you can freely experiment with changes without affecting the original project. We encourage you to submit your improvements via Pull Requests from your fork. This approach helps us maintain code quality and allows for discussion about proposed changes.

## License

This project is licensed under the ISC License.

The ISC License is a permissive free software license published by the Internet Software Consortium. It is functionally equivalent to the simplified BSD and MIT licenses, but with a simpler language.

For more details, please see the [ISC License](https://opensource.org/licenses/ISC) page.

## Acknowledgments

This project was inspired by and built upon the knowledge shared in the following resources:

- "Aqara FP1 Tips, Tricks and Automations Examples" by SmartHomeScene
  https://smarthomescene.com/blog/aqara-fp1-tips-tricks-and-automations-examples/

- "Aqara RTCZCGQ11LM control via MQTT | Zigbee2MQTT"
  https://www.zigbee2mqtt.io/devices/RTCZCGQ11LM.html

We are grateful for the insights and information provided in these articles, which helped shape the development of this extension. The official Zigbee2MQTT device page for the Aqara FP1 sensor provides valuable information about the device's capabilities and MQTT interface.

## Disclaimer

This project is not officially associated with Zigbee2MQTT or Aqara. Use at your own risk.
