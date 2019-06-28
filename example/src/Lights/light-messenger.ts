import { Service, Inject } from "typedi";
import { AsyncMqttClient } from "async-mqtt";
import { EventEmitter } from "events";
import {
  validate,
  IsInt,
  IsString,
  Length,
  IsEnum,
  Min,
  Max,
  IsOptional,
  IsIn,
  IsArray,
  IsIP,
  Matches,
} from "class-validator";
import { plainToClass } from "class-transformer";

export enum MessageType {
  Connected = "connectedMessage",
  State = "stateMessage",
  EffectList = "effectListMessage",
  Config = "configMessage",
  DiscoveryResponse = "discoveryResponseMessage",
}

export enum PowerState {
  on = "ON",
  off = "OFF",
}

export class RGB {
  @IsInt()
  @Min(0)
  @Max(255)
  public r!: number;

  @IsInt()
  @Min(0)
  @Max(255)
  public g!: number;

  @IsInt()
  @Min(0)
  @Max(255)
  public b!: number;
}

export class PublishPayload {
  @IsInt()
  public mutationId!: number;

  @IsString()
  @Length(1, 255)
  public name!: string;

  @IsEnum(PowerState)
  @IsOptional()
  public state?: PowerState;

  @IsOptional()
  public color?: RGB;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  public brightness?: number;

  @IsString()
  @IsOptional()
  public effect?: string;

  @IsInt()
  @Min(1)
  @Max(7)
  @IsOptional()
  public speed?: number;
}

export class ConnectionPayload {
  @IsString()
  @Length(1, 255)
  public name!: string;

  @IsIn(["0", "2"])
  public connection!: "0" | "2";
}

export class StatePayload {
  @IsInt()
  @IsOptional()
  public mutationId?: number;

  @IsString()
  @Length(1, 255)
  public name!: string;

  @IsEnum(PowerState)
  @IsOptional()
  public state!: PowerState;

  @IsOptional()
  public color!: RGB;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  public brightness!: number;

  @IsString()
  @IsOptional()
  public effect!: string;

  @IsInt()
  @Min(1)
  @Max(7)
  @IsOptional()
  public speed!: number;
}

export class EffectListPayload {
  @IsString()
  @Length(1, 255)
  public name!: string;

  @IsArray()
  public effectList!: string[];
}

export class ConfigPayload {
  @IsString()
  @Length(1, 255)
  public id!: string;

  @IsString()
  @Length(1, 255)
  public name!: string;

  @IsString()
  public version!: string;

  @IsString()
  public hardware!: string;

  @IsString()
  public colorOrder!: string;

  @IsString()
  public stripType!: string;

  @IsIP("4")
  public ipAddress!: string;

  @Matches(/^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/)
  public macAddress!: string;

  @IsInt()
  public numLeds!: number;

  @IsInt()
  public udpPort!: number;
}

@Service()
export class LightMessenger extends EventEmitter {
  private readonly client: AsyncMqttClient;

  public connected: boolean;

  private readonly topics = {
    top: "prysmalight",
    connected: "connected",
    state: "state",
    command: "command",
    effectList: "effects",
    config: "config",
    discovery: "discovery",
    discoveryResponse: "hello",
  };

  public constructor(@Inject("MQTT_CLIENT") client: AsyncMqttClient) {
    super();
    this.client = client;
    this.connected = this.client.connected;
    this.client.on("connect", this.handleClientConnect);
    this.client.on("offline", this.handleClientDisconnect);
    this.client.on("message", this.handleMessage);
  }

  private handleClientConnect = (): void => {
    this.connected = true;
    console.log("Connected to MQTT Broker");
    this.emit("connect");
  };

  private handleClientDisconnect = (): void => {
    this.connected = false;
    console.log("Disconnected to MQTT Broker");
    this.emit("disconnect");
  };

