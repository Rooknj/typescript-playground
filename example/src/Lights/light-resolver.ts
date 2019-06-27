import {
  Resolver,
  Query,
  Mutation,
  Subscription,
  Arg,
  ClassType,
  Root,
  PubSub,
  Publisher,
} from "type-graphql";
import { Service } from "typedi";
import { Light, LightState } from "./light-type";
import { LightStateInput, LightInput } from "./light-input";
import { LightService } from "./light-service";

const LIGHT_CHANGED = "LIGHT_CHANGED";
const LIGHT_STATE_CHANGED = "LIGHT_STATE_CHANGED";
const LIGHT_ADDED = "LIGHT_ADDED";
const LIGHT_REMOVED = "LIGHT_REMOVED";

@Service()
@Resolver((): ClassType<Light> => Light)
export class LightResolver {
  private lightService: LightService;

  // Dependency injection of the service
  public constructor(lightService: LightService) {
    this.lightService = lightService;
  }

  @Query((): ClassType<Light> => Light, { description: "Get a light by it's ID" })
  public light(@Arg("id") id: string): Promise<Light> {
    return this.lightService.findLightById(id);
  }

  @Query((): ClassType<Light> => Light, { description: "Get a light's state by it's id" })
  public lightState(@Arg("id") id: string): Promise<LightState> {
    return this.lightService.findLightStateById(id);
  }

  @Query((): ClassType<Light>[] => [Light], { description: "Get all currently added lights" })
  public lights(): Promise<Light[]> {
    return this.lightService.findAllLights();
  }

  @Mutation((): ClassType<Light> => Light, {
    description: "Change some of the light's data (use setLightState to change the state)",
  })
  public async setLight(
    @Arg("id") id: string,
    @Arg("lightData") lightData: LightInput,
    @PubSub(LIGHT_CHANGED) publish: Publisher<Light>
  ): Promise<Light> {
    // Set the light
    const updatedLight = await this.lightService.updateLight(id, lightData);

    // Notify subscriptions
    publish(updatedLight);

    return updatedLight;
  }

  @Mutation((): ClassType<LightState> => LightState, { description: "Change the light's state" })
  public async setLightState(
    @Arg("id") id: string,
    @Arg("lightStateData") lightStateData: LightStateInput,
    @PubSub(LIGHT_STATE_CHANGED) publish: Publisher<LightState>
  ): Promise<LightState> {
    // Set the light state
    const updatedLightState = await this.lightService.updateLightState(id, lightStateData);

    // Notify subscriptions
    publish(updatedLightState);

    return updatedLightState;
  }

  @Mutation((): ClassType<Light> => Light, { description: "Add a new light" })
  public async addLight(
    @Arg("id") id: string,
    @Arg("lightData") lightData: LightInput,
    @PubSub(LIGHT_ADDED) publish: Publisher<Light>
  ): Promise<Light> {
    // Add the light
    const addedLight = await this.lightService.addNewLight(id, lightData);

    // Notify subscriptions
    publish(addedLight);

    return addedLight;
  }

  @Mutation((): ClassType<Light> => Light, { description: "Remove a currently added light" })
  public async removeLight(
    @Arg("id") id: string,
    @PubSub(LIGHT_REMOVED) publish: Publisher<Light>
  ): Promise<Light> {
    // Remove the light
    const removedLight = await this.lightService.removeLightById(id);

    // Notify subscriptions
    publish(removedLight);

    return removedLight;
  }

  @Subscription({ topics: LIGHT_CHANGED })
  public lightChanged(@Root() updatedLight: Light): Light {
    return updatedLight;
  }

  @Subscription({ topics: LIGHT_STATE_CHANGED })
  public lightStateChanged(@Root() updatedLightState: LightState): LightState {
    return updatedLightState;
  }

  @Subscription({ topics: LIGHT_ADDED })
  public lightAdded(@Root() addedLight: Light): Light {
    return addedLight;
  }

  @Subscription({ topics: LIGHT_REMOVED })
  public lightRemoved(@Root() removedLight: Light): Light {
    return removedLight;
  }
}
