import GameGraphics from './game.graphics.js';

export default class GameMinimax extends GameGraphics {
  constructor(depth, isMaximizingBlack) {
    super();

    this.depth = depth;
    this.isMaximizingBlack = isMaximizingBlack;
    this.minimaxTurn = isMaximizingBlack ? this.STATE.BLACK_TURN : this.STATE.WHITE_TURN;

    // Minimaxs play first
    if (isMaximizingBlack) {
      // Block humain from playing while minimax is playing
      GameGraphics.cleanPreviousLegalMoves();

      this.minimaxPlay();
    }
  }

  minimaxPlay() {
    const gameClone = this.clone();
    const { depth } = this;
    const { isMaximizingBlack } = this;

    // Run minimax in a worker to avoid blocking
    const worker = new Worker('src/minimax.worker.js', { type: 'module' });

    worker.postMessage({
      gameClone,
      depth,
      isMaximizingBlack,
    });

    worker.onmessage = (event) => {
      const evals = event.data;

      // Play best move
      // https://stackoverflow.com/a/50723439/11060940
      const best = Object.entries(evals).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
      this.placePiece(best);

      // Check skip problem to avoid color switching or double color play
      if (this.state === this.minimaxTurn) {
        // Block humain from playing while minimax is playing
        GameMinimax.cleanPreviousLegalMoves();
        this.minimaxPlay();
      }
    };
  }

  // Override to allow minimax play
  mouseAction(move) {
    this.placePiece(move);

    // Ensure minimax plays only on its turn
    if (this.state === this.minimaxTurn) {
      // Block humain from playing while minimax is playing
      GameMinimax.cleanPreviousLegalMoves();
      this.minimaxPlay();
    }
  }
}
