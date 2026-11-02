import { Composition, Still, registerRoot, staticFile } from 'remotion'
import { Film, FPS } from './Film'
import { Short } from './Short'
import { Thumbnail } from './Thumbnail'
import timeline from '../public/timeline.json'
import short from '../public/timeline-short.json'

const Root = () => (
  <>
    <Composition id="Launch" component={Film} durationInFrames={Math.ceil(timeline.total * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="Short" component={Short} durationInFrames={Math.ceil(short.total * FPS)} fps={FPS} width={1920} height={1080} />
    <Still id="Thumb" component={Thumbnail} width={1920} height={1080} />
  </>
)
registerRoot(Root)
