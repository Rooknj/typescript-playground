import { plainToClass } from "class-transformer";
import { RGB, PublishPayload, PowerState } from "./light-messenger";
import { LightStateInput } from "./light-input";

export const hexStringToRGB = (hex: string): RGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const rgbObject: object = result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : // If it can't parse the hex string, just return white
      {
        r: 255,
        g: 255,
        b: 255,
      };
  return plainToClass(RGB, rgbObject);
};

const componentToHex = (c: number): string => {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
};

export const rgbToHexString = (r: number, g: number, b: number): string => {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
};

export const mapLightStateInputToPublishPayload = (
  id: string,
  lightStateInput: LightStateInput
): PublishPayload => {
  const { on, color, ...rest } = lightStateInput;
  const publishPayloadObject: object = { ...rest };

  // Map on value to state property
  // TODO: Implement the hardware to support on instead of state
  // Need to check if the property is in lightStateInput because on can be false
  if ("on" in lightStateInput) {
    const state = on ? PowerState.on : PowerState.off;
    Object.assign(publishPayloadObject, { state });
  }

  // Convert hex color to RGB
  if (color) {
    const rgbColor = hexStringToRGB(color);
    Object.assign(publishPayloadObject, { color: rgbColor });
  }

  // This is the max number supported by the esp8266 lights (it's 2^32 because its a 32 bit int)
  const mutationId = Math.floor(Math.random() * 4294967296);

  // TODO: Implement String Uuid on hardware instead of using an int (unless this hurts performance)
  // TODO: Rename name to ID on hardware
  return plainToClass(PublishPayload, { mutationId, name: id, ...publishPayloadObject });
};
