import { 
  initSound, 
  spawnEntity, 
  nextValidOutsideWhiteCell, 
  nextValidOutsideBlackCell
 } from "helpers"
import { whitePieces, blackPieces } from "pieces"
import { addBillboard } from "billboard"
import { sceneMessageBus } from "messageBus"

const WHITE = "white"
const BLACK = "black"

let currentInHand: any = null
let prevPos: IEntity | null = null
let turn: string = WHITE

// sounds
const pickupSound = initSound("sounds/pickedup.mp3")
const eathenSound = initSound("sounds/eaten.mp3")
const placedSound = initSound("sounds/placed.mp3")
const resetSound = initSound("sounds/reset.mp3")
const background = initSound("sounds/179_cyberpunk_city.mp3")

background.getComponent(AudioSource).loop = true
background.getComponent(AudioSource).playing = true

const pieceHeight = 0.3

addBillboard()

const board = spawnEntity(new GLTFShape("models/Doska.glb"), new Vector3(8, 0, 8)) 
const pol = spawnEntity(new GLTFShape("models/Pol.glb"), new Vector3(8, 0, 8))
const neonInt = spawnEntity(new GLTFShape("models/Neon_interior.glb"), new Vector3(8, 0, 9), new Quaternion(0, 180)) 

@Component("boardCellFlag")
export class BoardCellFlag {
  vacant: boolean
  piece: null | IEntity
  constructor(vacant: boolean = true, piece: null | IEntity = null) {
    this.vacant = vacant
    this.piece = piece

  }
}
function makeChessBoard() {
  let offset = 3.5
  for(let row = 1; row < 9; row++) {
    for(let col = 1; col < 9; col++) {
      const tileModel = ((row + col) % 2 == 1) ? new GLTFShape("models/Binance_plane.glb") : new GLTFShape("models/Etherium_plane.glb")
      let box = spawnEntity(tileModel, new Vector3(offset + col, 0.2, offset + row))
      box.getComponent(Transform).rotate(new Vector3(0,1,0), 180)
      box.addComponent(new BoardCellFlag())
    }
  }
}

const boxGroup = engine.getComponentGroup(BoardCellFlag)

function placePiece(box: IEntity) {
  let boxPosition = box.getComponent(Transform).position

  if (currentInHand) {
    currentInHand.getComponent(Transform).position = new Vector3(boxPosition.x, pieceHeight, boxPosition.z)
    currentInHand.setParent(null)
    
    currentInHand.getComponent(GLTFShape).isPointerBlocker = true  

    // place back to the same cell and don't loose a turn
    if (prevPos != box) {
      turn = currentInHand.getComponent(PieceFlag).color == WHITE ? BLACK : WHITE
    }
    prevPos = null

    box.getComponent(BoardCellFlag).vacant = false
    box.getComponent(BoardCellFlag).piece = currentInHand
    currentInHand = null

  }

  enableInteractableBox(false)
  enableInteractableEnemy(false)
  enableInteractablePiece(true)
}

function enableInteractableBox(interactable: boolean) {
  
  for (let box of boxGroup.entities) {
    if (interactable && box.getComponent(BoardCellFlag).vacant) {
      // TODO: set maximum click distance?
      let boxOnClick = new OnPointerDown(() => {
        placedSound.getComponent(AudioSource).playOnce()
        
        sceneMessageBus.emit('placePiece', {puuid: prevPos!.uuid, buuid: box.uuid, currentInHand: currentInHand?.uuid})
    
        placePiece(box)
      },
      {
        hoverText: "Place the piece"
      })

    
      box.addComponent(boxOnClick)
    } else {
      if (box.hasComponent(OnPointerDown)) 
        box.removeComponent(OnPointerDown)
    }
  }
}

sceneMessageBus.on('placePiece', (info: any) => {
  const newBox = boxGroup.entities.filter((box) => {return box.uuid == info.buuid})[0]
  placePiece(newBox)
})

