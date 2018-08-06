import { ether } from '.';

// const ether1 = ether(1).toNumber();
const div = 10;
const HARDCAP_TOKENS_PRE_ICO = ether(59561520);
const HARDCAP_TOKENS_ICO = ether(139999994);
const RESERVED_TOKENS_FOR_ICO_BONUSES = ether(15756152);

export const ether1 = ether(1).toNumber();
export const reservedTokensForFoundersFoundation = ether(201700456);
export const validAmountForFoundersFoundation = reservedTokensForFoundersFoundation.div(div);
export const invalidAmountForFoundersFoundation = reservedTokensForFoundersFoundation.add(ether1);

export const reservedTokensForPlatformOperations = ether(113010700);
export const validAmountForPlatform = reservedTokensForPlatformOperations.div(div);
export const invalidAmountForPlatform = reservedTokensForPlatformOperations.add(ether1);

export const reservedTokensForRoiOnCapital = ether(9626337);
export const validAmountForRoiOnCapital = reservedTokensForRoiOnCapital.div(div);
export const inValidAmountForRoiOnCapital = reservedTokensForRoiOnCapital.add(ether1);

export const reservedTokensForFinancialInstituion = ether(77010700);
export const validAmountForFinancialInstitution = (
  reservedTokensForFinancialInstituion.div(div));
export const inValidAmountForFinancialInstitution = (
  reservedTokensForFinancialInstituion.add(ether1));

export const reservedTokensForCynotrust = ether(11551604);
export const validAmountForCynotrust = reservedTokensForCynotrust.div(div);
export const inValidAmountForCynotrust = reservedTokensForCynotrust.add(ether1);

export const reservedTokensForCryptoExchanges = ether(244936817);
export const validAmountForCryptoExchanges = reservedTokensForCryptoExchanges.div(div);
export const inValidAmountForCryptoExchanges = reservedTokensForCryptoExchanges.add(ether1);

export const reservedTokensForTechDev = ether(11551604);
export const validAmountForTechDev = reservedTokensForTechDev.div(div);
export const inValidAmountForTechDev = reservedTokensForTechDev.add(ether1);

export const reservedTokensPreIco = HARDCAP_TOKENS_PRE_ICO;
export const reservedTokensIco = HARDCAP_TOKENS_ICO;
export const reservedTokensIcoBonuses = RESERVED_TOKENS_FOR_ICO_BONUSES;
export const tokensRemainingIco = HARDCAP_TOKENS_PRE_ICO.add(HARDCAP_TOKENS_ICO);

export const totalSupply = ether(884705884);
export const totalSupplyToken = ether(669388218);

// export const validAmountForBurn = ownerBalance.div(div);
// export const invalidAmountForBurn = ownerBalance.add(ether1);

export const getDefaultWallets = wallets => ({
  owner: wallets[0],
  foundersFoundationReserve: wallets[0],
  platformOperationsReserve: wallets[1],
  campaignAllocation: wallets[1],
  roiOnCapitalReserve: wallets[2],
  unsoldTokens: wallets[2],
  financialInstitutionReserve: wallets[3],
  cynotrustReserve: wallets[4],
  cryptoExchangesReserve: wallets[5],
  furtherTechDevelopmentReserve: wallets[6],
  withdrawal1: wallets[3],
  withdrawal2: wallets[4],
  withdrawal3: wallets[5],
  withdrawal4: wallets[6],
  client1: wallets[7],
  client2: wallets[8],
  client3: wallets[9],
});

export const constructorThrow = 'VM Exception while processing transaction: invalid opcode';
