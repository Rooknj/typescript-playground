import { Resolver, Query, Mutation, Arg, ClassType } from "type-graphql";
import { Service } from "typedi";
import { Light, LightState } from "./light-type";
import { LightStateInput, LightInput } from "./light-input";
import { LightService } from "./light-service";

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
  public setLight(@Arg("id") id: string, @Arg("lightData") lightData: LightInput): Promise<Light> {
    return this.lightService.updateLight(id, lightData);
  }

  @Mutation((): ClassType<LightState> => LightState, { description: "Change the light's state" })
  public setLightState(
    @Arg("id") id: string,
    @Arg("lightStateData") lightStateData: LightStateInput
  ): Promise<LightState> {
    return this.lightService.updateLightState(id, lightStateData);
  }

  @Mutation((): ClassType<Light> => Light, { description: "Add a new light" })
  public addLight(@Arg("id") id: string, @Arg("lightData") lightData: LightInput): Promise<Light> {
    return this.lightService.addNewLight(id, lightData);
  }

  @Mutation((): ClassType<Light> => Light, { description: "Remove a currently added light" })
  public removeLight(@Arg("id") id: string): Promise<Light> {
    return this.lightService.removeLightById(id);
  }
}
