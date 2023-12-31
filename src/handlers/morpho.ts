import { Address, Bytes } from "@graphprotocol/graph-ts";

import {
  AccrueInterest as AccrueInterestEvent,
  Borrow as BorrowEvent,
  Liquidate,
  Liquidate as LiquidateEvent,
  Repay as RepayEvent,
  Supply as SupplyEvent,
  SupplyCollateral as SupplyCollateralEvent,
  Withdraw as WithdrawEvent,
  WithdrawCollateral as WithdrawCollateralEvent,
} from "../../generated/Morpho/Morpho";
import { MorphoTx } from "../../generated/schema";
import { handleMorphoTx } from "../distribute-rewards";
import { setupMarket, setupUser } from "../initializers";
import { generateLogId, PositionType } from "../utils";

export function handleAccrueInterest(event: AccrueInterestEvent): void {
  if (event.params.feeShares.isZero()) return;

  // We consider the fees accrued as a supply.
  const id = generateLogId(event);
  const morphoTx = new MorphoTx(id);
  morphoTx.type = PositionType.SUPPLY;
  // TODO: retrieve the fee receiver.
  morphoTx.user = setupUser(Address.zero()).id;
  morphoTx.market = setupMarket(event.params.id).id;
  morphoTx.shares = event.params.feeShares;

  morphoTx.timestamp = event.block.timestamp;

  morphoTx.txHash = event.transaction.hash;
  morphoTx.txIndex = event.transaction.index;
  morphoTx.logIndex = event.logIndex;

  morphoTx.blockNumber = event.block.number;
  morphoTx.save();

  handleMorphoTx(morphoTx);
}

export function handleBorrow(event: BorrowEvent): void {
  const id = generateLogId(event);
  const morphoTx = new MorphoTx(id);
  morphoTx.type = PositionType.BORROW;
  morphoTx.user = setupUser(event.params.onBehalf).id;
  morphoTx.market = setupMarket(event.params.id).id;
  morphoTx.shares = event.params.shares;

  morphoTx.timestamp = event.block.timestamp;

  morphoTx.txHash = event.transaction.hash;
  morphoTx.txIndex = event.transaction.index;
  morphoTx.logIndex = event.logIndex;

  morphoTx.blockNumber = event.block.number;
  morphoTx.save();

  handleMorphoTx(morphoTx);
}

export function handleLiquidateGoerli(event: Liquidate): void {
  handleLiquidate(event as LiquidateEvent);
}
export function handleLiquidate(event: LiquidateEvent): void {
  const repayId = event.transaction.hash
    .concat(Bytes.fromHexString(event.logIndex.toHexString()))
    .concat(Bytes.fromUTF8(PositionType.BORROW));
  const repayMorphoTx = new MorphoTx(repayId);
  repayMorphoTx.type = PositionType.BORROW;
  repayMorphoTx.user = setupUser(event.params.borrower).id;
  repayMorphoTx.market = setupMarket(event.params.id).id;
  // TODO: check bad debt
  repayMorphoTx.shares = event.params.repaidShares.neg();

  repayMorphoTx.timestamp = event.block.timestamp;

  repayMorphoTx.txHash = event.transaction.hash;
  repayMorphoTx.txIndex = event.transaction.index;
  repayMorphoTx.logIndex = event.logIndex;

  repayMorphoTx.blockNumber = event.block.number;
  repayMorphoTx.save();
  handleMorphoTx(repayMorphoTx);

  const withdrawCollatId = event.transaction.hash
    .concat(Bytes.fromHexString(event.logIndex.toHexString()))
    .concat(Bytes.fromUTF8(PositionType.COLLATERAL));
  const withdrawCollatTx = new MorphoTx(withdrawCollatId);
  withdrawCollatTx.type = PositionType.BORROW;
  withdrawCollatTx.user = setupUser(event.params.borrower).id;
  withdrawCollatTx.market = setupMarket(event.params.id).id;
  withdrawCollatTx.shares = event.params.seizedAssets.neg();

  withdrawCollatTx.timestamp = event.block.timestamp;

  withdrawCollatTx.txHash = event.transaction.hash;
  withdrawCollatTx.txIndex = event.transaction.index;
  withdrawCollatTx.logIndex = event.logIndex;

  withdrawCollatTx.blockNumber = event.block.number;
  withdrawCollatTx.save();

  handleMorphoTx(withdrawCollatTx);
}

