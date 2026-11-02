import { Composition, Still, registerRoot } from 'remotion'
import { Story, FPS } from './Story'
import { Thumbnail } from './Thumbnail'
import film from '../public/story.json'
import short from '../public/story-short.json'

const Root = () => (
  <>
    <Composition id="Launch" component={Story} defaultProps={{ data: film }} durationInFrames={Math.ceil(film.total * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="Short" component={Story} defaultProps={{ data: short }} durationInFrames={Math.ceil(short.total * FPS)} fps={FPS} width={1920} height={1080} />
    <Still id="Thumb" component={Thumbnail} width={1920} height={1080} />
  </>
)
registerRoot(Root)
