import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LittleBitesEvents } from "../target/types/little_bites_events";

describe("little-bites-events", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.LittleBitesEvents as Program<LittleBitesEvents>;

  const gameKeypair = anchor.web3.Keypair.generate()
  const playerOne = (program.provider as anchor.AnchorProvider).wallet
  const playerTwo = anchor.web3.Keypair.generate()

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .initialize({ heads: {} })
      .accounts({
        game: gameKeypair.publicKey,
        player: playerOne.publicKey
      })
      .signers([gameKeypair])
      .rpc();
    console.log("Your transaction signature", tx);

    let gameState = await program.account.game.fetch(gameKeypair.publicKey)

    console.log("Game state", JSON.stringify(gameState, null, 2))
  });
});
