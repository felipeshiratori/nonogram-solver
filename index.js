const size = 15
const cols = [
    [3],
    [6], 
    [2, 3],
    [2, 2],
    [3, 2],
    [3, 5],
    [2, 1, 5],
    [5, 3, 1],
    [3, 1, 6],
    [3, 1, 4, 2],
    [6, 7],
    [2, 1, 4, 1, 1],
    [1, 2, 8],
    [1, 4, 1, 1],
    [10],
]
const rows = [
    [4],
    [3, 1],
    [3, 1, 1],
    [5, 1],
    [2, 1, 2],
    [2, 1, 3],
    [5, 4],
    [3, 1, 5],
    [7, 4, 1],
    [3, 1, 7],
    [2, 6, 1, 1],
    [2, 9],
    [2, 4, 1, 1],
    [6, 4],
    [8]
]

let result = Array(size)
for (let i = 0; i < size; i++) {
    result[i] = Array(size)
    result[i].fill(' ')
}

let resultSum = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //cols
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  //rows
]

let usedRows = []
let usedCols = []
for (let i = 0; i < size; i++) {
    usedRows[i] = Array(rows[i].length)
    usedRows[i].fill(false)

    usedCols[i] = Array(cols[i].length)
    usedCols[i].fill(false)
}

function calculateSum(line, i, isRow) {
    line.sum = line.reduce((a, b) => {
        return a + b
    }, 0)
    line.sumWithZeros = line.sum + line.length - 1
}

function paint(start, size, i, isRow, isReverse, char) {
    let inc = {val: start}
    let x = isRow ? {val: i} : inc
    let y = isRow ? inc : {val: i}

    for (var k = 0; k < size; k++) {
        if (char === '@') {
            if (result[x.val][y.val] !== '@') {
                result[x.val][y.val] = '@'
                resultSum[isRow | 0][x.val]++
                resultSum[!isRow | 0][y.val]++
            }
        } else {
            result[x.val][y.val] = 'X'
        }
        isReverse ? inc.val-- : inc.val++
    }

    return { x: x.val, y: y.val }
}

function fill(start, size, i, isRow, isReverse) {
    return paint(start, size, i, isRow, isReverse, '@')
}
function remove(start, size, i, isRow, isReverse) {
    return paint(start, size, i, isRow, isReverse, 'X')
}

function completeLineWithZeros(line, i, isRow) {
    if (line.sum === resultSum[isRow][i]) {
        let j = {val: 0}
        let a = isRow ? {val: i} : j
        let b = isRow ? j : {val: i}

        for (j.val = 0; j.val < size; j.val++) {
            result[a.val][b.val] = result[a.val][b.val] === '@' ? '@' : 'X'
        }
    }
}

function calculateCenterMost(size, start, end) {
    const gapSize = size*2 - (end-start)
    const gapStart = Math.floor((end-start-gapSize)/2) + start
    return {gapStart,gapSize}
}

function fillCenterMost(line, i, isRow) {

    let usedLeft = 0
    let usedRigth = line.sumWithZeros
    line.forEach((element) => {
        if (element*2 > size-(usedRigth+usedLeft-element)) {
            const {gapStart, gapSize} = calculateCenterMost(element, usedLeft, size-(usedRigth-element))
            fill(gapStart, gapSize, i, isRow, 0)
            
        }
        usedLeft += element + 1
        usedRigth -= element + 1
    })
}

function findFilledCellOnBorder(i, start, isRow, reversed) {
    const invSize = reversed ? 0 : size
    const inv = reversed ? -1 : 1
    let j = {val: start}
    let a = isRow ? {val: i} : j
    let b = isRow ? j : {val: i}

    for (j.val = start; j.val * inv < invSize * inv; reversed ? j.val-- : j.val++) {
        if (result[a.val][b.val] === ' ') {
            return -1
        }
        if (result[a.val][b.val] === '@') {
            return j.val
        }
    }
    return -1
}

function fillBordersToCenter(line, i, isRow, reversed) {
    let start = reversed ? size-1 : 0
    const cLine = reversed ? line.reverse() : line
    cLine.forEach((element, k) => {
        const found = findFilledCellOnBorder(i, start, isRow, reversed)

        if (found === -1) {
            return
        }

        const {x, y} = fill(found, element, i, isRow, reversed)
        result[x][y] = 'X'

        const kRev = reversed ? line.length - k - 1 : k
        isRow ? usedRows[i][kRev] = true : usedCols[i][kRev] = true

        reversed ? start -= element + 1 : start += element + 1
    })
}

function closeSmallGaps(line, i, isRow) {
    const smallestElement = Math.min(...line)
    
    let count = 0
    let j = {val: 0}
    let a = isRow ? {val: i} : j
    let b = isRow ? j : {val: i}
    for (j.val = 0; j.val < size; j.val++) {
        if (result[a.val][b.val] === ' ' || result[a.val][b.val] === '@') {
            count++
        }
        if (result[a.val][b.val] === 'X') {
            if (count < smallestElement) {
                console.log('adasdsa', j.val - count)
                remove(j.val - count, count, i, isRow, 0)
            }
            count = 0
        }
    }
}

function nonogram() {
    cols.forEach((line, i) => calculateSum(line, i, 0))
    rows.forEach((line, i) => calculateSum(line, i, 1))

    cols.forEach((line, i) => fillCenterMost(line, i, 0))
    rows.forEach((line, i) => fillCenterMost(line, i, 1))
    
    cols.forEach((line, i) => fillBordersToCenter(line, i, 0, 0))
    rows.forEach((line, i) => fillBordersToCenter(line, i, 1, 0))

    cols.forEach((line, i) => fillBordersToCenter(line, i, 0, 1))
    rows.forEach((line, i) => fillBordersToCenter(line, i, 1, 1))

    cols.forEach((line, i) => completeLineWithZeros(line, i, 0))
    rows.forEach((line, i) => completeLineWithZeros(line, i, 1))

    cols.forEach((line, i) => closeSmallGaps(line, i, 0))
    rows.forEach((line, i) => closeSmallGaps(line, i, 1))

    console.log(cols)
    console.log(rows)
    console.log(result)
    console.log(resultSum)
    console.log(usedRows)
    console.log(usedCols)

}
module.exports.nonogram = nonogram;

nonogram()