import {Composition} from 'remotion';
import Video, {calculateMetadata} from './Video';

export const RemotionRoot = () => {
  return (
    <Composition
      id="Main"
      component={Video}
      durationInFrames={424}
      fps={30}
      width={1920}
      height={1080}
      calculateMetadata={calculateMetadata}
    />
  );
};
