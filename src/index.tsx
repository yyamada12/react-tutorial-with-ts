import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

interface SquarePropsInterface {
  value: string;
  shouldHighlight: boolean;
  onClick: () => void;
}

interface BoardPropsInterface {
  squares: Array<string>;
  line: Array<number>;
  onClick: (i: number) => void;
}

interface BoardStateInterface {
  squares: Array<string>;
  xIsNext: boolean;
}

interface GamePropsInterface {}

interface GameStateInterface {
  history: Array<{
    squares: Array<string>;
    row: number;
    col: number;
  }>;
  xIsNext: boolean;
  stepNumber: number;
  isMoveOrderReversed: boolean;
}

function Square(props: SquarePropsInterface) {
  return (
    <button
      className={props.shouldHighlight ? `square highlighted` : `square`}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component<BoardPropsInterface> {
  renderSquare(i: number) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        shouldHighlight={this.props.line.indexOf(i) > -1}
        onClick={() => this.props.onClick(i)}
      />
    );
  }
  renderBoardRow(i: number) {
    const rows = [];
    for (let j = 0; j < 3; j++) {
      rows.push(this.renderSquare(3 * i + j));
    }
    return (
      <div className="board-row" key={i}>
        {rows}
      </div>
    );
  }

  render() {
    const board = [];
    for (let j = 0; j < 3; j++) {
      board.push(this.renderBoardRow(j));
    }
    return <div>{board}</div>;
  }
}

class Game extends React.Component<GamePropsInterface, GameStateInterface> {
  constructor(props: GamePropsInterface) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(""),
          row: 0,
          col: 0
        }
      ],
      xIsNext: true,
      stepNumber: 0,
      isMoveOrderReversed: false
    };
  }
  handleClick(i: number) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat({
        squares: squares,
        row: (i / 3) | 0,
        col: i % 3
      }),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }
  jumpTo(step: number) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const squares = current.squares;
    const { winner, line } = calculateWinner(squares);

    const moves = history.map((h, step) => {
      let desc: string;
      if (step === 0) {
        desc = "Go to game start";
      } else {
        desc =
          "Go to step #" +
          (step + 1) +
          "(" +
          (h.col + 1) +
          "," +
          (h.row + 1) +
          ")";
      }
      return (
        <li key={step}>
          <button onClick={() => this.jumpTo(step)}>
            {step === this.state.stepNumber ? <b>{desc}</b> : desc}
          </button>
        </li>
      );
    });

    let status: string;
    if (winner) {
      status = "Winnder: " + winner;
    } else if (history.length < 10) {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    } else {
      status = "Draw";
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={squares}
            line={line}
            onClick={(i: number) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button
            onClick={() =>
              this.setState({
                isMoveOrderReversed: !this.state.isMoveOrderReversed
              })
            }
          >
            reverse order
          </button>
          {this.state.isMoveOrderReversed ? (
            <ol reversed>{moves.reverse()}</ol>
          ) : (
            <ol>{moves}</ol>
          )}
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(
  squares: Array<string>
): { winner: string; line: Array<number> } {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return { winner: "", line: [] };
}
