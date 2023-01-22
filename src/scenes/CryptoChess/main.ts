import * as utils from "@dcl/ecs-scene-utils";
import * as ui from "@dcl/ui-scene-utils";
import resources from "resources";
import { VECTOR_OFFSET } from "components/offsets";
import {
  initSound,
  spawnEntity,
  nextValidOutsideWhiteCell,
  nextValidOutsideBlackCell,
} from "components/helpers";
import { whitePieces, blackPieces } from "components/pieces";
import { addBillboard } from "components/billboard";
import { spawnElevators } from "components/elevators";
import { sceneMessageBus } from "components/messageBus";
// import { scaleSystemInit, ScaleUpData } from "components/scaleUpDown"
import { monk } from "./components/NPC/monk"; // initialize on load
import { Like } from "./components/Like/Like";

/* A BoardCellFlag is a flag that indicates whether a board cell is vacant or not, and if not, what
piece is occupying it. */
@Component("boardCellFlag")
export class BoardCellFlag {
  vacant: boolean;
  piece: null | IEntity;
  constructor(vacant: boolean = true, piece: null | IEntity = null) {
    this.vacant = vacant;
    this.piece = piece;
  }
}
/* pieceFlag is a class that holds the information about a piece */
@Component("pieceFlag")
export class PieceFlag {
  color: string;
  name: string;
  number: number;
  active: boolean;
  ousideCell: null | Vector3;
  moved: boolean;
  constructor(
    color: string,
    name: string,
    number: number,
    active: boolean = true,
    outsideCell: null | Vector3 = null,
    moved: boolean = false
  ) {
    this.color = color;
    this.name = name;
    this.number = number;
    this.active = active;
    this.ousideCell = outsideCell;
    this.moved = moved;
  }
}

/* "This class is a component that is used to mark a pawn as a pawn."

The @Component decorator is a function that takes a string as an argument. This string is the name
of the component */
@Component("isPawn")
export class IsPawn {}

/* "Every 30 seconds, the pawns will move up and down in a sine wave pattern."

The first thing to notice is that the class implements the ISystem interface. This is required for
all systems */
let fraction = 0;
export class FloatMove implements ISystem {
  pawnGroup = engine.getComponentGroup(IsPawn);
  update(dt: number) {
    for (let pawn of this.pawnGroup.entities) {
      let transform = pawn.getComponent(Transform);
      fraction += dt / 30; // speed
      const magnitude = 10;
      const height = 0.5;
      transform.position.y = height + Math.sin(Math.PI * fraction) / magnitude;
    }
  }
}

/**
 * CreateCryptoChess is the main function used to
 * create a chess board with pieces that can be moved around.
 */

