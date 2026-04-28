import React, { useMemo } from "react";

// declare missing function/var/type
const useWalletBalances = (): WalletBalance[] => {
  return [];
};

const usePrices = (): Record<string, number> => {
  return {};
};

type WalletRowProps = {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
};

const WalletRow = (_props: WalletRowProps) => {
  return <></>;
};

const classes: Record<string, string> = {};

// ************************************************** //
// Replace `any` with a real union type so the compiler can
// catch typos like `'Etherium'` and so `getPriority` is exhaustively typed.
type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

// The original `WalletBalance` interface was missing `blockchain`
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

// Hoisted out of the component body. The original redeclared `getPriority` on every render
const PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (chain: Blockchain | string): number =>
  chain in PRIORITY ? PRIORITY[chain as Blockchain] : -99;

// Fix the props type
type Props = React.HTMLAttributes<HTMLDivElement>;

const WalletPage: React.FC<Props> = (props) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Memoized rows, the original did filter -> sort -> map (formattedBalances) -> map (rows),
  // where `formattedBalances` was never used. Fold everything into one chain.
  const rows = useMemo(() => {
    return (
      balances
        // The original referenced an undefined variable `lhsPriority` and kept balances with `amount <= 0` (the inverse of
        // what a wallet view should show). Use the local `priority` and require `amount > 0`.
        .filter((b) => {
          const priority = getPriority(b.blockchain);
          return priority > -99 && b.amount > 0;
        })
        // The original comparator returned `undefined` when the two priorities were equal
        // Subtraction gives a total ordering and an explicit 0 for ties, so the sort is stable
        .sort((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain))
        .map((b) => {
          // Guard against missing prices. `prices[currency]` can be `undefined` while data is loading, and `undefined * number` is
          // `NaN`, which renders as "NaN" .
          const price = prices[b.currency] ?? 0;
          const usdValue = price * b.amount;

          // `toFixed()` with no argument truncates to 0 decimals. Add 2 to match with currency
          const formattedAmount = b.amount.toFixed(2);

          return (
            <WalletRow
              className={classes.row}
              // Stable key instead of array index
              key={`${b.blockchain}:${b.currency}`}
              amount={b.amount}
              usdValue={usdValue}
              formattedAmount={formattedAmount}
            />
          );
        })
    );
  }, [balances, prices]);

  return <div {...props}>{rows}</div>;
};

export default WalletPage;