@Component("pieceFlag")
export class PieceFlag {
  color: string
  name: string
  number: number
  active: boolean
  constructor(color: string, name: string, number: number, active: boolean = true) {
    this.color = color
    this.name = name
    this.number = number
    this.active = active
  }
}

const pieceGroup = engine.getComponentGroup(PieceFlag)

function enableInteractablePiece(interactable: boolean) {
  
  for (let piece of pieceGroup.entities) {
    if (
      interactable &&
      piece.getComponent(PieceFlag).color == turn &&
      piece.getComponent(PieceFlag).active == true
      ) {
    
      let pieceOnClick = new OnPointerDown(() => {
        pickupSound.getComponent(AudioSource).playOnce()

        piece.getComponent(Transform).position = new Vector3(0, 0, 1)
        piece.setParent(Attachable.AVATAR)

        piece.getComponent(GLTFShape).isPointerBlocker = false  
        
        // TODO: Make transparent as it block the view in 1st person view 

        currentInHand = piece

        sceneMessageBus.emit("pickupPiece", {currentInHand: currentInHand.uuid})

        for (let box of boxGroup.entities) {
          if (box.getComponent(BoardCellFlag).piece) {
            if (box.getComponent(BoardCellFlag).piece! === piece) {
              box.getComponent(BoardCellFlag).vacant = true
              prevPos = box
              box.getComponent(BoardCellFlag).piece = null
            }
          }
        }

        enableInteractablePiece(false)
        enableInteractableEnemy(true)
        enableInteractableBox(true)
      },
      {
        hoverText: "Pick the " + piece.getComponent(PieceFlag).name
      })

      piece.addComponent(pieceOnClick)
    } else {
      if (piece.hasComponent(OnPointerDown)) 
        piece.removeComponent(OnPointerDown)
    }
  }
}
sceneMessageBus.on("pickupPiece", (info) => {
  enableInteractablePiece(false)
  currentInHand = pieceGroup.entities.filter((piece) => {return piece.uuid == info.currentInHand})[0]

  for (let box of boxGroup.entities) {
    if (box.getComponent(BoardCellFlag).piece) {
      if (box.getComponent(BoardCellFlag).piece! === currentInHand) {
        box.getComponent(BoardCellFlag).vacant = true
        prevPos = box
        box.getComponent(BoardCellFlag).piece = null
      }
    }
  }

})


function enableInteractableEnemy(interactable: boolean) {
  for (let piece of pieceGroup.entities) {
    if (
      interactable &&
      piece.getComponent(PieceFlag).color != turn &&
      piece.getComponent(PieceFlag).active == true
      ) {

      let pieceOnClick = new OnPointerDown(() => {
        
        const box = boxGroup.entities.filter((box) => {return box.getComponent(BoardCellFlag).piece! == piece})[0]
        eathenSound.getComponent(AudioSource).playOnce()
        
        sceneMessageBus.emit("takePiece", {pieceId: piece.uuid, boxId: box.uuid, prevPos: prevPos?.uuid, currentInHand: currentInHand?.uuid})

        placePiece(box)
      },
      {
        hoverText: "Take the enemy " + piece.getComponent(PieceFlag).name
      })     

      piece.addComponent(pieceOnClick)
    } else {
      if (piece.hasComponent(OnPointerDown)) 
        piece.removeComponent(OnPointerDown)
    }
  }
}

sceneMessageBus.on('takePiece', (info) => {
  const newBox = boxGroup.entities.filter((box) => {return box.uuid == info.boxId})[0]
  const piece = pieceGroup.entities.filter((piece) => {return piece.uuid == info.pieceId})[0]

  if (piece.getComponent(PieceFlag).color == WHITE) {
    piece.getComponent(Transform).position = nextValidOutsideWhiteCell()
  } else {
    piece.getComponent(Transform).position = nextValidOutsideBlackCell()
  }
  // disable piece
  piece.getComponent(PieceFlag).active = false

  placePiece(newBox)
})

