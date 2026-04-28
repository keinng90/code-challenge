// # Task

// Provide 3 unique implementations of the following function in JavaScript.

// **Input**: `n` - any integer

// *Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`*.

// **Output**: `return` - summation to `n`, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.

// Iterative loop.
function sum_to_n_a(n) {
    let sum = 0;
    if (n >= 0) {
        for (let i = 1; i <= n; i++) sum += i;
    } else {
        for (let i = -1; i >= n; i--) sum += i;
    }
    return sum;
}

// Closed form arithmetic series
function sum_to_n_b(n) {
    const abs = Math.abs(n);
    return Math.sign(n) * (abs * (abs + 1)) / 2;
}

// Recursion
function sum_to_n_c(n) {
    if (n === 0) return 0;
    return n + sum_to_n_c(n > 0 ? n - 1 : n + 1);
}

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
