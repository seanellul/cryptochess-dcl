import { initSound, spawnEntity } from "helpers"

const WHITE = "white"
const BLACK = "black"

let currentInHand: any = null
let turn: string = WHITE

// // sounds
const pickupSound = initSound("sounds/pickedup.mp3")
const placedSound = initSound("sounds/placed.mp3")


class WhitePiece {
  public King = {number: 1, name: "King", model: new GLTFShape("models/King.glb")}
  public Pawn = {number: 2, name: "Pawn", model: new GLTFShape("models/Etherum.glb")}
  public Knight = {number: 3, name: "Knight", model: new GLTFShape("models/Horse_White.glb")}
  public Bishop = {number: 4, name: "Bishop", model: new GLTFShape("models/Slon_white.glb")}
  public Rook = {number: 5, name: "Rook", model: new GLTFShape("models/Ladja_white.glb")}
  public Queen = {number: 6, name: "Queen", model: new GLTFShape("models/Queen_white.glb")}
}
class BlackPiece {
  public King = {number: 1, name: "King", model: new GLTFShape("models/King.glb")}
  public Pawn = {number: 2, name: "Pawn", model: new GLTFShape("models/Binance.glb")}
  public Knight = {number: 3, name: "Knight", model: new GLTFShape("models/Horse_White.glb")}
  public Bishop = {number: 4, name: "Bishop", model: new GLTFShape("models/Slon_Black.glb")}
  public Rook = {number: 5, name: "Rook", model: new GLTFShape("models/Ladja_black.glb")}
  public Queen = {number: 6, name: "Queen", model: new GLTFShape("models/Queen_black.glb")}
}

const whitePiece = new WhitePiece()
const blackPiece = new BlackPiece()
const whitePieces = [whitePiece.Rook, whitePiece.Knight, whitePiece.Bishop, whitePiece.Queen, whitePiece.King, whitePiece.Bishop, whitePiece.Knight, whitePiece.Rook, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn]
const blackPieces = [blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Rook, blackPiece.Knight, blackPiece.Bishop, blackPiece.Queen, blackPiece.King, blackPiece.Bishop, blackPiece.Knight, blackPiece.Rook]


//  initialize board matrix
let boardMatrix: Entity[][]     // not used so far

const pieceHeight = 0.3

const piecePlaceholder = new BoxShape()


// Video billboard
// Make it smaller?
const myVideoClip = new VideoClip(
  "videos/bladerunner540.mp4"
)
const myVideoTexture = new VideoTexture(myVideoClip)
const myMaterial = new Material()
myMaterial.albedoColor = new Color3(1.5, 1.5, 1.5)
myMaterial.albedoTexture = myVideoTexture
myMaterial.roughness = 1
myMaterial.specularIntensity = 1
myMaterial.metallic = 0
const screen = new Entity()
screen.addComponent(new PlaneShape())
screen.addComponent(
  new Transform({
    position: new Vector3(8, 3, 15.7),
    scale: new Vector3(16, 7, 1),
    rotation: new Quaternion(0, 180)
  })
)
screen.addComponent(myMaterial)
screen.addComponent(
  new OnPointerDown(() => {
    myVideoTexture.playing = !myVideoTexture.playing
  })
)
screen.removeComponent(OnPointerDown)
engine.addEntity(screen)
myVideoTexture.loop = true
myVideoTexture.play()


const board = spawnEntity(new GLTFShape("models/Doska.glb"), new Vector3(8, 0, 8)) 
const pol = spawnEntity(new GLTFShape("models/Pol.glb"), new Vector3(8, 0, 8))

@Component("boardCellFlag")
export class BoardCellFlag {
  vacant: boolean
  piece: null | IEntity
  baseColour: Color3
  constructor(vacant: boolean = true, piece: null | IEntity = null, baseColour: Color3 = Color3.White()) {
    this.vacant = vacant
    this.piece = piece
    this.baseColour = baseColour

  }
}
function makeChessBoard() {
  let offset = 3.5
  boardMatrix = []
  for(let row = 1; row < 9; row++) {
    boardMatrix[row] = []
    for(let col = 1; col < 9; col++) {
     

      const tileModel = ((row + col) % 2 == 1) ? new GLTFShape("models/Binance_plane.glb") : new GLTFShape("models/Etherium_plane.glb")
      let box = spawnEntity(tileModel, new Vector3(offset + col, 0.2, offset + row))
      box.getComponent(Transform).rotate(new Vector3(0,1,0), 180)
      box.addComponent(new BoardCellFlag())
      
      const boardMaterial = new Material()
      const boxColour = boardMaterial.albedoColor = ((row + col) % 2 == 1) ? Color3.Gray() : Color3.White()
      boardMaterial.albedoColor = boxColour
      boardMaterial.metallic = 1.0
      boardMaterial.roughness = 0.0
      // box.addComponent(boardMaterial)

      box.getComponent(BoardCellFlag).baseColour = boxColour

      // populate matrix
      boardMatrix[row][col] = box
    }
  }
}

const boxGroup = engine.getComponentGroup(BoardCellFlag)

function enableInteractableBox(interactable: boolean) {

  for (let box of boxGroup.entities) {
    // TODO: replace with onPointerDown with HintText and maximum click distance
    let boxOnClick = new OnPointerDown(() => {
      placedSound.getComponent(AudioSource).playOnce()
      let boxPosition = box.getComponent(Transform).position

      if (currentInHand) {
        currentInHand.getComponent(Transform).position = new Vector3(boxPosition.x, pieceHeight, boxPosition.z)
        currentInHand.setParent(null)
        currentInHand.getComponent(GLTFShape).isPointerBlocker = true

        turn = currentInHand.getComponent(PieceFlag).color == WHITE ? BLACK : WHITE
        currentInHand = null
      }

      enableInteractableBox(false)
      enableInteractablePiece(true)

    },
    {
      hoverText: "Place the piece"
    })

    if (interactable) {
      box.addComponent(boxOnClick)

    } else {
      box.removeComponent(boxOnClick)
    }
  }
}

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
    let pieceOnClick = new OnPointerDown(() => {
      pickupSound.getComponent(AudioSource).playOnce()
      piece.getComponent(Transform).position = new Vector3(0, 0, 1)
      piece.setParent(Attachable.AVATAR)
      piece.getComponent(GLTFShape).isPointerBlocker = false
      currentInHand = piece

      enableInteractablePiece(false)
      enableInteractableBox(true)
    },
    {
      hoverText: "Pick the " + piece.getComponent(PieceFlag).name
    })

    if (interactable) {
      if (piece.getComponent(PieceFlag).color == turn)
        piece.addComponent(pieceOnClick)
    } else {
      piece.removeComponent(pieceOnClick)
    }
  }
}

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

makeChessBoard()
addPieces()
enableInteractablePiece(true)