@Component("isPawn")
export class IsPawn {}

function addPieces() {
  for (let i = 0; i < boxGroup.entities.length; i++) {
    if (i < 16 || i > 47) {
      let box = boxGroup.entities[i]
      let x = box.getComponent(Transform).position.x
      let z = box.getComponent(Transform).position.z

      let piece = null
      box.getComponent(BoardCellFlag).vacant = false
      
      // might need to offset some figures
      const pos = new Vector3(x, pieceHeight, z)
      
      if (i > 47) {
        let tempPiece = blackPieces[i - 48]
        piece = spawnEntity(tempPiece.model, pos, new Quaternion(0, 180))
        piece.addComponent(new PieceFlag(BLACK, tempPiece.name, tempPiece.number))
        if (tempPiece.name == "Pawn") 
          piece.addComponent(new IsPawn())
      } else if (i < 16){
        piece = spawnEntity(whitePieces[i].model, pos)
        piece.addComponent(new PieceFlag(WHITE, whitePieces[i].name, whitePieces[i].number))
        if (whitePieces[i].name == "Pawn") 
          piece.addComponent(new IsPawn())
      }

      box.getComponent(BoardCellFlag).piece = piece
    }
  }
}

// make pawns float
const pawnGroup = engine.getComponentGroup(IsPawn)

let fraction = 0
export class FloatMove implements ISystem {
  update(dt: number) {
    for (let pawn of pawnGroup.entities) {
      let transform = pawn.getComponent(Transform)
      fraction += dt/30  // speed
      const magnitude = 10
      const height = 0.5
      transform.position.y = height + Math.sin(Math.PI * fraction) / magnitude
    }
  }
}

engine.addSystem(new FloatMove())

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
    for (let el of elevatorGroup.entities){
      if (el.hasComponent(LerpData)) {
        let transform = el.getComponent(Transform)
        let lerp = el.getComponent(LerpData)
        if (lerp.fraction < 1) {
          transform.position = Vector3.Lerp(lerp.origin, lerp.target, lerp.fraction)
          lerp.fraction += dt / 6
        } else {
          engine.removeSystem(new LerpMove())
        }

      }

    }
  }
}

const ethOrigin = new Vector3(8, 0, 2)
const bnbOrigin = new Vector3(8, 0, 14)

@Component("isElevator")
export class IsElevator {}

function initElevator(origin: Vector3, side: string) {
  const elevator = spawnEntity(new BoxShape(), origin)
  elevator.getComponent(Transform).scale = new Vector3(2, 0.1, 3)
  elevator.addComponent(new IsElevator())
  return elevator
}

const ethElevator = initElevator(ethOrigin, "eth")
const bnbElevator = initElevator(bnbOrigin, "bnb")

const elevatorGroup = engine.getComponentGroup(IsElevator)

for (let el of elevatorGroup.entities) {
  const pos = el.getComponent(Transform).position
  const posTop = new Vector3(pos.x , 4, pos.z)
  const posBottom = new Vector3(pos.x , 0, pos.z)
  const onClickUp = new OnPointerDown(() => {
    el.addComponentOrReplace(new LerpData(el.getComponent(Transform).position, posTop, 0))
    if (el.hasComponent(OnPointerDown))
      el.removeComponent(OnPointerDown)
    el.addComponent(onClickDown)
    engine.addSystem(new LerpMove())
  },
  {
    hoverText: "Press to go UP",
    distance: 6
  })
  const onClickDown = new OnPointerDown(() => {
    el.addComponentOrReplace(new LerpData(el.getComponent(Transform).position, posBottom, 0))
    if (el.hasComponent(OnPointerDown))
      el.removeComponent(OnPointerDown)
    el.addComponent(onClickUp)
    engine.addSystem(new LerpMove())
  },
  {
    hoverText: "Press to go DOWN",
    distance: 6
  })
  
  el.addComponent(onClickUp)
}


makeChessBoard()
addPieces()
enableInteractablePiece(true)