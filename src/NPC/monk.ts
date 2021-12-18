import { NPC } from '@dcl/npc-scene-utils'
import { config } from './config'
import { MonkDialog } from './dialog'

export const monk = new NPC(
  {position: config.position,rotation: config.rotation},
  'models/Robot_final.glb',
  () => {
    // animations
    // monk.playAnimation('Hello', true, 2)

    // let dummyent = new Entity()
    // dummyent.addComponent(
    //   new NPCDelay(2, () => {
    //     monk.playAnimation('Talk')
    //   })
    // )
    // engine.addEntity(dummyent)

    // sound
    monk.addComponentOrReplace(new AudioSource(new AudioClip('sounds/monk.mp3')))
    monk.getComponent(AudioSource).playOnce()

    // dialog UI
    monk.talk(MonkDialog)
  },
  {
    faceUser: false,
    hoverText: config.hovertext,
    reactDistance: config.reactDistance,
    portrait: {
      path: `images/portraits/${config.portraits}`,
      height: 256,
      width: 256,
      section: {
        sourceHeight: 512,
        sourceWidth: 512,
      },
    },
    onWalkAway: () => {
      // monk.playAnimation('Goodbye', true, 2)
    },
  }
)