  private handleMessage = async (topic: string, message: Buffer): Promise<void> => {
    const { top, connected, state, effectList, config, discoveryResponse } = this.topics;
    const topicTokens = topic.split("/");

    // Validate the topic the message came in on
    if (topicTokens.length < 2) {
      console.log(`Ignoring Message on ${topic}: topic too short`);
      return;
    }
    if (topicTokens[0] !== top) {
      console.log(`Ignoring Message on ${topic}: topic is unrelated to this app`);
      return;
    }

    let data: object;
    try {
      data = JSON.parse(message.toString());
    } catch (error) {
      console.error(error);
      return;
    }

    // Each message topic is assigned an event and a function which will convert the data into an instance of the correct Payload class
    const possibleTopicsMap = {
      [connected]: {
        event: MessageType.Connected,
        toClass: (obj: object): ConnectionPayload => {
          return plainToClass(ConnectionPayload, obj);
        },
      },
      [state]: {
        event: MessageType.State,
        toClass: (obj: object): StatePayload => plainToClass(StatePayload, obj),
      },
      [effectList]: {
        event: MessageType.EffectList,
        toClass: (obj: object): EffectListPayload => plainToClass(EffectListPayload, obj),
      },
      [config]: {
        event: MessageType.Config,
        toClass: (obj: object): ConfigPayload => plainToClass(ConfigPayload, obj),
      },
      [discoveryResponse]: {
        event: MessageType.DiscoveryResponse,
        toClass: (obj: object): ConfigPayload => plainToClass(ConfigPayload, obj),
      },
    };

    const messageTopic = topicTokens[2];

    // Get the message event to emit from the map
    const { event, toClass } = possibleTopicsMap[messageTopic];

    // Convert the incoming data into an instance of a Payload class
    const payload = toClass(data);

    // Validate the incoming message
    const errors = await validate(payload);

    if (errors.length > 0) {
      console.error(`Invalid message on ${topic}: Ignoring\n`, errors);
      return;
    }

    if (!event || !payload) {
      console.error("The event or payload was not defined");
    }

    this.emit(event, payload);
  };

  public subscribeToLight = async (id: string): Promise<void> => {
    if (!this.connected) {
      const errorMessage = `Can not subscribe to (${id}). MQTT client not connected`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (!id) {
      const errorMessage = "You must provide a light id";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { top, connected, state, effectList, config } = this.topics;

    // Subscribe to all relevant fields
    const connectedPromise = this.client.subscribe(`${top}/${id}/${connected}`);
    const statePromise = this.client.subscribe(`${top}/${id}/${state}`);
    const effectListPromise = this.client.subscribe(`${top}/${id}/${effectList}`);
    const configPromise = this.client.subscribe(`${top}/${id}/${config}`);

    await Promise.all([connectedPromise, statePromise, effectListPromise, configPromise]);

    console.info(`Successfully subscribed to ${id}`);
  };

  public unsubscribeFromLight = async (id: string): Promise<void> => {
    if (!this.connected) {
      console.info(`Already unsubscribed from ${id} due to disconnect`);
      return;
    }

    if (!id) {
      const errorMessage = "You must provide a light id";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { top, connected, state, effectList, config } = this.topics;

    // Subscribe to all relevant fields
    const connectedPromise = this.client.unsubscribe(`${top}/${id}/${connected}`);
    const statePromise = this.client.unsubscribe(`${top}/${id}/${state}`);
    const effectListPromise = this.client.unsubscribe(`${top}/${id}/${effectList}`);
    const configPromise = this.client.unsubscribe(`${top}/${id}/${config}`);

    await Promise.all([connectedPromise, statePromise, effectListPromise, configPromise]);

    console.info(`Successfully unsubscribed from ${id}`);
  };

  public async publishToLight(id: string, message: PublishPayload): Promise<void> {
    if (!this.connected) {
      const errorMessage = `Can not publish to (${id}). MQTT client not connected`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (!id) {
      const errorMessage = "You must provide a light id";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    if (!message) {
      const errorMessage = "You must provide a message";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const errors = await validate(message);
    if (errors.length > 0) {
      throw errors;
    }

    const { top, command } = this.topics;
    const payload = Buffer.from(JSON.stringify(message));
    await this.client.publish(`${top}/${id}/${command}`, payload);

    console.info(`Successfully published ${payload.toString()} to ${id}`);
  }
}
