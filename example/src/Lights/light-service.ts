import { plainToClass } from "class-transformer";
import { Service } from "typedi";
import { Connection, Repository } from "typeorm";
import { Light } from "./light-type";
import { LightInput } from "./light-input";

@Service()
export class LightService {
  private readonly repo: Repository<Light>;

  // Dependency injection of the connection
  public constructor(connection: Connection) {
    this.repo = connection.getRepository(Light);
  }

  public findById = (id: string): Promise<Light> => {
    return this.repo.findOneOrFail(id);
  };

  public findAll = (): Promise<Light[]> => {
    return this.repo.find();
  };

  public update = async (id: string, lightData: LightInput): Promise<Light> => {
    const lightToUpdate = await this.repo.findOneOrFail(id);

    // Assign the new properties to the light
    Object.assign(lightToUpdate, lightData);

    await this.repo.save(lightToUpdate);
    return lightToUpdate;
  };

  public addNew = async (id: string, lightData?: LightInput): Promise<Light> => {
    // Check if the light was already added
    let lightAlreadyExists = true;
    try {
      await this.repo.findOneOrFail(id);
    } catch (error) {
      lightAlreadyExists = false;
    }

    // Don't add the light again if it already exists
    if (lightAlreadyExists) {
      throw new Error(`${id} was already added`);
    }

    // Create the new light object
    const light = plainToClass(Light, {
      id,
      ...lightData,
    });

    await this.repo.save(light);

    return light;
  };

  public removeById = async (id: string): Promise<Light> => {
    const lightToRemove = await this.repo.findOneOrFail(id);

    // For some reason repo.remove deletes the ID of lightToRemove, so we are saving a deep copy to return
    const removedLight = Object.assign({}, lightToRemove);

    await this.repo.remove(lightToRemove);

    return removedLight;
  };
}
