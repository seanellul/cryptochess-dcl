import { 
  initSound, 
  spawnEntity, 
  nextValidOutsideWhiteCell, 
  nextValidOutsideBlackCell
 } from "helpers"
import { whitePieces, blackPieces } from "pieces"
import { addBillboard } from "billboard"
import { spawnElevators } from "elevators"
import { sceneMessageBus } from "messageBus"

const WHITE = "white"
const BLACK = "black"

let currentInHand: any = null
let prevPos: IEntity | null = null
let turn: string = WHITE

let moveCounter: number = 0
let moveHistory: any[] = []
let redoHistory: any[] = []


// sounds
const pickupSound = initSound("sounds/pickedup.mp3")
const eathenSound = initSound("sounds/eaten.mp3")
const placedSound = initSound("sounds/placed.mp3")
const resetSound = initSound("sounds/reset.mp3")
const background = initSound("sounds/background.mp3")

background.getComponent(AudioSource).loop = true
background.getComponent(AudioSource).playing = true


const pieceHeight = 0.1


addBillboard(
  "videos/bladerunner540.mp4", 
  new Transform({
    position: new Vector3(8, 3, 15.9),
    scale: new Vector3(16, 7, 1),
    rotation: Quaternion.Euler(0, 180, 0)
  })
)

addBillboard(
  "videos/bladerunner3.mp4", 
  new Transform({
    position: new Vector3(15.9, 3, 8),
    scale: new Vector3(16, 7, 1),
    rotation: Quaternion.Euler(0, 90, 0)
  })
)

// addBillboard(
//   "videos/bladerunner3.mp4", 
//   new Transform({
//     position: new Vector3(0.1, 3, 8),
//     scale: new Vector3(16, 7, 1),
//     rotation: Quaternion.Euler(0, 90, 0)
//   })
// )

const board = spawnEntity(new GLTFShape("models/Numbered_board.glb"), new Vector3(8, 0, 8)) 
const pol = spawnEntity(new GLTFShape("models/Ground.glb"), new Vector3(8, 0, 8))
const neonInt = spawnEntity(new GLTFShape("models/Neon_interior.glb"), new Vector3(8, 0, 9), new Quaternion(0, 180)) 
// const gambitBoard = spawnEntity(new GLTFShape("models/Tablica.glb"), new Vector3(0.8, 0, 8))
// gambitBoard.getComponent(Transform).rotate(new Vector3(0, 1, 0), 90)
const cornerPillar = spawnEntity(new GLTFShape("models/stolb.glb"), new Vector3(15.35, 0, 15.35))
const wall_left = spawnEntity(new GLTFShape("models/Wall_on_left_side.glb"), new Vector3(0.25, 0, 8), Quaternion.Euler(0, 90, 0))

const robot = spawnEntity(new GLTFShape("models/Robot_final.glb"), new Vector3(3, 0, 2), Quaternion.Euler(0, 180, 0))

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
      let box = spawnEntity(tileModel, new Vector3(offset + col, 0.21, offset + row))
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
      redoHistory = []
      moveHistory[moveCounter] = {
        id: currentInHand.uuid,
        prevPos: prevPos?.uuid,
        newPos: box.uuid,
        pieceTaken: box.getComponent(BoardCellFlag).piece ? box.getComponent(BoardCellFlag).piece?.uuid : null
      }
      moveCounter++
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
    
        // placePiece(box)
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
  ousideCell: null | Vector3
  constructor(color: string, name: string, number: number, active: boolean = true, outsideCell: null|Vector3 = null ) {
    this.color = color
    this.name = name
    this.number = number
    this.active = active
    this.ousideCell = outsideCell
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
    piece.getComponent(Transform).position = piece.getComponent(PieceFlag).ousideCell ? piece.getComponent(PieceFlag).ousideCell! : nextValidOutsideWhiteCell()
  } else {
    piece.getComponent(Transform).position = piece.getComponent(PieceFlag).ousideCell ? piece.getComponent(PieceFlag).ousideCell! : nextValidOutsideBlackCell()
  }
  // disable piece
  piece.getComponent(PieceFlag).active = false
  piece.getComponent(PieceFlag).ousideCell = piece.getComponent(Transform).position

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

spawnElevators()

