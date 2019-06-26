import { plainToClass } from "class-transformer";
import { Service } from "typedi";
import { Connection, Repository } from "typeorm";
import { Light, LightState } from "./light-type";
import { LightInput, LightStateInput } from "./light-input";

@Service()
export class LightService {
  private readonly lightRepo: Repository<Light>;

  private readonly stateRepo: Repository<LightState>;

  // Dependency injection of the connection
  public constructor(connection: Connection) {
    this.lightRepo = connection.getRepository(Light);
    this.stateRepo = connection.getRepository(LightState);
  }

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
    const lightToUpdate = await this.lightRepo.findOneOrFail(id);

    // Assign the new properties to the light
    Object.assign(lightToUpdate, lightData);

    await this.lightRepo.save(lightToUpdate);
    return lightToUpdate;
  };

  public updateLightState = async (
    id: string,
    lightStateData: LightStateInput
  ): Promise<LightState> => {
    console.log(`Updating Light State: ${id}`);
    const lightStateToUpdate = await this.stateRepo.findOneOrFail(id);

    // Assign the new properties to the light's state
    Object.assign(lightStateToUpdate, lightStateData);

    await this.stateRepo.save(lightStateToUpdate);
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
      connected: false,
      on: false,
      color: "#FFFFFF",
      brightness: 100,
      effect: "None",
      speed: 4,
    });

    // Create the new light object
    const light = plainToClass(Light, {
      id,
      ...lightData,
    });
    light.state = defaultState;

    // This adds both the light and it's state because of the "cascade" option set in light-type.ts for the one to one relation
    await this.lightRepo.save(light);

    return light;
  };

  public removeLightById = async (id: string): Promise<Light> => {
    console.log(`Removing Light: ${id}`);
    const [lightToRemove, lightStateToRemove] = await Promise.all([
      this.lightRepo.findOneOrFail(id),
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
