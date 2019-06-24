import { plainToClass } from "class-transformer";
import { ClassType } from "type-graphql";
import { Light } from "./light-type";

import { LightInput } from "./light-input";
import { createLightSamples } from "./light-samples";

class LightService {
  private readonly items: Light[] = createLightSamples();

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

  public addNew = async (id: string, lightData: ClassType<LightInput>): Promise<Light> => {
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

export default LightService;
