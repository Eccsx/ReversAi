import Game from './game.js';

export default class StaticEvaluation {
  static coinParity(game, isMaximizingBlack) {
    const blackCoins = game.blackPiecesCount;
    const whiteCoins = game.whitePiecesCount;

    // Score
    const maxPlayerCoins = isMaximizingBlack ? blackCoins : whiteCoins;
    const minPlayerCoins = isMaximizingBlack ? whiteCoins : blackCoins;

    return 100 * ((maxPlayerCoins - minPlayerCoins) / (maxPlayerCoins + minPlayerCoins));
  }

  static coinActualMobility(game, isMaximizingBlack) {
    // Count black legal moves
    game.updateSandwiches(game.BLACK_PIECE.value);
    const blackMobility = game.sandwiches.length;

    // Count white legal moves
    game.updateSandwiches(game.WHITE_PIECE.value);
    const whiteMobility = game.sandwiches.length;

    // Score
    const maxPlayerMobility = isMaximizingBlack ? blackMobility : whiteMobility;
    const minPlayerMobility = isMaximizingBlack ? whiteMobility : blackMobility;

    if ((maxPlayerMobility + minPlayerMobility) !== 0) {
      return 100
      * ((maxPlayerMobility - minPlayerMobility) / (maxPlayerMobility + minPlayerMobility));
    }

    return 0;
  }

  static coinPotentialMobility(game, isMaximizingBlack) {
    // Count empty space surrounding black coin
    const blackCells = game.getAllBlackCell();

    let emptyBlack = new Set();
    blackCells.forEach((cell) => {
      emptyBlack = new Set([...emptyBlack, ...game.getCellEmptyNeighbors(cell)]);
    });

    const whiteMobility = emptyBlack.size;

    // Count empty space surrounding white coin
    const whiteCells = game.getAllWhiteCell();

    let emptyWhite = new Set();
    whiteCells.forEach((cell) => {
      emptyWhite = new Set([...emptyWhite, ...game.getCellEmptyNeighbors(cell)]);
    });

    const blackMobility = emptyWhite.size;

    // Score
    const maxPlayerMobility = isMaximizingBlack ? blackMobility : whiteMobility;
    const minPlayerMobility = isMaximizingBlack ? whiteMobility : blackMobility;

    if ((maxPlayerMobility + minPlayerMobility) !== 0) {
      return 100
      * ((maxPlayerMobility - minPlayerMobility) / (maxPlayerMobility + minPlayerMobility));
    }

    return 0;
  }

  static cornersCaptured(game, isMaximizingBlack) {
    const blackCornerCount = game.getNumberPieceInCorner(game.BLACK_PIECE.value);
    const whiteCornerCount = game.getNumberPieceInCorner(game.WHITE_PIECE.value);

    // Score
    const maxPlayerCornerValue = isMaximizingBlack ? blackCornerCount : whiteCornerCount;
    const minPlayerCornerValue = isMaximizingBlack ? whiteCornerCount : blackCornerCount;

    if ((maxPlayerCornerValue + minPlayerCornerValue) !== 0) {
      return 100
      * ((maxPlayerCornerValue - minPlayerCornerValue)
      / (maxPlayerCornerValue + minPlayerCornerValue));
    }

    return 0;
  }

  static staticWeights(game, isMaximizingBlack) {
    // Weights
    const weights = [
      [4, -3, 2, 2, 2, 2, -3, 4],
      [-3, -4, -1, -1, -1, -1, -4, -3],
      [2, -1, 1, 0, 0, 1, -1, 2],
      [2, -1, 0, 1, 1, 0, -1, 2],
      [2, -1, 0, 1, 1, 0, -1, 2],
      [2, -1, 1, 0, 0, 1, -1, 2],
      [-3, -4, -1, -1, -1, -1, -4, -3],
      [4, -3, 2, 2, 2, 2, -3, 4],
    ];

    // Black weights
    const blackCells = game.getAllBlackCell();
    let blackValue = 0;

    blackCells.forEach((cell) => {
      const [row, col] = Game.cellToIndex(cell);
      blackValue += weights[row][col];
    });

    // White weights
    const whiteCells = game.getAllWhiteCell();
    let whiteValue = 0;

    whiteCells.forEach((cell) => {
      const [row, col] = Game.cellToIndex(cell);
      whiteValue += weights[row][col];
    });

    // Score
    const maxPlayerUtility = isMaximizingBlack ? blackValue : whiteValue;
    const minPlayerUtility = isMaximizingBlack ? whiteValue : blackValue;

    return maxPlayerUtility - minPlayerUtility;
  }

  static staticEvaluation(game, isMaximizingBlack) {
    return this.coinParity(game, isMaximizingBlack)
      + this.coinActualMobility(game, isMaximizingBlack)
      + this.coinPotentialMobility(game, isMaximizingBlack)
      + this.cornersCaptured(game, isMaximizingBlack)
      + this.staticWeights(game, isMaximizingBlack);
  }
}
