import React from "react";
import { Composition } from "remotion";
import { BirdPaletteLaunch } from "./BirdPaletteLaunch";
import { DURATION, FPS, WIDTH, HEIGHT } from "./timing";
import { waitForFonts } from "./theme/type";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BirdPaletteLaunch"
      component={BirdPaletteLaunch}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      calculateMetadata={async () => {
        await waitForFonts();
        return {};
      }}
    />
  );
};
