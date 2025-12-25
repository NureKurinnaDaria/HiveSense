import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as mqtt from 'mqtt';
import { Repository } from 'typeorm';

import { Sensor } from '../sensors/entities/sensor.entity';
import { Measurement } from '../measurements/entities/measurement.entity';
import { Threshold } from '../thresholds/entities/threshold.entity';
import { Alert } from '../alerts/entities/alert.entity';

type TelemetryPayload = {
  temperature: number;
  humidity: number;
};

@Injectable()
export class MqttService implements OnModuleInit {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient;

  constructor(
    @InjectRepository(Sensor)
    private readonly sensorRepo: Repository<Sensor>,

    @InjectRepository(Measurement)
    private readonly measurementRepo: Repository<Measurement>,

    @InjectRepository(Threshold)
    private readonly thresholdRepo: Repository<Threshold>,

    @InjectRepository(Alert)
    private readonly alertRepo: Repository<Alert>,
  ) {}

  onModuleInit() {
    const host = process.env.MQTT_HOST;
    const port = Number(process.env.MQTT_PORT);
    const username = process.env.MQTT_USERNAME;
    const password = process.env.MQTT_PASSWORD;

    if (!host || !port || !username || !password) {
      this.logger.error(
        `MQTT env vars missing. MQTT_HOST=${host}, MQTT_PORT=${process.env.MQTT_PORT}, MQTT_USERNAME=${username}, MQTT_PASSWORD=${password ? '***' : ''}`,
      );
      return;
    }

    this.client = mqtt.connect({
      host,
      port,
      protocol: 'mqtts',
      username,
      password,
      rejectUnauthorized: false, // EMQX Cloud
    });

    this.client.on('connect', () => {
      this.logger.log('MQTT CONNECTED');

      // topic: hivesense/sensors/sensor-1/telemetry
      const topic = 'hivesense/sensors/+/telemetry';
      this.client.subscribe(topic, (err) => {
        if (err) {
          this.logger.error(`MQTT SUBSCRIBE ERROR to ${topic}`, err);
        } else {
          this.logger.log(`MQTT SUBSCRIBED to ${topic}`);
        }
      });
    });

    this.client.on('reconnect', () => this.logger.warn('MQTT RECONNECTING...'));
    this.client.on('close', () => this.logger.warn('MQTT CONNECTION CLOSED'));
    this.client.on('error', (err) =>
      this.logger.error('MQTT ERROR', err as any),
    );

    this.client.on('message', async (topic, payload) => {
      await this.handleMessage(topic.toString(), payload.toString());
    });
  }

  private async handleMessage(topic: string, payload: string) {
    // topic: hivesense/sensors/{serial}/telemetry
    const parts = topic.split('/');
    const serial = parts?.[2]; // sensor-1

    this.logger.log(`MQTT MESSAGE topic=${topic} payload=${payload}`);

    if (!serial) {
      this.logger.warn(`Invalid topic format: ${topic}`);
      return;
    }

    let data: TelemetryPayload;
    try {
      const parsed = JSON.parse(payload);
      data = {
        temperature: Number(parsed.temperature),
        humidity: Number(parsed.humidity),
      };
      if (Number.isNaN(data.temperature) || Number.isNaN(data.humidity)) {
        throw new Error('temperature/humidity is not a number');
      }
    } catch (e) {
      this.logger.error(`MQTT PARSE ERROR for topic=${topic}`, e as any);
      return;
    }

    // 1) знайти sensor по serial_number
    const sensor = await this.sensorRepo.findOne({
      where: { serial_number: serial },
    });

    if (!sensor) {
      this.logger.warn(
        `Sensor not found for serial_number=${serial}. Create it in DB first.`,
      );
      return;
    }

    // 2) записати measurement
    await this.measurementRepo.save(
      this.measurementRepo.create({
        sensor_id: sensor.sensor_id,
        temperature_c: data.temperature,
        humidity_percent: data.humidity,
        // measured_at default
      }),
    );

    this.logger.log(
      `MEASUREMENT SAVED sensor_id=${sensor.sensor_id} t=${data.temperature} h=${data.humidity}`,
    );

    // 3) взяти thresholds для складу (warehouse_id)
    const threshold = await this.thresholdRepo.findOne({
      where: { warehouse_id: sensor.warehouse_id },
    });

    if (!threshold) {
      this.logger.warn(
        `Thresholds not found for warehouse_id=${sensor.warehouse_id}. Create thresholds for this warehouse.`,
      );
      return;
    }

    // 4) перевірка порогів + створити/закрити тривоги
    await this.processAlerts(
      sensor,
      threshold,
      data.temperature,
      data.humidity,
    );
  }

  private async processAlerts(
    sensor: Sensor,
    threshold: Threshold,
    temperature: number,
    humidity: number,
  ) {
    const checks: Array<{
      type: string;
      isBad: boolean;
    }> = [
      { type: 'TEMP_LOW', isBad: temperature < threshold.temp_min },
      { type: 'TEMP_HIGH', isBad: temperature > threshold.temp_max },
      { type: 'HUMIDITY_LOW', isBad: humidity < threshold.humidity_min },
      { type: 'HUMIDITY_HIGH', isBad: humidity > threshold.humidity_max },
    ];

    for (const c of checks) {
      const existing = await this.alertRepo.findOne({
        where: {
          type: c.type,
          status: 'NEW',
          warehouse_id: sensor.warehouse_id,
          sensor_id: sensor.sensor_id,
        },
      });

      if (c.isBad) {
        if (!existing) {
          await this.alertRepo.save(
            this.alertRepo.create({
              type: c.type,
              status: 'NEW',
              created_at: new Date(),
              resolved_at: null,
              warehouse_id: sensor.warehouse_id,
              sensor_id: sensor.sensor_id,
              user_id: null,
            }),
          );
          this.logger.warn(
            `ALERT CREATED type=${c.type} warehouse_id=${sensor.warehouse_id} sensor_id=${sensor.sensor_id}`,
          );
        } else {
          this.logger.log(`ALERT ALREADY EXISTS type=${c.type} (NEW)`);
        }
      } else {
        // стало нормально — закриваємо існуючу NEW тривогу
        if (existing) {
          existing.status = 'RESOLVED';
          existing.resolved_at = new Date();
          await this.alertRepo.save(existing);

          this.logger.log(
            `ALERT RESOLVED type=${c.type} warehouse_id=${sensor.warehouse_id} sensor_id=${sensor.sensor_id}`,
          );
        }
      }
    }
  }
}
