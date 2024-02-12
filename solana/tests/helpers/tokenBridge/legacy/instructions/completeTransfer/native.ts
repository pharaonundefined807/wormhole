import { ParsedVaa } from "@certusone/wormhole-sdk";
import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  AccountMeta,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { TokenBridgeProgram, coreBridgeProgramId } from "../../..";
import { Claim, PostedVaaV1 } from "../../../../coreBridge";
import { Config, RegisteredEmitter, custodyAuthorityPda, custodyTokenPda } from "../../state";

export type LegacyCompleteTransferNativeContext = {
  payer: PublicKey;
  config?: PublicKey; // TODO: demonstrate this isn't needed in tests
  vaa?: PublicKey;
  claim?: PublicKey;
  registeredEmitter?: PublicKey;
  recipientToken: PublicKey;
  payerToken?: PublicKey;
  custodyToken?: PublicKey;
  mint: PublicKey;
  custodyAuthority?: PublicKey;
  rent?: PublicKey;
  coreBridgeProgram?: PublicKey;
};

export function legacyCompleteTransferNativeAccounts(
  program: TokenBridgeProgram,
  accounts: LegacyCompleteTransferNativeContext,
  parsedVaa: ParsedVaa,
  overrides: {
    legacyRegisteredEmitterDerive: boolean;
  }
): LegacyCompleteTransferNativeContext {
  const programId = program.programId;
  const { emitterChain, emitterAddress, sequence, hash } = parsedVaa;

  const { legacyRegisteredEmitterDerive } = overrides;

  let {
    payer,
    config,
    vaa,
    claim,
    registeredEmitter,
    recipientToken,
    payerToken,
    custodyToken,
    mint,
    custodyAuthority,
    rent,
    coreBridgeProgram,
  } = accounts;

  if (coreBridgeProgram === undefined) {
    coreBridgeProgram = coreBridgeProgramId(program);
  }

  if (config === undefined) {
    config = Config.address(programId);
  }

  if (vaa === undefined) {
    vaa = PostedVaaV1.address(coreBridgeProgram, Array.from(hash));
  }

  if (claim === undefined) {
    claim = Claim.address(
      programId,
      Array.from(emitterAddress),
      emitterChain,
      new BN(sequence.toString())
    );
  }

  if (registeredEmitter === undefined) {
    registeredEmitter = RegisteredEmitter.address(
      programId,
      emitterChain,
      legacyRegisteredEmitterDerive ? Array.from(emitterAddress) : undefined
    );
  }

  if (payerToken === undefined) {
    payerToken = getAssociatedTokenAddressSync(mint, payer);
  }

  if (custodyToken === undefined) {
    custodyToken = custodyTokenPda(programId, mint);
  }

  if (custodyAuthority === undefined) {
    custodyAuthority = custodyAuthorityPda(programId);
  }

  if (rent === undefined) {
    rent = SYSVAR_RENT_PUBKEY;
  }

  return {
    payer,
    config,
    vaa,
    claim,
    registeredEmitter,
    recipientToken,
    payerToken,
    custodyToken,
    mint,
    custodyAuthority,
    rent,
    coreBridgeProgram,
  };
}

export function legacyCompleteTransferNativeIx(
  program: TokenBridgeProgram,
  accounts: LegacyCompleteTransferNativeContext,
  parsedVaa: ParsedVaa,
  overrides: {
    legacyRegisteredEmitterDerive?: boolean;
  } = {}
) {
  let { legacyRegisteredEmitterDerive } = overrides;

  if (legacyRegisteredEmitterDerive === undefined) {
    legacyRegisteredEmitterDerive = true;
  }

  const {
    payer,
    config,
    vaa,
    claim,
    registeredEmitter,
    recipientToken,
    payerToken,
    custodyToken,
    mint,
    custodyAuthority,
    rent,
    coreBridgeProgram,
  } = legacyCompleteTransferNativeAccounts(program, accounts, parsedVaa, {
    legacyRegisteredEmitterDerive,
  });

  const keys: AccountMeta[] = [
    {
      pubkey: payer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: config!,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: vaa!,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: claim!,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: registeredEmitter!,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: recipientToken,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: payerToken!,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: custodyToken!,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: mint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: custodyAuthority!,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: rent!,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: coreBridgeProgram!,
      isWritable: false,
      isSigner: false,
    },
  ];

  const data = Buffer.alloc(1, 2);

  return new TransactionInstruction({
    keys,
    programId: program.programId,
    data,
  });
}