"use strict";

const $startGame = $("#start-game");

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