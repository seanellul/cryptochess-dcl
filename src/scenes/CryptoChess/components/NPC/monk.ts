import { NPC } from '@dcl/npc-scene-utils'
import resources from '../../resources'
import { config } from './config'
import { MonkDialog } from './dialog'

export const monk = new NPC(
  { position: config.position, rotation: config.rotation },
  resources.robot,
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
    monk.addComponentOrReplace(new AudioSource(new AudioClip(resources.monkSound)))
    monk.getComponent(AudioSource).playOnce()

    // dialog UI
    monk.talk(MonkDialog)
  },
  {
    faceUser: false,
    // hoverText: config.hovertext,    // not used
    reactDistance: config.reactDistance,
    onlyExternalTrigger: true,
    portrait: {
      path: resources.robotImage,
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