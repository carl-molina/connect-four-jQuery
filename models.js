"use strict";

const $startGame = $("#start-game");

/** Connect Four
 *
 *  Player 1 and Player 2 alternate turns. On each turn, a piece is dropped
 *  down a column until a player gets four-in-a-row (horiz, vert, or diag) or
 *  until board fills up completely (tie).
*/

/** Game: a single game instance for 2 players and a determined board size */

class Game {
  constructor(p1, p2, p3, height = 6, width = 7) {
    this.players = [p1, p2, p3].filter(p => p.color !== "");
    this.height = height;
    this.width = width;
    this.currPlayer = this.players[0];
    this.playerCount = 0;
    this.makeBoard();
    this.makeHtmlBoard();
    this.checkPlayersIfOnlyComputerPlayer();
    this.gameOver = false;
  }

  /**
   *  makeBoard: creates in-memory JS board structure:
   *  board = array of rows, each row is an array of cells (board[y][x])
   *
   *  For example, a board of height 6 and width 7:
   *    [ [] [] [] [] [] [] []],
   *    [ [] [] [] [] [] [] []],
   *    [ [] [] [] [] [] [] []],
   *    [ [] [] [] [] [] [] []],
   *    [ [] [] [] [] [] [] []],
   *    [ [] [] [] [] [] [] []]     <-- each cell will be filled w/ null
   */
  makeBoard() {
    this.board = [];
    for (let y = 0; y < this.height; y++) {
      const newRow = Array.from({ length: this.width }).fill(null);
      this.board.push(newRow);
    }
  }


  /**
   *  makeHtmlBoard: creates DOM table w/ row of column heads along w/ table
   *  cells for game
   */
  makeHtmlBoard() {
    const $board = $("#board").html('');
    const $thead = $("<thead>");
    const $tbody = $("<tbody>");


    // creates thead part of board
    const $trTop = $("<tr>").attr("id", "column-top");

    for (let x = 0; x < this.width; x++) {
      const $th = $(`<th id="top-${x}"></th>`);
      $th.on("click", this.handleClick.bind(this));
      $trTop.append($th);
    }
    $thead.append($trTop);
    $board.append($thead);


    // creates tbody part of board
    for (let y = 0; y < this.height; y++) {
      const $tr = $("<tr>");

      for (let x = 0; x < this.width; x++) {
        const $td = $(`<td id="c-${y}-${x}"></td>`);
        $tr.append($td);
      }

      $tbody.append($tr);
    }

    $board.append($tbody);
  }

  /** findSpotForCol: given column x, returns y-coordinate of furthest-down
   *  spot (returns null if filled)
   */

  findSpotForCol(x) {
    for (let y = this.height - 1; y >= 0; y--) {
      if (this.board[y][x] === null) {
        return y;
      }
    }
    return null;
  }

  /** placeInTable: update DOM to place game piece into HTML table of board */

  placeInTable(y, x) {
    const $piece = $(`<div class="piece p${this.currPlayer}"></div>`);
    console.log('This is $piece =', $piece);
    $piece.css("background-color", this.currPlayer.color);

    const $spotOnBoard = $(`#c-${y}-${x}`);
    console.log('This is $spotOnBoard = ', $spotOnBoard);

    $spotOnBoard.append($piece);
  }

  /** endGame: announce game end */

  endGame(msg) {
    alert(msg);
  }

  /** checkForWin: check board cell-by-cell for "does a win start here?" */

  checkForWin() {

    /** _win: takes an array of arrays from checkForWin; returns booolean
     *  Checks four cells to see if they're all color of current player
     *     - cells: list of four (y, x) cells
     *     - returns true if all are legal coordinates and all match currPlayer
     */

    function _win(cells) {
      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.height &&
          x >= 0 &&
          x < this.width &&
          this.board[y][x] === this.currPlayer
      );
    }

    const _boundWin = _win.bind(this);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // get "checklist" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

