

const WHITE = "white"
const BLACK = "black"

let currentInHand: any = null
let turn: string = WHITE

const whitePieces = ["Rook", "Knight", "Bishop", "Queen", "King", "Bishop", "Knight", "Rook", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn"]
const blackPieces = ["Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Rook", "Knight", "Bishop", "Queen", "King", "Bishop", "Knight", "Rook"]

const pieceHeight = 1

const piecePlaceholder = new BoxShape()

function spawnEntity(shape: Shape, position: Vector3, rotation?: Quaternion) {
  const entity = new Entity()

  entity.addComponent(new Transform({ position: position, rotation }))
  entity.addComponent(shape)
  engine.addEntity(entity)

  return entity
}

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
  for(let row = 1; row < 9; row++) {
    for(let col = 1; col < 9; col++) {
     

      // const tileModel = ((row + col) % 2 == 1) ? new GLTFShape("models/Tile_yellow.glb") : new GLTFShape("models/Tile_purple.glb")

      let box = spawnEntity(new BoxShape(), new Vector3(offset + col, 0.2, offset + row))
      box.addComponent(new BoardCellFlag())
      
      const boardMaterial = new Material()
      const boxColour = boardMaterial.albedoColor = ((row + col) % 2 == 1) ? Color3.Gray() : Color3.White()
      boardMaterial.albedoColor = boxColour
      boardMaterial.metallic = 1.0
      boardMaterial.roughness = 0.0
      box.addComponent(boardMaterial)

      box.getComponent(BoardCellFlag).baseColour = boxColour
    }
  }
}

const boxGroup = engine.getComponentGroup(BoardCellFlag)

function enableInteractableBox(interactable: boolean) {

  for (let box of boxGroup.entities) {
    // TODO: replace with onPointerDown with HintText and maximum click distance
    let boxOnClick = new OnPointerDown(() => {

      let boxPosition = box.getComponent(Transform).position

      if (currentInHand) {
        currentInHand.getComponent(Transform).position = new Vector3(boxPosition.x, pieceHeight, boxPosition.z)
        currentInHand.setParent(null)
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
  constructor(color: string, name: string) {
    this.color = color
    this.name = name
  }
}

const pieceGroup = engine.getComponentGroup(PieceFlag)

function enableInteractablePiece(interactable: boolean) {

  for (let piece of pieceGroup.entities) {
    let pieceOnClick = new OnPointerDown(() => {
      piece.getComponent(Transform).position = new Vector3(0, 0, 1)
      piece.setParent(Attachable.AVATAR)
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

function spawnPlaceholder(x: number, y: number, z: number) {
  let piece = spawnEntity(piecePlaceholder, new Vector3(x, y, z), new Quaternion(0, 180, 180))
  piece.getComponent(Transform).scale = new Vector3(0.5, 0.5, 1)
  return piece
}

function addPieces() {
  // should use boxGroup or board matrix
  for (let i = 0; i < boxGroup.entities.length; i++) {
    if (i < 16 || i > 47) {
      let box = boxGroup.entities[i]
      let x = box.getComponent(Transform).position.x
      let z = box.getComponent(Transform).position.z

      const piece = spawnPlaceholder(x, pieceHeight, z)
      box.getComponent(BoardCellFlag).vacant = false
      const pieceMaterial = new Material()

      if (i > 47) {
        pieceMaterial.albedoColor = Color3.Black()
        piece.addComponent(new PieceFlag(BLACK, blackPieces[i - 48]))
      } else if (i < 16){
        pieceMaterial.albedoColor = Color3.White()
        piece.addComponent(new PieceFlag(WHITE, whitePieces[i]))
      }

      pieceMaterial.metallic = 0.6
      pieceMaterial.roughness = 0.4
      piece.addComponent(pieceMaterial)
    }
  }
}

makeChessBoard()
addPieces()
enableInteractablePiece(true)