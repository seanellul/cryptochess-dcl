
export function initSound(path: string) {
    const entity =  new Entity()
    engine.addEntity(entity)
    entity.addComponent(
        new AudioSource(new AudioClip(path))
    )
    entity.getComponentOrCreate(Transform).position = new Vector3(8,0,8)
    return entity
}

export function spawnEntity(shape: Shape, position: Vector3, rotation?: Quaternion) {
    const entity = new Entity()
    
    entity.addComponent(new Transform({ position: position, rotation }))
    entity.addComponent(shape)
    engine.addEntity(entity)
    
    return entity
}


let outWhitePos = -1
export const nextValidOutsideWhiteCell = () => {
  if (outWhitePos < outsideCellsWhite.length - 1)
    outWhitePos++
  return outsideCellsWhite[outWhitePos]
}
let outBlackPos = -1
export const nextValidOutsideBlackCell = () => {
  if (outBlackPos < outsideCellsBlack.length - 1)
    outBlackPos++
  return outsideCellsBlack[outBlackPos]
}

function initOutsideCells(offsetX: number, offsetZ: number) {
  let list = [] 
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 10; j++){
      if (j != 4 && j != 5) {
        list.push(new Vector3(offsetX + j ,0, offsetZ - i))
        // spawnEntity(new BoxShape(), new Vector3(offsetX + j ,0, offsetZ - i))
      }
    }
  }
  return list  
}

let outsideCellsWhite = initOutsideCells(3.5, 14)
let outsideCellsBlack = initOutsideCells(3.5, 3)