        // find winner (only checking each win-possibility as needed)
        if (_boundWin(horiz) || _boundWin(vert) || _boundWin(diagDR) ||
          _boundWin(diagDL)) {
          return true;
        }
      }
    }
    return false;
  }

  /** handleClick: handle click of column top to play piece
   *
   *  Prevent additional moves here if game over:
   *  In handleClick, checks gameOver property; if false, return to ignore click
  */

  handleClick(evt) {

    // If game is over, ignores click to prevent additional moves
    if (this.gameOver) {
      return;
    }

    // Instead of getting x from ID of clicked cell, use jQuery index() for x
    const x = $(evt.target).index();
    console.log('This is x = ', x);

    // gets next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    console.log('This is y = ', y);
    if (y === null) return;

    // places piece in board and add to HTML table
    this.board[y][x] = this.currPlayer;
    this.placeInTable(y, x);

    // checks for win
    if (this.checkForWin()) {
      this.gameOver = true;
      setTimeout(() => this.endGame(`Player ${this.currPlayer.color} won!`), 0);
      return;

      // original code for reference:
      // return this.endGame(`Player ${this.currPlayer} won!`);
    }

    // checks for tie: if top row is filled, board is filled
    if (this.board[0].every(cell => cell !== null)) {
      this.gameOver = true;
      setTimeout(() => this.endGame(`It's a tie!`), 0);
      return;

      // original code for reference:
      // return this.endGame('Tie!');
    }

    // switch players
    if (this.players.length > 1) {
      if (this.currPlayer !== this.players.at(-1)) {

          // note to self: using this.playerCount++ does NOT work here somehow
          this.currPlayer = this.players[this.playerCount += 1];
          this.checkForComputerPlayer();

      } else {
        this.playerCount = 0;
        this.currPlayer = this.players[this.playerCount];
        this.checkForComputerPlayer();
      }

    } else {
      this.currPlayer = this.players[this.playerCount];
      this.checkForComputerPlayer();
    }
    // original code for reference:
    // this.currPlayer === this.players[0] ? this.players[1] : this.players[0];
  }

  /** checkForComputerPlayer: checks this.currPlayer if an instance of Computer
   *  Player; if true, makes move for current player (the computer player)
   */
  checkForComputerPlayer() {
    if (this.currPlayer instanceof ComputerPlayer) {
      setTimeout(() => this.currPlayer.makeMove(this), 1000);
      return;
    }
  }

  /** checkPlayersIfOnlyComputerPlayer: checks Game instance for single player
   *  in this.players and if single player is an instance of ComputerPlayer;
   *  makes computer player play Connect Four by itself
   */
  checkPlayersIfOnlyComputerPlayer() {
    if (this.players.length < 2 && this.currPlayer instanceof ComputerPlayer) {
      this.checkForComputerPlayer();
    }
  }

}


/**  Player: a single player instance for Connect 4
 *   - color: chosen legal CSS color for player piece
*/

class Player {
  constructor(color) {
    this.color = color;
  }
}

/**
 *  ComputerPlayer: a single computer player instance that picks a col randomly
 */

class ComputerPlayer extends Player {
  constructor(color) {
    super(color);
  }

  /** pickRandomCol: takes an array of available column indexes; returns a
   *  random number between 0 and the length of the array
   *
   *  [0, 2, 3, 5, 6] => Math.floor(Math.random() * 5) => 1 (random num example)
   */
  pickRandomCol(openColumnsIndexes) {
    const randomIdx = Math.floor(Math.random() * openColumnsIndexes.length);
    return randomIdx;
  }

/** makeMove: takes a single game instance; creates an array and pushes
 *  available column indexes (if the board is not filled up yet); targets a
 *  random open column (a <th> element) and triggers its click event on target
 */
  makeMove(game) {
    const openColumnsIndexes = [];
    for (let x = 0; x < game.width; x++) {
      if (game.findSpotForCol(x) !== null) {
        openColumnsIndexes.push(x);
      }
    }

    const randomColIndex = this.pickRandomCol(openColumnsIndexes);
    const pickedColumn = openColumnsIndexes[randomColIndex];

    const $thPick = $(`#top-${pickedColumn}`);
    $thPick.trigger("click");
  }
}

let g;


/** start: handles start of game when user submits players colors form */
function start(evt) {
  evt.preventDefault();
  const p1 = new Player($("#p1-color").val());
  const p2 = new Player($("#p2-color").val());
  const p3 = new ComputerPlayer($("#computer-color").val());
  g = new Game(p1, p2, p3);
}

$startGame.on("submit", start);