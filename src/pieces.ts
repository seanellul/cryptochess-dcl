class WhitePiece {
    public King = {number: 1, name: "King", model: new GLTFShape("models/Etherium_King.glb")}
    public Pawn = {number: 2, name: "Pawn", model: new GLTFShape("models/Etherum.glb")}
    public Knight = {number: 3, name: "Knight", model: new GLTFShape("models/Etherium_Horse.glb")}
    public Bishop = {number: 4, name: "Bishop", model: new GLTFShape("models/Etherium_Slon.glb")}
    public Rook = {number: 5, name: "Rook", model: new GLTFShape("models/Etherium_Rook.glb")}
    public Queen = {number: 6, name: "Queen", model: new GLTFShape("models/Etherium_Queen.glb")}
}
class BlackPiece {
    public King = {number: 1, name: "King", model: new GLTFShape("models/Binance_King.glb")}
    public Pawn = {number: 2, name: "Pawn", model: new GLTFShape("models/Binance.glb")}
    public Knight = {number: 3, name: "Knight", model: new GLTFShape("models/Binance_Horse.glb")}
    public Bishop = {number: 4, name: "Bishop", model: new GLTFShape("models/Binance_Slon.glb")}
    public Rook = {number: 5, name: "Rook", model: new GLTFShape("models/Binance_Rook.glb")}
    public Queen = {number: 6, name: "Queen", model: new GLTFShape("models/Binance_Queen.glb")}
}

const whitePiece = new WhitePiece()
const blackPiece = new BlackPiece()
export const whitePieces = [whitePiece.Rook, whitePiece.Knight, whitePiece.Bishop, whitePiece.Queen, whitePiece.King, whitePiece.Bishop, whitePiece.Knight, whitePiece.Rook, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn, whitePiece.Pawn]
export const blackPieces = [blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Pawn, blackPiece.Rook, blackPiece.Knight, blackPiece.Bishop, blackPiece.Queen, blackPiece.King, blackPiece.Bishop, blackPiece.Knight, blackPiece.Rook]