export function createCryptoChess(): void {
  /* Creating a new Like object. */
  const like = new Like(
    {
      position: new Vector3(14, 0.75, 0.5).add(VECTOR_OFFSET),
      rotation: Quaternion.Euler(0, 0, 0),
    },
    "61b90613dd08def8380ababb"
  );

  /* Adding a component to the monk entity. The component is called OnPointerDown and it is a function
that is called when the player clicks on the monk. The function is an arrow function that calls the
monk's activate function. The arrow function also has a hoverText property that is used to display
text when the player hovers over the monk. */
  monk.addComponent(
    new OnPointerDown(
      () => {
        if (monk.state !== "talking" || !monk.dialog.isDialogOpen)
          monk.activate();
      },
      {
        hoverText: "Talk with RoVi",
      }
    )
  );

  /* Defining two constants, WHITE and BLACK, and assigning them the values "white" and "black"
respectively. */
  const WHITE = "white";
  const BLACK = "black";

  /* Declaring a variable called initPiecePos and assigning it an empty array of Vector3s. */
  let initPiecePos: Vector3[] = [];

  /**
   * `BoxData` is an object with two properties, `vacant` and `piece`, where `vacant` is a boolean and
   * `piece` is either an `IEntity` or `null`.
   *
   * The `initBoxData` variable is an array of `BoxData` objects.
   * @property {boolean} vacant - boolean
   * @property {IEntity|null} piece - The piece that is currently occupying the box.
   */
  type BoxData = {
    vacant: boolean;
    piece: IEntity | null;
  };
  let initBoxData: BoxData[] = [];

  /* Declaring variables. */
  let currentInHand: any = null;
  let prevPos: IEntity | null = null;
  let turn: string = WHITE;

  let moveCounter: number = 0;
  let moveHistory: any[] = [];
  let redoHistory: any[] = [];

  /* Initializing the sounds that will be used in the game. */
  const pickupSound = initSound(resources.pickedupSound);
  const eathenSound = initSound(resources.eatenSound);
  const placedSound = initSound(resources.placedSound);
  const resetSound = initSound(resources.resetSound);
  const background = initSound(resources.backgroundSound);

  /* Setting the loop property of the AudioSource component to true. */
  background.getComponent(AudioSource).loop = true;
  // background.getComponent(AudioSource).playing = true

  /* Creating a new entity and adding a transform component to it. */
  const MusicTrigger = new Entity();
  MusicTrigger.addComponent(new Transform({ position: new Vector3(0, 0, 0) }));
  /* Creating a Music trigger box that is 16x16x16 units in size, and is located at the position (8, 0, 8) */
  let chessMusicTriggerBox = new utils.TriggerBoxShape(
    new Vector3(16, 16, 16),
    new Vector3(8, 0, 8).add(VECTOR_OFFSET)
  );

  /* Creating a trigger component that will play the background music when the camera enters the trigger box. */
  MusicTrigger.addComponent(
    new utils.TriggerComponent(
      chessMusicTriggerBox, //shape
      {
        onCameraEnter: () => {
          background.getComponent(AudioSource).playing = true;
        },
        onCameraExit: () => {
          background.getComponent(AudioSource).playing = false;
        },
      }
    )
  );
  engine.addEntity(MusicTrigger);

  const pieceHeight = 0.1;
  const defaultScale = new Vector3(1, 1, 1);
  // scaleSystemInit()

  /* Adding a billboard to the scene. */
  addBillboard(
    resources.bladerunner540,
    new Transform({
      position: new Vector3(8.07, 3, 15.9).add(VECTOR_OFFSET),
      scale: new Vector3(15.67, 7, 1),
      rotation: Quaternion.Euler(0, 180, 0),
    })
  );

  addBillboard(
    resources.bladerunner3,
    new Transform({
      position: new Vector3(15.9, 3, 8).add(VECTOR_OFFSET),
      scale: new Vector3(15.8, 7, 1),
      rotation: Quaternion.Euler(0, 270, 0),
    })
  );

  /* Creating the board, the ground, the neon interior, the wall, and the tile models. */
  const board = spawnEntity(
    new GLTFShape(resources.numberedBoard),
    new Vector3(8, 0, 8).add(VECTOR_OFFSET),
    defaultScale
  );
  const pol = spawnEntity(
    new GLTFShape(resources.ground),
    new Vector3(8, 0, 8).add(VECTOR_OFFSET),
    defaultScale
  );
  const neonInt = spawnEntity(
    new GLTFShape(resources.neonInterior),
    new Vector3(7.9, 0, 9).add(VECTOR_OFFSET),
    defaultScale,
    new Quaternion(0, 180)
  );
  const wall_left = spawnEntity(
    new GLTFShape(resources.wallLeft),
    new Vector3(0.25, 0, 8).add(VECTOR_OFFSET),
    defaultScale,
    Quaternion.Euler(0, 90, 0)
  );

  const binanceTileModel = new GLTFShape(resources.binancePlane);
  const etheriumTileModel = new GLTFShape(resources.etheriumPlane);

  /**
   * > For each row and column, spawn a tile entity at the appropriate location and add a BoardCellFlag
   * component to it
   */
  function makeChessBoard() {
    let offset = 3.5;
    for (let row = 1; row < 9; row++) {
      for (let col = 1; col < 9; col++) {
        const tileModel =
          (row + col) % 2 == 1 ? binanceTileModel : etheriumTileModel;
        let box = spawnEntity(
          tileModel,
          new Vector3(offset + col, 0.21, offset + row).add(VECTOR_OFFSET),
          defaultScale
        );
        box.getComponent(Transform).rotate(new Vector3(0, 1, 0), 180);
        box.addComponent(new BoardCellFlag());
      }
    }
  }

  /* Getting the component group of all entities that have the BoardCellFlag component. */
  const boxGroup = engine.getComponentGroup(BoardCellFlag);

  /**
   * placePiece places the held board piece to the board cell, updates the history, and enables/disables
   * interactable objects.
   * @param {IEntity} box - IEntity - the box we're placing the piece on
   * @param {boolean} [castling=false] - boolean = false - if we are castling, we need to revert two
   * moves
   */
  function placePiece(box: IEntity, castling: boolean = false) {
    let boxPosition = box.getComponent(Transform).position;
    if (currentInHand) {
      currentInHand.getComponent(Transform).position = new Vector3(
        boxPosition.x,
        pieceHeight,
        boxPosition.z
      );
      currentInHand.setParent(null);

      currentInHand.getComponent(GLTFShape).isPointerBlocker = true;

      /* Saving the move to the history to place the piece back to the same cell and avoid losing a turn */
      if (prevPos != box) {
        turn =
          currentInHand.getComponent(PieceFlag).color == WHITE ? BLACK : WHITE;
        redoHistory = [];
        moveHistory[moveCounter] = {
          id: currentInHand.uuid,
          prevPos: prevPos?.uuid,
          newPos: box.uuid,
          pieceTaken: box.getComponent(BoardCellFlag).piece
            ? box.getComponent(BoardCellFlag).piece?.uuid
            : null, // we taken piece, so revert two moves
          firstMove: currentInHand.getComponent(PieceFlag).moved ? false : true, // if it was moved for a first time revert moved to false
          castling: castling, // if so, undo twice
        };
        currentInHand.getComponent(PieceFlag).moved = true;
        moveCounter++;
      }
      prevPos = null;

      /* Setting the vacant flag to false and setting the piece to the currentInHand. */
      box.getComponent(BoardCellFlag).vacant = false;
      box.getComponent(BoardCellFlag).piece = currentInHand;
      currentInHand = null;
    }

    /* Enabling the interactable piece. */
    enableInteractableBox(false);
    enableInteractableEnemy(false);
    enableInteractablePiece(true);
  }

  /**
   * > If the box is interactable, add an OnPointerDown component to it
   * @param {boolean} interactable - boolean - This is a boolean that determines whether the box is
   * interactable or not.
   */
  function enableInteractableBox(interactable: boolean) {
    /* Adding an OnPointerDown component to each box in the boxGroup.entities array. */
    for (let box of boxGroup.entities) {
      if (interactable && box.getComponent(BoardCellFlag).vacant) {
        let boxOnClick = new OnPointerDown(
          () => {
            placedSound.getComponent(AudioSource).playOnce();

            sceneMessageBus.emit("placePiece", {
              puuid: prevPos!.uuid,
              buuid: box.uuid,
              currentInHand: currentInHand?.uuid,
            });
          },
          {
            hoverText: "Place the piece",
            distance: 16,
          }
        );

        box.addComponent(boxOnClick);
      } else {
        if (box.hasComponent(OnPointerDown)) box.removeComponent(OnPointerDown);
      }
    }
  }

  /* The code below is listening for a message on the sceneMessageBus. When it receives the message, it
will filter the boxGroup for the box with the uuid that was sent in the message. It will then call
the placePiece function with the box that was found. */
  sceneMessageBus.on("placePiece", (info: any) => {
    const newBox = boxGroup.entities.filter((box) => {
      return box.uuid == info.buuid;
    })[0];
    placePiece(newBox);
  });

  /* Getting the component group of all entities with the PieceFlag component. */
  const pieceGroup = engine.getComponentGroup(PieceFlag);

  /**
   * If the piece is interactable, is the same color as the current turn, and is active, then add an
   * OnPointerDown component to the piece
   * @param {boolean} interactable - boolean - This is the boolean that determines whether the piece is
   * interactable or not.
   */
  function enableInteractablePiece(interactable: boolean) {
    for (let piece of pieceGroup.entities) {
      if (
        interactable &&
        piece.getComponent(PieceFlag).color == turn &&
        piece.getComponent(PieceFlag).active == true
      ) {
        /* The above code is a function that is called when the player clicks on a piece. It plays a sound,
sets the piece to be in the player's hand, and sets the piece's previous position to be vacant. */
        let pieceOnClick = new OnPointerDown(
          () => {
            pickupSound.getComponent(AudioSource).playOnce();

            piece.getComponent(Transform).position = new Vector3(0, 0, 1);
            piece.setParent(Attachable.AVATAR);

            piece.getComponent(GLTFShape).isPointerBlocker = false;

            currentInHand = piece;

            sceneMessageBus.emit("pickupPiece", {
              currentInHand: currentInHand.uuid,
            });

            for (let box of boxGroup.entities) {
              if (box.getComponent(BoardCellFlag).piece) {
                if (box.getComponent(BoardCellFlag).piece! === piece) {
                  box.getComponent(BoardCellFlag).vacant = true;
                  prevPos = box;
                  box.getComponent(BoardCellFlag).piece = null;
                }
              }
            }

            enableInteractablePiece(false);
            enableInteractableEnemy(true);
            enableInteractableBox(true);
          },
          {
            hoverText: "Pick the " + piece.getComponent(PieceFlag).name,
            distance: 16,
          }
        );

        piece.addComponent(pieceOnClick);
      } else {
        if (piece.hasComponent(OnPointerDown))
          piece.removeComponent(OnPointerDown);
      }
    }
  }
  /* The above code is listening for the "pickupPiece" message. When the message is received, the code
disables the interactable piece, sets the currentInHand variable to the piece that was picked up,
and then sets the previous position of the piece to the box that it was on. */
  sceneMessageBus.on("pickupPiece", (info) => {
    enableInteractablePiece(false);
    currentInHand = pieceGroup.entities.filter((piece) => {
      return piece.uuid == info.currentInHand;
    })[0];
    for (let box of boxGroup.entities) {
      if (box.getComponent(BoardCellFlag).piece) {
        if (box.getComponent(BoardCellFlag).piece! === currentInHand) {
          box.getComponent(BoardCellFlag).vacant = true;
          prevPos = box;
          box.getComponent(BoardCellFlag).piece = null;
        }
      }
    }
  });

  // and to castle the king
  /**
   * It enables the interactable enemy pieces when the player is in the "takePiece" state
   * @param {boolean} interactable - boolean - if true, the enemy pieces will be interactable
   */
  function enableInteractableEnemy(interactable: boolean) {
    /* Iterating through the entities in the pieceGroup. */
    for (let piece of pieceGroup.entities) {
      /* Checking if the piece is interactable, if the piece is not the same color as the turn,
            and if the piece is active. */
      if (
        interactable &&
        piece.getComponent(PieceFlag).color != turn &&
        piece.getComponent(PieceFlag).active == true
      ) {
        /* A function that is called when a piece is clicked. */
        let pieceOnClick = new OnPointerDown(
          () => {
            /* Finding the box that has the piece that was clicked on. */
            const box = boxGroup.entities.filter((box) => {
              return box.getComponent(BoardCellFlag).piece! == piece;
            })[0];
            eathenSound.getComponent(AudioSource).playOnce();

            /* Emitting a message to the scene message bus. */
            sceneMessageBus.emit("takePiece", {
              pieceId: piece.uuid,
              boxId: box.uuid,
              prevPos: prevPos?.uuid,
              currentInHand: currentInHand?.uuid,
            });

            /* Calling the placePiece function and passing in the box variable. */
            placePiece(box);
          },
          {
            /* Creating a hover text which prompts the taking of the specific piece. */
            hoverText: "Take the enemy " + piece.getComponent(PieceFlag).name,
            distance: 16,
          }
        );

        /* Adding the pieceOnClick OnPointerDown component to the piece. */
        piece.addComponent(pieceOnClick);
      } else if (
        /* Checking if the piece is interactable, if the piece is the same color as the turn, if
            the piece is active, if the piece is a rook, if the rook hasn't moved, if the piece in
            hand is a king, and if the king hasn't moved. */
        // for castle the king
        interactable &&
        piece.getComponent(PieceFlag).color == turn && // same color
        piece.getComponent(PieceFlag).active == true &&
        piece.getComponent(PieceFlag).name === "Rook" && // to make rooks interactable
        !piece.getComponent(PieceFlag).moved && // Rook wasn't moved
        currentInHand.getComponent(PieceFlag).name === "King" && // King in hand
        !currentInHand.getComponent(PieceFlag).moved // king wasn't moved
      ) {



        /* Checking if the king can castle.*/
        if (turn == WHITE) {
          // if ethereum turn
          if (
            // if left rook

            /* Checking if the piece is the first piece in the pieceGroup and if the next
                       three cells are vacant. */
            pieceGroup.entities.indexOf(piece) == 0 &&
            boxGroup.entities[1].getComponent(BoardCellFlag).vacant == true &&
            boxGroup.entities[2].getComponent(BoardCellFlag).vacant == true &&
            boxGroup.entities[3].getComponent(BoardCellFlag).vacant == true
          ) {
            const rookClick = new OnPointerDown(
              () => {
                sceneMessageBus.emit("castleTheKing", { rookID: piece.uuid });
              },
              {
                hoverText: "Castle the king",
                distance: 16,
              }
            );
            piece.addComponent(rookClick);
          } else if (
            // if right rook
            pieceGroup.entities.indexOf(piece) == 7 &&
            boxGroup.entities[5].getComponent(BoardCellFlag).vacant == true &&
            boxGroup.entities[6].getComponent(BoardCellFlag).vacant == true
          ) {
            const rookClick = new OnPointerDown(
              () => {
                sceneMessageBus.emit("castleTheKing", { rookID: piece.uuid });
              },
              {
                hoverText: "Castle the king",
                distance: 16,
              }
            );
            piece.addComponent(rookClick);
          }
        } 
        
        /* Checking if the rook is in the correct position to castle the king. */
        else {
          // if binance turn
          if (
            // if left rook
            pieceGroup.entities.indexOf(piece) == 24 &&
            boxGroup.entities[57].getComponent(BoardCellFlag).vacant == true &&
            boxGroup.entities[58].getComponent(BoardCellFlag).vacant == true &&
            boxGroup.entities[59].getComponent(BoardCellFlag).vacant == true
          ) {
            const rookClick = new OnPointerDown(
              () => {
                sceneMessageBus.emit("castleTheKing", { rookID: piece.uuid });
              },
              {
                hoverText: "Castle the king",
                distance: 16,
              }
            );

            piece.addComponent(rookClick);
          } else if (
            // if right rook
            pieceGroup.entities.indexOf(piece) == 31 &&
            boxGroup.entities[61].getComponent(BoardCellFlag).vacant == true &&
            boxGroup.entities[62].getComponent(BoardCellFlag).vacant == true
          ) {
            const rookClick = new OnPointerDown(
              () => {
                sceneMessageBus.emit("castleTheKing", { rookID: piece.uuid });
              },
              {
                hoverText: "Castle the king",
                distance: 16,
              }
            );

            piece.addComponent(rookClick);
          }
        }
      } else {
        if (piece.hasComponent(OnPointerDown))
          piece.removeComponent(OnPointerDown);
      }
    }
  }

  /* Listening for a message from the server. When it receives the message, it calls the castleTheKing
  function. */
  sceneMessageBus.on("castleTheKing", (info) => {
    const rook = pieceGroup.entities.filter((p) => {
      return p.uuid === info.rookID;
    })[0];
    castleTheKing(rook);
  });

/**
 * If the rook is in one of the four corners, move it to the other side of the king
 * @param {IEntity} rook - The rook that is being castled
 */
  function castleTheKing(rook: IEntity) {
    switch (pieceGroup.entities.indexOf(rook)) {
      case 0: {
        castleMove(rook, 3, 0, 2);
        break;
      }
      case 7: {
        castleMove(rook, 5, 7, 6);
        break;
      }
      case 24: {
        castleMove(rook, 59, 56, 58);
        break;
      }
      case 31: {
        castleMove(rook, 61, 63, 62);
        break;
      }
      default: {
        log("Nothing to castle");
        break;
      }
    }
  }


/**
 * It moves the rook to the new position, updates the board cell flags, and saves the move to the
 * history
 * @param {IEntity} rook - IEntity - the rook that is being moved
 * @param {number} newRookBoxIndex - the new box index of the rook
 * @param {number} oldRookBoxIndex - the index of the box where the rook was before the castling
 * @param {number} newKingBoxIndex - the index of the box where the king will be placed
 */
  // TODO: add move to undo history
  function castleMove(
    rook: IEntity,
    newRookBoxIndex: number,
    oldRookBoxIndex: number,
    newKingBoxIndex: number
  ) {
    placedSound.getComponent(AudioSource).playOnce();
    //  move rook
    const b =
      boxGroup.entities[newRookBoxIndex].getComponent(Transform).position;
    rook.getComponent(Transform).position = new Vector3(b.x, pieceHeight, b.z);
    rook.getComponent(PieceFlag).moved = false;
    boxGroup.entities[oldRookBoxIndex].getComponent(BoardCellFlag).vacant =
      true;
    boxGroup.entities[oldRookBoxIndex].getComponent(BoardCellFlag).piece = null;
    boxGroup.entities[newRookBoxIndex].getComponent(BoardCellFlag).vacant =
      false;
    boxGroup.entities[newRookBoxIndex].getComponent(BoardCellFlag).piece = rook;

    // save to history
    moveHistory[moveCounter] = {
      id: rook.uuid,
      prevPos: boxGroup.entities[oldRookBoxIndex].uuid,
      newPos: boxGroup.entities[newRookBoxIndex].uuid,
      pieceTaken: null, // no piece taken in castling
      firstMove: true, // castling possible only on the first move
      castling: true, // if so, undo twice
    };
    moveCounter++;

    // move king
    placePiece(boxGroup.entities[newKingBoxIndex], true);
  }



/* The above code is listening for the "takePiece" message. When it receives the message, it will find
the piece and box that are involved in the take. It will then move the piece to the outside of the
board. It will then place the piece on the box. */
  sceneMessageBus.on("takePiece", (info) => {
    const newBox = boxGroup.entities.filter((box) => {
      return box.uuid == info.boxId;
    })[0];
    const piece = pieceGroup.entities.filter((piece) => {
      return piece.uuid == info.pieceId;
    })[0];

    // piece.addComponent(new ScaleDownData())

    if (piece.getComponent(PieceFlag).color == WHITE) {
      piece.getComponent(Transform).position = piece.getComponent(PieceFlag)
        .ousideCell
        ? piece.getComponent(PieceFlag).ousideCell!
        : nextValidOutsideWhiteCell();
    } else {
      piece.getComponent(Transform).position = piece.getComponent(PieceFlag)
        .ousideCell
        ? piece.getComponent(PieceFlag).ousideCell!
        : nextValidOutsideBlackCell();
    }
    // disable piece
    piece.getComponent(PieceFlag).active = false;
    piece.getComponent(PieceFlag).ousideCell =
      piece.getComponent(Transform).position;

    placePiece(newBox);
  });



/**
 * Adds pieces to the board
 */
  function addPieces() {
    for (let i = 0; i < boxGroup.entities.length; i++) {
      if (i < 16 || i > 47) {
        let box = boxGroup.entities[i];
        let x = box.getComponent(Transform).position.x;
        let z = box.getComponent(Transform).position.z;

        let piece: null | IEntity = null;
        box.getComponent(BoardCellFlag).vacant = false;

        // might need to offset some figures
        const pos = new Vector3(x, pieceHeight, z);

        /* Spawning a black piece. */
        if (i > 47) {
          let tempPiece = blackPieces[i - 48];
          piece = spawnEntity(
            tempPiece.model,
            pos,
            defaultScale,
            new Quaternion(0, 180)
          );
          piece.addComponent(
            new PieceFlag(BLACK, tempPiece.name, tempPiece.number)
          );
          if (tempPiece.name == "Pawn") piece.addComponent(new IsPawn());
        } 
        
    /* Spawning the pieces and adding the components to them. */
        else if (i < 16) {
          piece = spawnEntity(whitePieces[i].model, pos, defaultScale);
          piece.addComponent(
            new PieceFlag(WHITE, whitePieces[i].name, whitePieces[i].number)
          );
          if (whitePieces[i].name == "Pawn") piece.addComponent(new IsPawn());
        }

        // if (piece) {
        //     piece!.addComponent(new ScaleUpData())
        // }

        box.getComponent(BoardCellFlag).piece = piece;
      }
    }
  }

  // make pawns float
  const pawnGroup = engine.getComponentGroup(IsPawn);

  engine.addSystem(new FloatMove());

  spawnElevators();

  // undo / redo
  const redoButton = spawnEntity(
    new GLTFShape(resources.buttonUndoRedo),
    new Vector3(2.5, 0, 8.5).add(VECTOR_OFFSET),
    defaultScale,
    Quaternion.Euler(0, 180, 0)
  );
  const undoButton = spawnEntity(
    new GLTFShape(resources.buttonUndoRedo),
    new Vector3(2.5, 0, 8).add(VECTOR_OFFSET),
    defaultScale
  );
  const restartButton = spawnEntity(
    new GLTFShape(resources.buttonRestart),
    new Vector3(2.5, 0, 7).add(VECTOR_OFFSET),
    defaultScale
  );

/* Adding an OnPointerDown component to the undoButton entity. This component will listen for a pointer
down event (i.e. when the user clicks on the button) and then emit a message on the sceneMessageBus. */
  undoButton.addComponent(
    new OnPointerDown(
      () => {
        if (moveHistory.length) {
          sceneMessageBus.emit("undoButton", {});
        }
      },
      {
        hoverText: "Undo move",
      }
    )
  );

/* The above code is listening for the undoButton event. When the event is triggered, the code will pop
the last move from the moveHistory array and revert the move. If the move was a castling move, the
code will pop the second move from the moveHistory array and revert that move as well. */
  sceneMessageBus.on("undoButton", () => {
    resetSound.getComponent(AudioSource).playOnce();
    let last = moveHistory.pop();
    revertMove(last.id, last.prevPos, last.newPos, last.firstMove);
    if (last.pieceTaken) {
      revertTaken(last.pieceTaken, last.newPos);
    }
    redoHistory.push(last);

    if (last.castling) {
      last = moveHistory.pop();
      revertMove(last.id, last.prevPos, last.newPos, last.firstMove);
      redoHistory.push(last);
    }
  });

/* Adding an OnPointerDown component to the redoButton entity. */
  redoButton.addComponent(
    new OnPointerDown(
      () => {
        if (redoHistory.length) {
          sceneMessageBus.emit("redoButton", {});
        }
      },
      {
        hoverText: "Redo move",
      }
    )
  );

/* The above code is listening for the redoButton event. When the event is triggered, the code will pop
the last move from the redoHistory array and revert the move. If the move was a castling move, the
code will pop the second move from the redoHistory array and revert the move. */
  sceneMessageBus.on("redoButton", () => {
    resetSound.getComponent(AudioSource).playOnce();
    let last = redoHistory.pop();
    revertMove(last.id, last.newPos, last.prevPos, last.firstMove, true);
    if (last.pieceTaken) {
      revertToOutside(last.pieceTaken);
    }
    moveHistory.push(last);

    if (last.castling) {
      last = redoHistory.pop();
      revertMove(last.id, last.newPos, last.prevPos, last.firstMove, true);
      moveHistory.push(last);
    }
  });

/**
 * It takes a piece, a box it moved to, a box it moved from, and a boolean value that indicates if it's
 * the first move of the piece, and it reverts the move
 * @param {string} pieceId - the id of the piece that was moved
 * @param {string} revertToId - the box that the piece was moved to
 * @param {string} revertFromId - the box the piece was moved from
 * @param {boolean} firstMove - boolean - if the piece is moved for the first time, it's a special case
 * for pawns
 * @param {boolean} [redo=false] - boolean = false
 */
  function revertMove(
    pieceId: string,
    revertToId: string,
    revertFromId: string,
    firstMove: boolean,
    redo: boolean = false
  ) {
    const piece = pieceGroup.entities.filter((piece) => {
      return piece.uuid == pieceId;
    })[0];
    // move made from
    const revertTo = boxGroup.entities.filter((box) => {
      return box.uuid == revertToId;
    })[0];
    // move made to
    const revertFrom = boxGroup.entities.filter((box) => {
      return box.uuid == revertFromId;
    })[0];
    // so to revert move to the opposite direction

    // manualy update piece position, box vacation, turn
    const p = revertTo.getComponent(Transform).position;
    piece.getComponent(Transform).position = new Vector3(p.x, pieceHeight, p.z);
    revertTo.getComponent(BoardCellFlag).piece = piece;
    revertTo.getComponent(BoardCellFlag).vacant = false;
    revertFrom.getComponent(BoardCellFlag).piece = null;
    revertFrom.getComponent(BoardCellFlag).vacant = true;

    if (redo) {
      turn = piece.getComponent(PieceFlag).color == WHITE ? BLACK : WHITE;
      piece.getComponent(PieceFlag).moved = true;
    } else {
      turn = piece.getComponent(PieceFlag).color;
      if (firstMove) piece.getComponent(PieceFlag).moved = false;
    }

    enableInteractablePiece(false);
    enableInteractablePiece(true);
  }

/**
 * It takes a piece and a board cell, and puts the piece back on the board cell
 * @param {string} pieceId - The id of the piece to revert.
 * @param {string} revertToId - The id of the box that the piece should be reverted to.
 */
  function revertTaken(pieceId: string, revertToId: string) {
    const piece = pieceGroup.entities.filter((piece) => {
      return piece.uuid == pieceId;
    })[0];
    const revertTo = boxGroup.entities.filter((box) => {
      return box.uuid == revertToId;
    })[0];

    const p = revertTo.getComponent(Transform).position;
    piece.getComponent(Transform).position = new Vector3(p.x, pieceHeight, p.z);
    piece.getComponent(PieceFlag).active = true;

    revertTo.getComponent(BoardCellFlag).piece = piece;
    revertTo.getComponent(BoardCellFlag).vacant = false;
  }


/**
 * It takes a piece's id, finds the piece, and moves it back to its original position
 * @param {string} pieceId - the id of the piece to be reverted
 */
  function revertToOutside(pieceId: string) {
    const piece = pieceGroup.entities.filter((piece) => {
      return piece.uuid == pieceId;
    })[0];
    piece.getComponent(Transform).position =
      piece.getComponent(PieceFlag).ousideCell!;
    piece.getComponent(PieceFlag).active = false;
  }

  // Reset game

  /* Adding a component to the restartButton entity. The component is an OnPointerDown component. The
  OnPointerDown component is a component that listens for a pointer down event. When the pointer
  down event is triggered, it will execute the code in the first parameter. The first parameter is a
  function that will create a new OptionPrompt. The OptionPrompt is a prompt that will ask the user
  if they want to reset the board. If the user clicks the "Reset" button, it will emit a message to
  the sceneMessageBus. The message will be "reset" */
  restartButton.addComponent(
    new OnPointerDown(
      (e) => {
        let prompt = new ui.OptionPrompt(
          "Reset the Board?",
          "Are you sure you want to reset the Board? This cannot be undone!",
          () => {
            log(`No Reset`);
          },
          () => {
            sceneMessageBus.emit("reset", {});
          },
          "No",
          "Reset"
        );
      },
      {
        hoverText: "Reset the board",
      }
    )
  );

/**
 * This resets the game
 */
  function reset() {
    resetSound.getComponent(AudioSource).playOnce();

    moveHistory = [];
    redoHistory = [];

    for (const i in initPiecePos) {
      let k = Number(i);
      pieceGroup.entities[k].setParent(null);

      pieceGroup.entities[k].getComponent(Transform).position = initPiecePos[k];
      pieceGroup.entities[k].getComponent(PieceFlag).active = true;
      pieceGroup.entities[k].getComponent(PieceFlag).moved = false;
      pieceGroup.entities[k].getComponent(PieceFlag).ousideCell = null;
    }

    for (const i in boxGroup.entities) {
      let k = Number(i);

      boxGroup.entities[k].getComponent(BoardCellFlag).vacant =
        initBoxData[k].vacant;
      boxGroup.entities[k].getComponent(BoardCellFlag).piece =
        initBoxData[k].piece;
    }

    turn = WHITE;
    currentInHand = null;

    enableInteractableBox(false);
    enableInteractableEnemy(false);
    enableInteractablePiece(true);
  }

 /* Listening for the reset event and calling the reset function when it is triggered. */
  sceneMessageBus.on("reset", () => {
    reset();
  });

/**
 * It initializes the board
 */
  function initBoard(): void {
    turn = WHITE;
    currentInHand = null;
    makeChessBoard();
    addPieces();
    enableInteractablePiece(true);

    for (const piece of pieceGroup.entities) {
      initPiecePos!.push(piece.getComponent(Transform).position);
    }

    for (const box of boxGroup.entities) {
      initBoxData.push({
        vacant: box.getComponent(BoardCellFlag).vacant,
        piece: box.getComponent(BoardCellFlag).piece,
      });
    }
  }

/* Creates a new board. */
  initBoard();
}
