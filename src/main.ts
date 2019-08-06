import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {interval} from 'rxjs/observable/interval';
import {fromEvent} from 'rxjs/observable/fromEvent';

import {
    filter,
    scan,
    startWith,
    distinctUntilChanged,
    withLatestFrom,
    mapTo
} from 'rxjs/operators';
import {merge} from "rxjs/observable/merge";

let snake: Array<any> = [];
let apples: Array<any> = [];
let score$ = new BehaviorSubject(0);
let n: any = '10';
let snakeLength: number = 5;

function matrix(n) {
    let matrix = [];
    for (let i = 0; i < n.toString(); i++) {
        matrix[i] = [];
        for (let j = 0; j < n.toString(); j++) {
            matrix[i][j] = '';

        }
    }
    return matrix;
}

const rows = document.getElementsByClassName('row');

let matr = matrix(n);

function printSnakeAtTheBeggining() {
    for (let i = 0; i < snakeLength; i++) {
        snake.push({x: 0, y: i});
        rows[0].children[i].classList.add('snake')
    }

    return matr;
}

const DIRECTIONS = {
    38: {x: -1, y: 0},
    40: {x: 1, y: 0},
    37: {x: 0, y: -1},
    39: {x: 0, y: 1}
};

function moveSnake(snakeArr, direction) {
    if (!snakeArr.length) {
        fillMatrix(matr);
    }
    snakeArr.forEach(cell => rows[cell.x].children[cell.y].classList.add('snake'));
    let yNext, xNext;

    yNext = snakeArr[snakeArr.length - 1].y;

    xNext = snakeArr[snakeArr.length - 1].x;

    xNext += 1 * direction.x;
    yNext += 1 * direction.y;

    if (yNext > n - 1) {
        yNext = 0;
    }

    if (yNext < 0) {
        yNext = n - 1;
    }

    if (xNext < 0) {
        xNext = n - 1;
    }

    if (xNext > n - 1) {
        xNext = 0;
    }


    rows[xNext].children[yNext].classList.add('snake');
    snakeArr.push({x: xNext, y: yNext});

    let newSnakeCell = false;
    snake.forEach(snakeCoord => {
        apples.forEach((apple, index) => {
            if (apple.x === snakeCoord.x && apple.y === snakeCoord.y) {
                rows[apples[index].x].children[apples[index].y].classList.remove('apple');
                apples.splice(index, 1);

                newSnakeCell = true;
            }
        });
    });

    if (newSnakeCell) {
        let nX, nY;
        nX = xNext + 1 * direction.x;
        nY = yNext + 1 * direction.y;

        if (nY > n - 1) {
            nY = 0;
        }

        if (nY < 0) {
            nY = n - 1;
        }

        if (nX < 0) {
            nX = n - 1;
        }

        if (nX > n - 1) {
            nX = 0;
        }

        //rows[nX].children[nY].classList.add('snake');
        //snake.push({x: nX, y: nY});

        //add new apple
        let i = Math.floor(Math.random() * ((n - 1) + 1));
        let j = Math.floor(Math.random() * ((n - 1) + 1));
        // recheck innerText of matr[i][j]

        while (matr[i][j] === 's') {
            i = Math.floor(Math.random() * ((n - 1) + 1));
        }
        rows[i].children[j].classList.add('apple');
        apples.push({x: i, y: j});

        score$.next(score$.getValue() + 1);
    }

    if(!newSnakeCell) {
        rows[snakeArr[0].x].children[snakeArr[0].y].classList.remove('snake');
        snakeArr.shift();
    }

    return snakeArr;
}

function redrawMatrix(snake, apples, direction) {
    moveSnake(snake, direction);
    document.getElementsByClassName('score')[0].innerHTML = score$.getValue().toString();
}

function fillMatrix(matr) {
    printSnakeAtTheBeggining();

    let i = Math.floor(Math.random() * ((n - 1) + 1));
    let j = Math.floor(Math.random() * ((n - 1) + 1));

    while (matr[i][j] === 's') {
        i = Math.floor(Math.random() * ((n - 1) + 1));
    }
    rows[i].children[j].classList.add('apple');
    apples.push({x: i, y: j});

    let k = Math.floor(Math.random() * ((n - 1) + 1));
    let l = Math.floor(Math.random() * ((n - 1) + 1));
    if (i !== k || j !== l) {
        while (matr[k][l] === 's') {
            k = Math.floor(Math.random() * ((n - 1) + 1));
        }
        rows[k].children[l].classList.add('apple');
        apples.push({x: k, y: l});
    }

    return matr;
}

const source = interval(1000);

enum Key {
    LEFT = 37,
    RIGHT = 39,
    UP = 38,
    DOWN = 40
}

let left$: Observable<any> = fromEvent(document, 'keydown').pipe(
    filter((event: KeyboardEvent) => event.keyCode === Key.LEFT)
);

let up$: Observable<any> = fromEvent(document, 'keydown').pipe(
    filter((event: KeyboardEvent) => event.keyCode === Key.UP)
);

let down$: Observable<any> = fromEvent(document, 'keydown').pipe(
    filter((event: KeyboardEvent) => event.keyCode === Key.DOWN)
);

let right$: Observable<any> = fromEvent(document, 'keydown').pipe(
    filter((event: KeyboardEvent) => event.keyCode === Key.RIGHT)
);
const snakeCommands$ = merge(
    left$.pipe(mapTo({key: Key.LEFT, direction: DIRECTIONS[37]})),
    up$.pipe(mapTo({key: Key.UP, direction: DIRECTIONS[38]})),
    down$.pipe(mapTo({key: Key.DOWN, direction: DIRECTIONS[40]})),
    right$.pipe(mapTo({key: Key.RIGHT, direction: DIRECTIONS[39]})),
);

const snakeState$ = snakeCommands$.pipe(
    startWith({key: 39, direction: DIRECTIONS[39]}),
    scan((acc, current) => {
        debugger;
        console.log(acc);
        if(Math.abs(acc.key - current.key) === 2) {
            return acc
        } else {
            return current
        }
    }),
    distinctUntilChanged(),
);

const game = source
    .pipe(withLatestFrom(snakeState$))
    .subscribe(([val, state]) => {
        //need to recheck here pairl left-right ext

        redrawMatrix(snake, apples, state.direction);
    });
