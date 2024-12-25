const readline = require('readline');

const rl = readline.createInterface({input: process.stdin, output: process.stdout});

function errorFinder(input) {
    const validChar = /^[\d+\-*/^().\s]+$/;
    if (validChar.test(input) == 0){
        throw new Error('Выражение содержит недопустимые символы.');
    }

    let balance = 0;
    const symbols = input.match(/\d+(\.\d+)?|[+\-*/^()]|\s+/g);

    for (const symbol of symbols) {
        if (symbol.trim() === '')
            continue;
        if (symbol === '(')
            balance++;
        if (symbol === ')')
            balance--;
        if (balance < 0)
            throw new Error('Выражение содержит неравно количество открывающих и закрывающих скобок.');
    }

    if (balance !== 0) 
        throw new Error('Выражение содержит неравно количество открывающих и закрывающих скобок.');
}

function infixToPostfix(input) {
    input = input.replace(/\s+/g, ''); // лишние пробелы
    input = input.replace(/(^|[(])-/g, '$10-'); // унарный минус (-12 = 0 - 12)
    const operatePower = {'+': 1, '-': 1, '*': 2, '/': 2, '^': 3};
    const isRightAssociative = { '^': true }; // Операторы с правой ассоциативностью (3^2^2 = 3^(3^2)) - справа на лево
    const stack = [];
    const ans = [];
    const symbols = input.match(/\d+(\.\d+)?|[+\-*/^()]|[^\s]/g);

    for (const symbol of symbols) {
        if (!isNaN(symbol)) { // число
            ans.push(symbol);
        }
        else if (symbol === '(') {
            stack.push(symbol);
        }
        else if (symbol === ')') {
            while (stack.length && stack[stack.length - 1] !== '(') {
                ans.push(stack.pop());
            }
            stack.pop();
        }
        else { // оператор
            while (
                stack.length &&
                operatePower[stack[stack.length - 1]] !== undefined &&
                (
                    (isRightAssociative[symbol] && operatePower[symbol] < operatePower[stack[stack.length - 1]]) ||
                    (!isRightAssociative[symbol] && operatePower[symbol] <= operatePower[stack[stack.length - 1]])
                )
            ) {
                ans.push(stack.pop());
            }
            stack.push(symbol);
        }
    }

    while (stack.length) {
        ans.push(stack.pop());
    }

    return ans.join(' ');
}

function evaluatePostfix(input) {
    const stack = [];
    const symbols = input.split(' ');

    for (const symbol of symbols) {
        if (!isNaN(symbol)) { // число
            stack.push(Number(symbol));
        }
        else { // оператор
            const b = stack.pop();
            const a = stack.pop();

            switch (symbol) {
                case '+':
                    stack.push(a + b);
                    break;
                case '-':
                    stack.push(a - b);
                    break;
                case '*':
                    stack.push(a * b);
                    break;
                case '/':
                    stack.push(a / b);
                    break;
                case '^':
                    stack.push(Math.pow(a, b));
                    break;
                default:
                    throw new Error(`Неизвестный оператор: ${symbol}`);
            }
        }
    }

    return stack[0];
}



rl.question('Введите инфиксное выражение: ', (input) => {
    try {
        errorFinder(input);
        const postfixInput = infixToPostfix(input);
        console.log('Постфиксная запись:', postfixInput);

        const result = evaluatePostfix(postfixInput);
        console.log('Результат вычисления:', result);
    } catch (error) {
        console.error('Возникла ошибка:', error.message);
    } finally {
        rl.close();
    }
});