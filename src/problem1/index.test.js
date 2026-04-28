const test = require('node:test');
const assert = require('node:assert/strict');
const { sum_to_n_a, sum_to_n_b, sum_to_n_c } = require('./index');

const implementations = [
    ['sum_to_n_a (iterative)', sum_to_n_a],
    ['sum_to_n_b (closed form)', sum_to_n_b],
    ['sum_to_n_c (recursive)', sum_to_n_c],
];

const cases = [
    { n: 0, expected: 0 },
    { n: 1, expected: 1 },
    { n: 2, expected: 3 },
    { n: 5, expected: 15 },
    { n: 10, expected: 55 },
    { n: 100, expected: 5050 },
    { n: -1, expected: -1 },
    { n: -5, expected: -15 },
    { n: -10, expected: -55 },
];

for (const [name, fn] of implementations) {
    test(name, async (t) => {
        for (const { n, expected } of cases) {
            await t.test(`sum_to_n(${n}) === ${expected}`, () => {
                assert.equal(fn(n), expected);
            });
        }

        await t.test('matches the task example exactly', () => {
            assert.equal(fn(5), 1 + 2 + 3 + 4 + 5);
        });

        await t.test('handles a larger n', () => {
            const n = 1000;
            assert.equal(fn(n), (n * (n + 1)) / 2);
        });
    });
}

test('all three implementations agree across a sweep', () => {
    for (let n = -50; n <= 50; n++) {
        const a = sum_to_n_a(n);
        const b = sum_to_n_b(n);
        const c = sum_to_n_c(n);
        assert.equal(a, b, `mismatch at n=${n}: a=${a} b=${b}`);
        assert.equal(b, c, `mismatch at n=${n}: b=${b} c=${c}`);
    }
});
