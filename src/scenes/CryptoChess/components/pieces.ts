import resources from "../resources"

/* It's a class that contains all the white pieces */
class WhitePiece {
    public King = { number: 1, name: "King", model: new GLTFShape(resources.etheriumKing) }
    public Pawn = { number: 2, name: "Pawn", model: new GLTFShape(resources.etheriumPawn) }
    public Knight = { number: 3, name: "Knight", model: new GLTFShape(resources.etheriumHorse) }
    public Bishop = { number: 4, name: "Bishop", model: new GLTFShape(resources.etheriumSlon) }
    public Rook = { number: 5, name: "Rook", model: new GLTFShape(resources.etheriumRook) }
    public Queen = { number: 6, name: "Queen", model: new GLTFShape(resources.etheriumQueen) }
}
/* It's a class that contains all the black pieces */
class BlackPiece {
    public King = { number: 1, name: "King", model: new GLTFShape(resources.binanceKing) }
    public Pawn = { number: 2, name: "Pawn", model: new GLTFShape(resources.binancePawn) }
    public Knight = { number: 3, name: "Knight", model: new GLTFShape(resources.binanceHorse) }
    public Bishop = { number: 4, name: "Bishop", model: new GLTFShape(resources.binanceSlon) }
    public Rook = { number: 5, name: "Rook", model: new GLTFShape(resources.binanceRook) }
    public Queen = { number: 6, name: "Queen", model: new GLTFShape(resources.binanceQueen) }
}

const whitePiece = new WhitePiece()
const blackPiece = new BlackPiece()
/* It's an array of all the white & black pieces. */
export const whitePieces = [whitePiece.Rook, whitePiece.Knight, whitePiece.Bishop, whitePiece.Queen, whitePiece.King, whitePiece.Bishop, whitePiece.Knight, whitePiece.Rook, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn]
export const blackPieces = [blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Rook, blackPiece.Knight, blackPiece.Bishop, blackPiece.Queen, blackPiece.King, blackPiece.Bishop, blackPiece.Knight, blackPiece.Rook]
