

const WHITE = "white"
const BLACK = "black"

let currentInHand: any = null
let turn: string = WHITE


function initSound(path: string) {
  const entity =  new Entity()
  engine.addEntity(entity)
  entity.addComponent(
    new AudioSource(new AudioClip(path))
  )
  entity.getComponentOrCreate(Transform).position = new Vector3(8,0,8)
  return entity
}

// // sounds
const pickupSound = initSound("sounds/pickedup.mp3")
const placedSound = initSound("sounds/placed.mp3")

const whitePieces = ["Rook", "Knight", "Bishop", "Queen", "King", "Bishop", "Knight", "Rook", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn"]
const blackPieces = ["Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Rook", "Knight", "Bishop", "Queen", "King", "Bishop", "Knight", "Rook"]
//  initialize board matrix
let boardMatrix: Entity[][]     // not used so far

const pieceHeight = 0.5

const piecePlaceholder = new BoxShape()

function spawnEntity(shape: Shape, position: Vector3, rotation?: Quaternion) {
  const entity = new Entity()

  entity.addComponent(new Transform({ position: position, rotation }))
  entity.addComponent(shape)
  engine.addEntity(entity)

  return entity
}


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
     

      const tileModel = ((row + col) % 2 == 1) ? new GLTFShape("models/Tile_yellow.glb") : new GLTFShape("models/Tile_purple.glb")

      let box = spawnEntity(tileModel, new Vector3(offset + col, 0.2, offset + row))
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
  constructor(color: string, name: string) {
    this.color = color
    this.name = name
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

      // const piece = spawnPlaceholder(x, pieceHeight, z)
      box.getComponent(BoardCellFlag).vacant = false
      const pieceMaterial = new Material()

      if (i > 47) {
        const piece = spawnEntity(new GLTFShape('models/Etherum.glb'), new Vector3(x, pieceHeight, z))
        pieceMaterial.albedoColor = Color3.Black()
        piece.addComponent(new PieceFlag(BLACK, blackPieces[i - 48]))
      } else if (i < 16){
        const piece = spawnEntity(new GLTFShape('models/Binance.glb'), new Vector3(x, pieceHeight, z))
        pieceMaterial.albedoColor = Color3.White()
        piece.addComponent(new PieceFlag(WHITE, whitePieces[i]))
      }

    }
  }
}

makeChessBoard()
addPieces()
enableInteractablePiece(true)