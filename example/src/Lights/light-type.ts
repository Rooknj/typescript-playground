import { ObjectType, Field, ID, Int } from "type-graphql";
import { GraphQLScalarType } from "graphql";
import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
@ObjectType({ description: "Object representing a Light" })
export class Light {
  @PrimaryColumn({ type: "varchar", length: 255 })
  @Field((): GraphQLScalarType => ID)
  public id!: string;

  @Column({ type: "varchar", length: 255 })
  @Field({ description: "The display name of the Light" })
  public name!: string;

  @Column({ type: "double" })
  @Field()
  public pos!: number;

  @Column({ type: "simple-array", nullable: true })
  @Field((): StringConstructor[] => [String], { nullable: true })
  public supportedEffects?: string[];

  @Column({ type: "varchar", nullable: true })
  @Field({ nullable: true })
  public ipAddress?: string;

  @Column({ type: "varchar", nullable: true })
  @Field({ nullable: true })
  public macAddress?: string;

  @Column({ type: "int", nullable: true })
  @Field((): GraphQLScalarType => Int, { nullable: true })
  public numLeds?: number;

  @Column({ type: "int", nullable: true })
  @Field((): GraphQLScalarType => Int, { nullable: true })
  public udpPort?: number;

  @Column({ type: "varchar", nullable: true })
  @Field({ nullable: true })
  public version?: string;

  @Column({ type: "varchar", nullable: true })
  @Field({ nullable: true })
  public hardware?: string;

  @Column({ type: "varchar", nullable: true })
  @Field({ nullable: true })
  public colorOrder?: string;

  @Column({ type: "varchar", nullable: true })
  @Field({ nullable: true })
  public stripType?: string;
}
