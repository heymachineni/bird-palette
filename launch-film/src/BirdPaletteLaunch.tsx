import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { paper } from "./theme/colors";
import { SCENE_STARTS, lengthFor } from "./timing";
import { Scene1Opening } from "./scenes/Scene1Opening";
import { Scene2NatureCreated } from "./scenes/Scene2NatureCreated";
import { Scene3Recreate } from "./scenes/Scene3Recreate";
import { Scene4UntilNow } from "./scenes/Scene4UntilNow";
import { Scene5ProductReveal } from "./scenes/Scene5ProductReveal";
import { Scene6SearchColor } from "./scenes/Scene6SearchColor";
import { Scene7ColorWheel } from "./scenes/Scene7ColorWheel";
import { Scene8BirdDetails } from "./scenes/Scene8BirdDetails";
import { ClosingStatement } from "./scenes/ClosingStatement";
import { SceneFinal } from "./scenes/SceneFinal";

/**
 * Master composition. A concrete, product-driven narrative: nature created
 * color, humans recreate it, and Bird Palette makes it searchable. Scenes
 * cross-dissolve via small overlaps. Light, editorial finish.
 */
export const BirdPaletteLaunch: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: paper.base }}>
      <Sequence from={SCENE_STARTS.s1} durationInFrames={lengthFor("s1")} name="1 - Opening">
        <Scene1Opening />
      </Sequence>
      <Sequence from={SCENE_STARTS.s2} durationInFrames={lengthFor("s2")} name="2 - Nature created them">
        <Scene2NatureCreated />
      </Sequence>
      <Sequence from={SCENE_STARTS.s3} durationInFrames={lengthFor("s3")} name="3 - Recreate them">
        <Scene3Recreate />
      </Sequence>
      <Sequence from={SCENE_STARTS.s4} durationInFrames={lengthFor("s4")} name="4 - Until now">
        <Scene4UntilNow />
      </Sequence>
      <Sequence from={SCENE_STARTS.s5} durationInFrames={lengthFor("s5")} name="5 - Product reveal">
        <Scene5ProductReveal />
      </Sequence>
      <Sequence from={SCENE_STARTS.s6} durationInFrames={lengthFor("s6")} name="6 - Search by color">
        <Scene6SearchColor />
      </Sequence>
      <Sequence from={SCENE_STARTS.s7} durationInFrames={lengthFor("s7")} name="7 - Color wheel moment">
        <Scene7ColorWheel />
      </Sequence>
      <Sequence from={SCENE_STARTS.s8} durationInFrames={lengthFor("s8")} name="8 - Bird details">
        <Scene8BirdDetails />
      </Sequence>
      <Sequence from={SCENE_STARTS.c1} durationInFrames={lengthFor("c1")} name="Closing 1">
        <ClosingStatement
          sceneKey="c1"
          holdAfterTyping={0.75}
          backgroundSrc="product/homepage-top.png"
          text="The world's most colorful library already existed."
          maxWidth={1200}
        />
      </Sequence>
      <Sequence from={SCENE_STARTS.c3} durationInFrames={lengthFor("c3")} name="Closing 2">
        <ClosingStatement
          sceneKey="c3"
          holdAfterTyping={0.75}
          backgroundSrc="product/search-orange.png"
          text="We just organized it."
          maxWidth={900}
        />
      </Sequence>
      <Sequence from={SCENE_STARTS.final} durationInFrames={lengthFor("final")} name="Final - Logo">
        <SceneFinal />
      </Sequence>
    </AbsoluteFill>
  );
};
