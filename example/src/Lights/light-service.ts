import { plainToClass } from "class-transformer";
import { Light } from "./light-type";
import { LightInput } from "./light-input";
import { createLightSamples } from "./light-samples";

export class LightService {
  private readonly items = createLightSamples();

  public findById = async (id: string): Promise<Light> => {
    const light = await this.items.find((item): boolean => item.id === id);

    if (light === undefined) {
      throw new Error(id);
      // throw new LightNotFoundError(id);
    }

    return light;
  };

  public findAll = async (): Promise<Light[]> => {
    return this.items;
  };

  public update = async (id: string, lightData: LightInput): Promise<Light> => {
    const lightToUpdate = this.items.find((item): boolean => item.id === id);

    if (!lightToUpdate) {
      throw new Error("Light doesn't exist");
    }

    const updatedLight = plainToClass(Light, {
      id,
      ...lightToUpdate,
      ...lightData,
    });

    const index = this.items.indexOf(lightToUpdate);

    this.items[index] = updatedLight;

    return updatedLight;
  };

  public addNew = async (id: string, lightData?: LightInput): Promise<Light> => {
    const light = plainToClass(Light, {
      id,
      ...lightData,
    });
    await this.items.push(light);
    return light;
  };

  public removeById = async (id: string): Promise<boolean> => {
    let removed = false;
    for (let i = 0; i < this.items.length; i += 1) {
      if (this.items[i].id === id) {
        this.items.splice(i, 1);
        removed = true;
      }
    }
    return removed;
  };
}
