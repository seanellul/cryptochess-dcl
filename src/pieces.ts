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
export const whitePieces = [whitePiece.Rook, whitePiece.Knight, whitePiece.Bishop, whitePiece.Queen, whitePiece.King, whitePiece.Bishop, whitePiece.Knight, whitePiece.Rook, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn]
export const blackPieces = [blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Rook, blackPiece.Knight, blackPiece.Bishop, blackPiece.Queen, blackPiece.King, blackPiece.Bishop, blackPiece.Knight, blackPiece.Rook]