export function handleRepay(event: RepayEvent): void {
  const id = generateLogId(event);
  const morphoTx = new MorphoTx(id);
  morphoTx.type = PositionType.BORROW;
  morphoTx.user = setupUser(event.params.onBehalf).id;
  morphoTx.market = setupMarket(event.params.id).id;
  morphoTx.shares = event.params.shares.neg();

  morphoTx.timestamp = event.block.timestamp;

  morphoTx.txHash = event.transaction.hash;
  morphoTx.txIndex = event.transaction.index;
  morphoTx.logIndex = event.logIndex;

  morphoTx.blockNumber = event.block.number;
  morphoTx.save();

  handleMorphoTx(morphoTx);
}

export function handleSupply(event: SupplyEvent): void {
  const id = generateLogId(event);

  const morphoTx = new MorphoTx(id);
  morphoTx.type = PositionType.SUPPLY;
  morphoTx.user = setupUser(event.params.onBehalf).id;
  morphoTx.market = setupMarket(event.params.id).id;
  morphoTx.shares = event.params.shares;

  morphoTx.timestamp = event.block.timestamp;

  morphoTx.txHash = event.transaction.hash;
  morphoTx.txIndex = event.transaction.index;
  morphoTx.logIndex = event.logIndex;

  morphoTx.blockNumber = event.block.number;
  morphoTx.save();

  handleMorphoTx(morphoTx);
}

export function handleSupplyCollateral(event: SupplyCollateralEvent): void {
  const id = generateLogId(event);
  const morphoTx = new MorphoTx(id);
  morphoTx.type = PositionType.COLLATERAL;
  morphoTx.user = setupUser(event.params.onBehalf).id;
  morphoTx.market = setupMarket(event.params.id).id;
  morphoTx.shares = event.params.assets;

  morphoTx.timestamp = event.block.timestamp;

  morphoTx.txHash = event.transaction.hash;
  morphoTx.txIndex = event.transaction.index;
  morphoTx.logIndex = event.logIndex;

  morphoTx.blockNumber = event.block.number;
  morphoTx.save();

  handleMorphoTx(morphoTx);
}

export function handleWithdraw(event: WithdrawEvent): void {
  const id = generateLogId(event);
  const morphoTx = new MorphoTx(id);
  morphoTx.type = PositionType.SUPPLY;
  morphoTx.user = setupUser(event.params.onBehalf).id;
  morphoTx.market = setupMarket(event.params.id).id;
  morphoTx.shares = event.params.shares.neg();

  morphoTx.timestamp = event.block.timestamp;

  morphoTx.txHash = event.transaction.hash;
  morphoTx.txIndex = event.transaction.index;
  morphoTx.logIndex = event.logIndex;

  morphoTx.blockNumber = event.block.number;
  morphoTx.save();

  handleMorphoTx(morphoTx);
}

export function handleWithdrawCollateral(event: WithdrawCollateralEvent): void {
  const id = generateLogId(event);
  const morphoTx = new MorphoTx(id);
  morphoTx.type = PositionType.COLLATERAL;
  morphoTx.user = setupUser(event.params.onBehalf).id;
  morphoTx.market = setupMarket(event.params.id).id;
  morphoTx.shares = event.params.assets.neg();

  morphoTx.timestamp = event.block.timestamp;

  morphoTx.txHash = event.transaction.hash;
  morphoTx.txIndex = event.transaction.index;
  morphoTx.logIndex = event.logIndex;

  morphoTx.blockNumber = event.block.number;
  morphoTx.save();

  handleMorphoTx(morphoTx);
}