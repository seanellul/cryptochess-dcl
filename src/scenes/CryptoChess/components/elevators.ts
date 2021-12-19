import * as utils from '@dcl/ecs-scene-utils'
import {VECTOR_OFFSET} from 'offsets'
import { spawnEntity, initSound } from "helpers"
import resources from '../resources'

// Elevator logic
@Component("lerpData")
export class LerpData {
  origin: Vector3 = Vector3.Zero()
  target: Vector3 = Vector3.Zero()
  fraction: number = 0
  constructor(origin: Vector3, target: Vector3, fraction: number) {
    this.origin = origin
    this.target = target
    this.fraction = fraction
  }
}
export class LerpMove implements ISystem {
  update(dt: number) {
    for (let el of elevatorGroup.entities) {
      if (el.hasComponent(LerpData)) {
        let transform = el.getComponent(Transform)
        let lerp = el.getComponent(LerpData)
        if (lerp.fraction < 1) {
          transform.position = Vector3.Lerp(lerp.origin, lerp.target, lerp.fraction)
          lerp.fraction += dt / 1
        }
      }
    }
  }
}

const LerpMoveSystem = new LerpMove() 

const ethOrigin = new Vector3(8, 0, 2).add(VECTOR_OFFSET)
const bnbOrigin = new Vector3(8, 0, 14).add(VECTOR_OFFSET)

const elevatorSound = initSound(resources.elevatorSound)

@Component("isElevator")
export class IsElevator {}

function initElevator(origin: Vector3, side: string) {
  const elevator = spawnEntity(new GLTFShape(resources.elevator), origin, new Vector3(1, 1, 1))
  if (side == "eth") {
    elevator.getComponent(Transform).rotate(new Vector3(0, 1, 0), 180)
  }
  elevator.addComponent(new IsElevator())
  return elevator
}

const elevatorGroup = engine.getComponentGroup(IsElevator)

export function spawnElevators() {
    const ethElevator = initElevator(ethOrigin, "eth")
    const bnbElevator = initElevator(bnbOrigin, "bnb")
    
    const elevatorGroup = engine.getComponentGroup(IsElevator)
    
    for (let el of elevatorGroup.entities) {
      const pos = el.getComponent(Transform).position
      const posTop = new Vector3(pos.x , 4, pos.z)
      const posBottom = new Vector3(pos.x , 0, pos.z)


      const onClickUp = new OnPointerDown(() => {
        elevatorSound.getComponent(AudioSource).playOnce()
        el.addComponentOrReplace(new LerpData(el.getComponent(Transform).position, posTop, 0))
        if (el.hasComponent(OnPointerDown))
          el.removeComponent(OnPointerDown)
        el.addComponent(onClickDown)
        engine.removeSystem(LerpMoveSystem)
        engine.addSystem(LerpMoveSystem)
      },
      {
        hoverText: "Press to go UP",
        distance: 6
      })
      const onClickDown = new OnPointerDown(() => {
        elevatorSound.getComponent(AudioSource).playOnce()
        el.addComponentOrReplace(new LerpData(el.getComponent(Transform).position, posBottom, 0))
        if (el.hasComponent(OnPointerDown))
          el.removeComponent(OnPointerDown)
        el.addComponent(onClickUp)
        engine.removeSystem(LerpMoveSystem)
        engine.addSystem(LerpMoveSystem)
      },
      {
        hoverText: "Press to go DOWN",
        distance: 6
      })
      
      el.addComponent(onClickUp)

      // trigger to go down if player jumped off
      const onCameraExit = new utils.TriggerComponent(
        new utils.TriggerBoxShape(new Vector3(2, 3, 4), new Vector3(0, 3, 0)),
        {
          onCameraExit: () => {
            if (Math.floor(el.getComponent(Transform).position.y) !== posBottom.y)
              elevatorSound.getComponent(AudioSource).playOnce()
            el.addComponentOrReplace(new LerpData(el.getComponent(Transform).position, posBottom, 0))
            if (el.hasComponent(OnPointerDown))
              el.removeComponent(OnPointerDown)
            el.addComponent(onClickUp)
            engine.removeSystem(LerpMoveSystem)
            engine.addSystem(LerpMoveSystem)
          }
        }
      )

      new utils.TriggerBoxShape

      el.addComponent(onCameraExit)
    }

}