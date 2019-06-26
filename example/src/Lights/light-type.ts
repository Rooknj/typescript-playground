import { ObjectType, Field, ID, Int } from "type-graphql";
import { GraphQLScalarType } from "graphql";
import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { ClassType } from "class-transformer/ClassTransformer";

@Entity()
@ObjectType({ description: "Object representing a Light's State" })
export class LightState {
  @PrimaryColumn()
  @Field((): GraphQLScalarType => ID)
  public id!: string;

  @Column()
  @Field({ description: "Whether the light is connected to the MQTT broker or not" })
  public connected!: boolean;

  @Column()
  @Field({ description: "Whether the light is switched on or not" })
  public on!: boolean;

  @Column({ type: "int" })
  @Field((): GraphQLScalarType => Int, {
    description: "The brightness of the light as a percentage from 0-100",
  })
  public brightness!: number;

  @Column()
  @Field({ description: "The current color of the light in hexadecimal notation" })
  public color!: string;

  @Column()
  @Field({ description: "The currently playing effect of the light" })
  public effect!: string;

  @Column({ type: "int" })
  @Field((): GraphQLScalarType => Int, {
    description: "The speed of the currently playing effect from 1-7",
  })
  public speed!: number;
}

@Entity()
@ObjectType({ description: "Object representing a Light" })
export class Light {
  @PrimaryColumn({ length: 255 })
  @Field((): GraphQLScalarType => ID)
  public readonly id!: string;

  @Column({ length: 255 })
  @Field({ description: "The display name of the Light" })
  public name!: string;

  @Column({ type: "double" })
  @Field({
    description:
      "The ordering of the light. Lower means closer to the top and higher means closer to the bottom",
  })
  public pos!: number;

  @Column({ type: "simple-array", nullable: true })
  @Field((): StringConstructor[] => [String], {
    nullable: true,
    description: "The list of effects the light can play",
  })
  public supportedEffects?: string[];

  @Column({ nullable: true })
  @Field({ nullable: true, description: "The IP Address of the light's controller" })
  public ipAddress?: string;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "The MAC Address of the light's controller" })
  public macAddress?: string;

  @Column({ type: "int", nullable: true })
  @Field((): GraphQLScalarType => Int, {
    nullable: true,
    description: "The number of LEDs the light has",
  })
  public numLeds?: number;

  @Column({ type: "int", nullable: true })
  @Field((): GraphQLScalarType => Int, {
    nullable: true,
    description: "The UDP port the light is listening on for music visualization data",
  })
  public udpPort?: number;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "The firmware version the light's controller is running" })
  public version?: string;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "The hardware of the light's controller" })
  public hardware?: string;

  @Column({ nullable: true })
  @Field({
    nullable: true,
    description: "The order of colors the light strip runs on ex: RGB, GRB, BGR",
  })
  public colorOrder?: string;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "The type of LED strip the light is ex: WS2812B, APA102" })
  public stripType?: string;

  @OneToOne((): ClassType<LightState> => LightState, { cascade: true })
  @JoinColumn()
  @Field((): ClassType<LightState> => LightState, { nullable: true })
  public state!: LightState;
}