// undo / redo
const redoButton = spawnEntity(new GLTFShape("models/Button_front-back.glb"), new Vector3(2.5, 0, 8.5), Quaternion.Euler(0, 180, 0))
const undoButton = spawnEntity(new GLTFShape("models/Button_front-back.glb"), new Vector3(2.5, 0, 8))
const restartButton = spawnEntity(new GLTFShape("models/Button_restart.glb"), new Vector3(2.5, 0, 7))

undoButton.addComponent(new OnPointerDown(() => {
  if (moveHistory.length) {
    sceneMessageBus.emit("undoButton", {})
  }
},
{
  hoverText: "Undo move"
}))

sceneMessageBus.on("undoButton", () => {
  resetSound.getComponent(AudioSource).playOnce()
  const last = moveHistory.pop()
  revertMove(last.id, last.prevPos, last.newPos)
  if (last.pieceTaken) {
    revertTaken(last.pieceTaken, last.newPos)
  }
  redoHistory.push(last)
})

redoButton.addComponent(new OnPointerDown(() => {
  if (redoHistory.length) {
    sceneMessageBus.emit("redoButton", {})
  }
},
{
  hoverText: "Redo move"
}))

sceneMessageBus.on("redoButton", () => {
  resetSound.getComponent(AudioSource).playOnce()
  const last = redoHistory.pop()
  revertMove(last.id, last.newPos, last.prevPos, true)
  if (last.pieceTaken) {
    revertToOutside(last.pieceTaken)
  }
  moveHistory.push(last)
})

function revertMove(pieceId: string, revertToId: string, revertFromId: string, redo: boolean = false) {
  const piece = pieceGroup.entities.filter((piece) => {return piece.uuid == pieceId})[0]
  // move made from
  const revertTo = boxGroup.entities.filter((box) => {return box.uuid == revertToId})[0]
  // move made to
  const revertFrom = boxGroup.entities.filter((box) => {return box.uuid == revertFromId})[0]
  // so to revert move to the opposite direction 

  // manualy update piece position, box vacation, turn
  const p = revertTo.getComponent(Transform).position
  piece.getComponent(Transform).position = new Vector3(p.x, pieceHeight, p.z)
  revertTo.getComponent(BoardCellFlag).piece = piece
  revertTo.getComponent(BoardCellFlag).vacant = false
  revertFrom.getComponent(BoardCellFlag).piece = null
  revertFrom.getComponent(BoardCellFlag).vacant = true

  if (redo) {
    turn = piece.getComponent(PieceFlag).color == WHITE ? BLACK : WHITE
  } else {
    turn = piece.getComponent(PieceFlag).color
  }

  enableInteractablePiece(false);
  enableInteractablePiece(true);

}

function revertTaken(pieceId: string, revertToId: string) {
  const piece = pieceGroup.entities.filter((piece) => {return piece.uuid == pieceId})[0]
  const revertTo = boxGroup.entities.filter((box) => {return box.uuid == revertToId})[0]

  const p = revertTo.getComponent(Transform).position
  piece.getComponent(Transform).position = new Vector3(p.x, pieceHeight, p.z)
  piece.getComponent(PieceFlag).active = true

  revertTo.getComponent(BoardCellFlag).piece = piece
  revertTo.getComponent(BoardCellFlag).vacant = false

}
function revertToOutside(pieceId: string) {
  const piece = pieceGroup.entities.filter((piece) => {return piece.uuid == pieceId})[0]
  piece.getComponent(Transform).position = piece.getComponent(PieceFlag).ousideCell!
  piece.getComponent(PieceFlag).active = false
}

// Reset game
restartButton.addComponent(new OnPointerDown((e)=>{
  sceneMessageBus.emit("reset", {})
}, {
  hoverText: "Reset the board"
}))

function reset(){
  resetSound.getComponent(AudioSource).playOnce()
  while (boxGroup.entities.length) {
    engine.removeEntity(boxGroup.entities[0])
  }
  while (pieceGroup.entities.length) {
    engine.removeEntity(pieceGroup.entities[0])
  }

  moveHistory = []
  redoHistory = []

  initBoard()  
}

sceneMessageBus.on("reset", ()=>{reset()})

function initBoard(): void {
    turn = WHITE;
    currentInHand = null
    makeChessBoard();
    addPieces();
    enableInteractablePiece(true);
}

initBoard()