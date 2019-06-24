import { ObjectType, Field, ID, Int } from "type-graphql";
import { GraphQLScalarType } from "graphql";

@ObjectType({ description: "Object representing a Light" })
export class Light {
  @Field((): GraphQLScalarType => ID)
  public id!: string;

  @Field({ nullable: true, description: "The display name of the Light" })
  public name!: string;

  @Field({ nullable: true })
  public pos!: number;

  @Field((): StringConstructor[] => [String], { nullable: true })
  public supportedEffects!: [string];

  @Field({ nullable: true })
  public ipAddress!: string;

  @Field({ nullable: true })
  public macAddress!: string;

  @Field((): GraphQLScalarType => Int, { nullable: true })
  public numLeds!: number;

  @Field((): GraphQLScalarType => Int, { nullable: true })
  public udpPort!: number;

  @Field({ nullable: true })
  public version!: string;

  @Field({ nullable: true })
  public hardware!: string;

  @Field({ nullable: true })
  public colorOrder!: string;

  @Field({ nullable: true })
  public stripType!: string;
}
