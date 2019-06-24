import { InputType, Field, ArgsType, ClassType } from "type-graphql";
import { Length, Min } from "class-validator";
import { Light } from "./light-type";

@InputType()
export class LightInput implements Partial<Light> {
  @Field({ nullable: true })
  @Length(1, 255)
  public name?: string;

  @Field({ nullable: true })
  @Min(0)
  public pos?: number;
}

@ArgsType()
export class AddLightArgs {
  @Field((): StringConstructor => String)
  @Length(1, 255)
  public id!: string;

  @Field((): ClassType<LightInput> => LightInput, { nullable: true })
  public lightData!: LightInput;
}

@ArgsType()
export class SetLightArgs {
  @Field((): StringConstructor => String)
  @Length(1, 255)
  public id!: string;

  @Field((): ClassType<LightInput> => LightInput)
  public lightData!: LightInput;
}
