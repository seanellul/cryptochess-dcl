/* Importing the `VECTOR_OFFSET` constant from the `offsets.ts` file. */
import { VECTOR_OFFSET } from 'offsets'

/**
 * Create a new entity, add an audio source component to it, set the volume, and attach it to the
 * avatar.
 * @param {string} path - The path to the sound file.
 * @returns The entity is being returned.
 */
export function initSound(path: string) {
  const entity = new Entity()
  engine.addEntity(entity)
  entity.addComponent(
    new AudioSource(new AudioClip(path))
  )
  entity.getComponent(AudioSource).volume = 0.3

  entity.setParent(Attachable.AVATAR)
  return entity
}

/**
 * It creates an entity, adds a transform component to it, adds a shape component to it, and then adds
 * the entity to the engine
 * @param {Shape} shape - The shape component to add to the entity.
 * @param {Vector3} position - The position of the entity in the world.
 * @param {Vector3} scale - Vector3 - The size of the entity.
 * @param {Quaternion} [rotation] - Quaternion
 * @returns The entity that was created.
 */
export function spawnEntity(shape: Shape, position: Vector3, scale: Vector3, rotation?: Quaternion) {
  const entity = new Entity()

  entity.addComponent(new Transform({ position: position, scale: scale, rotation }))
  entity.addComponent(shape)
  engine.addEntity(entity)

  return entity
}


let outWhitePos: number = -1
export const nextValidOutsideWhiteCell = () => {
  if (outWhitePos < outsideCellsWhite.length - 1)
    outWhitePos++
  return outsideCellsWhite[outWhitePos]
}
let outBlackPos: number = -1
export const nextValidOutsideBlackCell = () => {
  if (outBlackPos < outsideCellsBlack.length - 1)
    outBlackPos++
  return outsideCellsBlack[outBlackPos]
}


function initOutsideCells(offsetX: number, offsetZ: number) {
  let list = []
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 10; j++) {
      if (j != 4 && j != 5) {
        list.push(new Vector3(offsetX + j, 0, offsetZ - i).add(VECTOR_OFFSET))
        // spawnEntity(new BoxShape(), new Vector3(offsetX + j ,0, offsetZ - i))
      }
    }
  }
  return list
}

let outsideCellsWhite = initOutsideCells(3.5, 14)
let outsideCellsBlack = initOutsideCells(3.5, 3)