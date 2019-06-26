import { InputType, Field, ArgsType, ClassType, Int } from "type-graphql";
import { GraphQLScalarType } from "graphql";
import { Length, Min } from "class-validator";
import { Light, LightState } from "./light-type";

@InputType()
export class LightStateInput implements Partial<LightState> {
  @Field({ nullable: true, description: "Power the light on or off" })
  public on?: boolean;

  @Field((): GraphQLScalarType => Int, {
    nullable: true,
    description: "Change the brightness of the light (a value 0-100)",
  })
  public brightness?: number;

  @Field({
    nullable: true,
    description: "Change the color of the light (must be in hexadecimal format)",
  })
  public color?: string;

  @Field({ nullable: true, description: "Change the currently playing effect of the light" })
  public effect?: string;

  @Field((): GraphQLScalarType => Int, {
    nullable: true,
    description: "Change the speed of the light (a value 1-7)",
  })
  public speed?: number;
}

@ArgsType()
export class SetLightStateArgs {
  @Field((): StringConstructor => String)
  @Length(1, 255)
  public id!: string;

  @Field((): ClassType<LightStateInput> => LightStateInput)
  public lightStateData!: LightStateInput;
}

@InputType()
export class LightInput implements Partial<Light> {
  @Field({ nullable: true, description: "Set the display name of the light" })
  @Length(1, 255)
  public name?: string;

  @Field({
    nullable: true,
    description: "Set the position of the light (can not be the same as another light's position)",
  })
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
