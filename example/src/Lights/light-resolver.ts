import { Resolver, Query, Mutation, Arg, Args, ClassType } from "type-graphql";
import { Light } from "./light-type";
import { AddLightArgs } from "./light-input";
import LightService from "./LightService";

@Resolver((): ClassType<Light> => Light)
export class LightResolver {
  private lightService: LightService;

  // public constructor(lightService: LightService) {
  //   this.lightService = lightService;
  // }
  public constructor() {
    this.lightService = new LightService();
  }

  @Query((): ClassType<Light> => Light)
  public light(@Arg("id") id: string): Promise<Light> {
    return this.lightService.findById(id);
  }

  @Query((): ClassType<Light>[] => [Light])
  public lights(): Promise<Light[]> {
    return this.lightService.findAll();
  }

  @Mutation((): ClassType<Light> => Light)
  public addLight(@Args() { id, lightData }: AddLightArgs): Promise<Light> {
    return this.lightService.addNew(id, lightData);
  }

  @Mutation((): BooleanConstructor => Boolean)
  public removeLight(@Arg("id") id: string): Promise<boolean> {
    return this.lightService.removeById(id);
  }
}
