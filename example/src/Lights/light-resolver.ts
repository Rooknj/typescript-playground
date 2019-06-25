import { Resolver, Query, Mutation, Arg, Args, ClassType } from "type-graphql";
import { Service } from "typedi";
import { Light } from "./light-type";
import { AddLightArgs, SetLightArgs } from "./light-input";
import { LightService } from "./light-service";

@Service()
@Resolver((): ClassType<Light> => Light)
export class LightResolver {
  private lightService: LightService;

  // Dependency injection of the service
  public constructor(lightService: LightService) {
    this.lightService = lightService;
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
  public setLight(@Args() { id, lightData }: SetLightArgs): Promise<Light> {
    return this.lightService.update(id, lightData);
  }

  @Mutation((): ClassType<Light> => Light)
  public addLight(@Args() { id, lightData }: AddLightArgs): Promise<Light> {
    return this.lightService.addNew(id, lightData);
  }

  @Mutation((): ClassType<Light> => Light)
  public removeLight(@Arg("id") id: string): Promise<Light> {
    return this.lightService.removeById(id);
  }
}
