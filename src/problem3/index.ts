// =============================================================================
// Problem 3 — Messy React: Issues & Refactor
// =============================================================================
//
// ORIGINAL CODE (for reference)
// -----------------------------------------------------------------------------
// interface WalletBalance {
//   currency: string;
//   amount: number;
// }
// interface FormattedWalletBalance {
//   currency: string;
//   amount: number;
//   formatted: string;
// }
//
// interface Props extends BoxProps {}
// const WalletPage: React.FC<Props> = (props: Props) => {
//   const { children, ...rest } = props;
//   const balances = useWalletBalances();
//   const prices = usePrices();
//
//   const getPriority = (blockchain: any): number => {
//     switch (blockchain) {
//       case 'Osmosis':  return 100
//       case 'Ethereum': return 50
//       case 'Arbitrum': return 30
//       case 'Zilliqa':  return 20
//       case 'Neo':      return 20
//       default:         return -99
//     }
//   }
//
//   const sortedBalances = useMemo(() => {
//     return balances.filter((balance: WalletBalance) => {
//       const balancePriority = getPriority(balance.blockchain);
//       if (lhsPriority > -99) {
//         if (balance.amount <= 0) {
//           return true;
//         }
//       }
//       return false
//     }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
//       const leftPriority = getPriority(lhs.blockchain);
//       const rightPriority = getPriority(rhs.blockchain);
//       if (leftPriority > rightPriority)      return -1;
//       else if (rightPriority > leftPriority) return 1;
//     });
//   }, [balances, prices]);
//
//   const formattedBalances = sortedBalances.map((balance: WalletBalance) => ({
//     ...balance,
//     formatted: balance.amount.toFixed()
//   }))
//
//   const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
//     const usdValue = prices[balance.currency] * balance.amount;
//     return (
//       <WalletRow
//         className={classes.row}
//         key={index}
//         amount={balance.amount}
//         usdValue={usdValue}
//         formattedAmount={balance.formatted}
//       />
//     )
//   })
//
//   return <div {...rest}>{rows}</div>
// }
//
// =============================================================================
// ISSUES FOUND
// =============================================================================
//
// --- Bugs (will not work / will crash at runtime) -----------------------------
//
// 1. Undefined variable `lhsPriority` inside the filter.
//    The local is `balancePriority`, but the condition checks `lhsPriority`,
//    which doesn't exist in scope. This throws `ReferenceError` at runtime
//    (or, if a global with that name leaks in, behaves nondeterministically).
//
// 2. `balance.blockchain` is not declared on `WalletBalance`.
//    The interface only has `currency` and `amount`. Either the interface is
//    wrong, or the hook returns more than the type says. Either way, it's an
//    unsound assumption — `getPriority(balance.blockchain)` will always hit the
//    `default` branch unless the real shape includes `blockchain`.
//
// 3. Filter keeps balances with non-positive amounts (`balance.amount <= 0`).
//    The comment/intent of a "wallet page" is to show balances the user holds,
//    so the predicate should be `> 0`. This is inverted.
//
// 4. `formattedBalances` is computed but never consumed. `rows` maps over
//    `sortedBalances` (which has no `formatted` field) yet types each entry
//    as `FormattedWalletBalance` and reads `balance.formatted` → always
//    `undefined`. Dead code + broken display.
//
// 5. The sort comparator has no `return 0` for the equal case. It returns
//    `undefined` when priorities are equal, which is coerced to 0 by most
//    engines but is not spec-guaranteed and is a TS/lint error. Equal entries
//    can also reorder unstably across renders.
//
// 6. `prices[balance.currency]` may be undefined (price not loaded yet, or
//    currency not tracked). `undefined * number === NaN`, which then renders
//    as "NaN" in the UI. No guard.
//
// --- Anti-patterns / inefficiencies ------------------------------------------
//
// 7. `useMemo` depends on `prices`, but the memoized computation does not use
//    `prices`. Every price tick recomputes the sort for nothing. Drop `prices`
//    from the dependency array.
//
// 8. `getPriority` is redeclared on every render. It's a pure mapping — hoist
//    it to module scope (or use a const lookup table). No reason for it to
//    live inside the component.
//
// 9. `getPriority(blockchain: any)` uses `any`, defeating type safety. Use a
//    union type (`'Osmosis' | 'Ethereum' | ...`) or a `Record<Blockchain,
//    number>` lookup.
//
// 10. Two passes over the list: one to build `formattedBalances`, then `rows`
//     re-iterates the unformatted `sortedBalances`. Even if (4) is fixed,
//     producing `formattedBalances` as an intermediate array is wasted work
//     when the only consumer is the `rows` map. Combine into one pass.
//
// 11. `key={index}`. Using array index as React key on a list that filters
//     and sorts causes incorrect reconciliation: when the order changes,
//     React reuses the wrong DOM nodes / component state. Use a stable id
//     like `balance.currency` (assuming uniqueness) or a composite key.
//
// 12. `Props extends BoxProps {}` adds nothing. Just use `BoxProps` directly,
//     or remove the alias. Also, `children` is destructured and then dropped
//     — if the parent passes children they're silently discarded. Either
//     render `{children}` inside the wrapper or don't accept it.
//
// 13. `balance.amount.toFixed()` with no precision argument formats with 0
//     decimals. For currency-style display you almost certainly want a fixed
//     precision (e.g. 2–6 decimals) and likely `Intl.NumberFormat` for locale
//     correctness. Minor, but worth flagging.
//
// 14. `rows` could be wrapped in `useMemo` keyed on the inputs that actually
//     drive it (sorted balances + prices), so re-renders triggered by
//     unrelated parent state don't rebuild every row's element object.
//     (Low-impact; matters only when the list is large.)
//
// =============================================================================
// REFACTORED VERSION
// =============================================================================
//
// Notes:
//  - Hoisted `getPriority` out of the component as a typed lookup.
//  - Added `blockchain` to `WalletBalance` (the original code clearly assumed it).
//  - Single pass: filter → sort → map to render-ready rows, memoized correctly.
//  - Stable keys, NaN guard on usdValue, removed dead `formattedBalances`,
//    fixed inverted predicate, fixed `lhsPriority` reference, fixed comparator.
//
// ```tsx
// type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';
//
// interface WalletBalance {
//   currency: string;
//   amount: number;
//   blockchain: Blockchain;
// }
//
// const PRIORITY: Record<Blockchain, number> = {
//   Osmosis: 100,
//   Ethereum: 50,
//   Arbitrum: 30,
//   Zilliqa: 20,
//   Neo: 20,
// };
//
// const getPriority = (chain: Blockchain | string): number =>
//   chain in PRIORITY ? PRIORITY[chain as Blockchain] : -99;
//
// type Props = BoxProps;
//
// const WalletPage: React.FC<Props> = (props) => {
//   const { children, ...rest } = props;
//   const balances = useWalletBalances();
//   const prices = usePrices();
//
//   const rows = useMemo(() => {
//     return balances
//       .filter((b) => getPriority(b.blockchain) > -99 && b.amount > 0)
//       .sort((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain))
//       .map((b) => {
//         const price = prices[b.currency] ?? 0;
//         const usdValue = price * b.amount;
//         const formattedAmount = b.amount.toFixed(2);
//         return (
//           <WalletRow
//             className={classes.row}
//             key={`${b.blockchain}:${b.currency}`}
//             amount={b.amount}
//             usdValue={usdValue}
//             formattedAmount={formattedAmount}
//           />
//         );
//       });
//   }, [balances, prices]);
//
//   return <div {...rest}>{rows}</div>;
// };
// ```
//
// Why these changes are safe / better:
//  - One traversal instead of three (filter, sort, then two separate maps).
//  - `useMemo` dependency list now matches what the body reads (balances + prices),
//    so it no longer recomputes on unrelated state and no longer skips when prices
//    change (which it needed to, since usdValue depends on prices).
//  - `getPriority` is created once per module load, not per render.
//  - Keys are stable across reorders, so `WalletRow` internal state (focus,
//    transitions) survives sorting.
//  - NaN-safe USD, correct filter predicate, no dead variables, no `any`.
