import { plainToClass } from "class-transformer";
import { Service } from "typedi";
import { Connection, Repository } from "typeorm";
import { PubSub } from "apollo-server";
import { Light, LightState } from "./light-type";
import { LightInput, LightStateInput } from "./light-input";
import {
  LightMessenger,
  ConnectionPayload,
  MessageType,
  StatePayload,
  EffectListPayload,
  ConfigPayload,
} from "./light-messenger";
import { LIGHT_STATE_CHANGED, LIGHT_CHANGED } from "./light-events";
import { mapLightStateInputToPublishPayload } from "./light-utils";

// TODO: Add Discovery
@Service()
export class LightService {
  private readonly lightRepo: Repository<Light>;

  private readonly stateRepo: Repository<LightState>;

  private readonly messenger: LightMessenger;

  private readonly pubSub: PubSub;

  private readonly defaultStateData = {
    connected: false,
    on: false,
    color: "#FFFFFF",
    brightness: 100,
    effect: "None",
    speed: 4,
  };

  // The constructor parameters are Dependency Injected
  public constructor(connection: Connection, messenger: LightMessenger, pubSub: PubSub) {
    this.lightRepo = connection.getRepository(Light);
    this.stateRepo = connection.getRepository(LightState);
    this.messenger = messenger;
    this.pubSub = pubSub;
    if (this.messenger.connected) {
      this.handleMessengerConnect();
    }
    this.messenger.on("connect", this.handleMessengerConnect);
    this.messenger.on("disconnect", this.handleMessengerDisconnect);
    this.messenger.on(MessageType.Connected, this.handleConnectionMessage);
    this.messenger.on(MessageType.State, this.handleStateMessage);
    this.messenger.on(MessageType.EffectList, this.handleEffectListMessage);
    this.messenger.on(MessageType.Config, this.handleConfigMessage);
    this.messenger.on(MessageType.DiscoveryResponse, this.handleDiscoveryResponseMessage);
  }

  private handleMessengerConnect = async (): Promise<void> => {
    console.log("Messenger Connected");

    const lights = await this.lightRepo.find();

    // Subscribe to all the lights
    lights.forEach(({ id }): Promise<void> => this.messenger.subscribeToLight(id));

    // TODO: Subscribe to discovery topics
    // // Subscribe to discovery topic
    // subscriptionPromises.push(this.messenger.startDiscovery());
    // TODO: Actually handle an error if one occurs (or just keep on crashing)
  };

  private handleMessengerDisconnect = async (): Promise<void> => {
    console.log("Messenger Disconnected");

    const lights = await this.lightRepo.find();

    const defaultStateInput = plainToClass(LightStateInput, this.defaultStateData);

    // Set all light's connected status to false, then return the new state
    lights.forEach(({ id }): Promise<LightState> => this.updateLightState(id, defaultStateInput));

    // TODO: Actually handle an error if one occurs (or just keep on crashing)
  };

  private handleConnectionMessage = async (data: ConnectionPayload): Promise<void> => {
    console.log("connection Message", data);
    // TODO: Update the DB
  };

  private handleStateMessage = async (data: StatePayload): Promise<void> => {
    console.log("state Message", data);
    // TODO: Update the DB
  };

  private handleEffectListMessage = async (data: EffectListPayload): Promise<void> => {
    console.log("EffectList Message", data);
    // TODO: Update the DB
  };

  private handleConfigMessage = async (data: ConfigPayload): Promise<void> => {
    console.log("config Message", data);
    // TODO: Update the DB
  };

  private handleDiscoveryResponseMessage = async (data: ConfigPayload): Promise<void> => {
    console.log("Discovery Response Message", data);
    // TODO: Update the DB
  };

  public findLightById = (id: string): Promise<Light> => {
    console.log(`Finding Light: ${id}`);
    // This gets both the light and it's state because of the relations option
    return this.lightRepo.findOneOrFail(id, { relations: ["state"] });
  };

  public findLightStateById = (id: string): Promise<LightState> => {
    console.log(`Finding Light State: ${id}`);
    return this.stateRepo.findOneOrFail(id);
  };

  public findAllLights = (): Promise<Light[]> => {
    console.log(`Finding All Lights`);
    // This gets both the lights and their state because of the relations option
    return this.lightRepo.find({ relations: ["state"] });
  };

  public updateLight = async (id: string, lightData: LightInput): Promise<Light> => {
    console.log(`Updating Light: ${id}`);

    const lightToUpdate = await this.lightRepo.findOneOrFail(id, { relations: ["state"] });

    // Assign the new properties to the light
    Object.assign(lightToUpdate, lightData);

    await this.lightRepo.save(lightToUpdate);

    // Notify subscribers of the new light data
    this.pubSub.publish(LIGHT_CHANGED, lightToUpdate);

    return lightToUpdate;
  };

  // This physically sends a command message to the light controller and returns with the updated state
  public commandLightToChangeState = async (
    id: string,
    lightStateData: LightStateInput
  ): Promise<LightState> => {
    // Check if the light exists
    const lightToCommand = await this.stateRepo.findOneOrFail(id);

    // Check if the light is connected
    if (!lightToCommand.connected) throw new Error(`"${id}" is not connected`);

    const publishPayload = mapLightStateInputToPublishPayload(id, lightStateData);
    console.log(publishPayload);

    // TODO: Implement this properly so it only returns once a response from the light was received or times out after 5 seconds
    await this.messenger.publishToLight(id, publishPayload);

    return this.updateLightState(id, lightStateData);
  };

  // This updates the light state in persistent storage and notifies subscriptions.
  // Should not be called directly by outside classes. Instead they should call commandLightToChangeState
  private updateLightState = async (
    id: string,
    lightStateData: LightStateInput
  ): Promise<LightState> => {
    console.log(`Updating Light State: ${id}`);
    const lightStateToUpdate = await this.stateRepo.findOneOrFail(id);

    // Assign the new properties to the light's state
    Object.assign(lightStateToUpdate, lightStateData);

    await this.stateRepo.save(lightStateToUpdate);

    // Notify subscribers of the new light state
    this.pubSub.publish(LIGHT_STATE_CHANGED, lightStateToUpdate);

    return lightStateToUpdate;
  };

  public addNewLight = async (id: string, lightData?: LightInput): Promise<Light> => {
    console.log(`Adding Light: ${id}`);
    // Check if the light was already added
    let lightAlreadyExists = true;
    try {
      await this.lightRepo.findOneOrFail(id);
    } catch (error) {
      lightAlreadyExists = false;
    }

    // Don't add the light again if it already exists
    if (lightAlreadyExists) {
      throw new Error(`${id} was already added`);
    }

    // Create the default state for the light
    const defaultState = plainToClass(LightState, {
      id,
      ...this.defaultStateData,
    });

    // Create the new light object
    const light = plainToClass(Light, {
      id,
      ...lightData,
    });
    light.state = defaultState;

    // This adds both the light and it's state because of the "cascade" option set in light-type.ts for the one to one relation
    await this.lightRepo.save(light);

    // Subscribe to the light
    try {
      await this.messenger.subscribeToLight(id);
    } catch (error) {
      // Do nothing because we will just resubscribe when the messenger connects due to this.handleMessengerConnect
      console.error(`Error subscribing to ${id}`, error);
      // TODO: Do nothing if the error was due to the messenger not being connected, throw otherwise
    }

    return light;
  };

  public removeLightById = async (id: string): Promise<Light> => {
    console.log(`Removing Light: ${id}`);

    // Unsubscribe from the light
    try {
      await this.messenger.unsubscribeFromLight(id);
    } catch (error) {
      // Do nothing because we are already unsubscribed if the messenger isn't connected
      console.error(`Error unsubscribing from ${id}`, error);
      // TODO: Do nothing if the error was due to the messenger not being connected, throw otherwise
    }

    const [lightToRemove, lightStateToRemove] = await Promise.all([
      this.lightRepo.findOneOrFail(id, { relations: ["state"] }),
      this.stateRepo.findOneOrFail(id),
    ]);

    // For some reason repo.remove deletes the ID of lightToRemove, so we are saving a deep copy to return
    const removedLight = Object.assign({}, lightToRemove);

    // Remove the light and it's state from the DB. You must remove both or there will be a memory leak
    // You must remove the light first then the state second or you will get a "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed" error
    await this.lightRepo.remove(lightToRemove);
    await this.stateRepo.remove(lightStateToRemove);

    return removedLight;
  };
}
