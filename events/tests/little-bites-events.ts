import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import { LittleBitesEvents } from "../target/types/little_bites_events";

interface GameResultEvent {
  player: anchor.web3.PublicKey;
  prediction: { heads: {}, tails: {} };
  result: { heads: {}, tails: {} };
}

describe("events-example", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .LittleBitesEvents as Program<LittleBitesEvents>;

  const gameKeypair = anchor.web3.Keypair.generate();
  const player = (program.provider as anchor.AnchorProvider).wallet;

  it('Subscribe to GameResult event', async () => {

    program.addEventListener('GameResult', (event, _slot, _sig) => {
      // event is 'any' type, cast to type/interface in TS
      const gameResultEvent = event as GameResultEvent;
      console.log("GameResult event", JSON.stringify(gameResultEvent, null, 2));
    });

  });

  it("Initialize game", async () => {

    await program.methods
      .initialize({ heads: {} })
      .accounts({
        game: gameKeypair.publicKey,
        player: player.publicKey,
      })
      .signers([ gameKeypair ])
      .rpc();

    let gameState = await program.account.game.fetch(gameKeypair.publicKey);

    console.log("Initial game state", JSON.stringify(gameState, null, 2));
    expect(gameState.prediction).to.eql({ heads: {} });
    expect(gameState.player).to.eql(player.publicKey);
    expect(gameState.result).to.eql(null);

  });

  it("Flip coin", async () => {

    await program.methods
      .flip()
      .accounts({
        game: gameKeypair.publicKey,
        player: player.publicKey,
      })
      .rpc();

    let gameState = await program.account.game.fetch(gameKeypair.publicKey);

    console.log("Final game state", JSON.stringify(gameState, null, 2));
    expect(gameState.prediction).to.eql({ heads: {} });
    expect(gameState.player).to.eql(player.publicKey);
    expect(gameState.result).to.not.eql(null);
    expect(gameState.result).to.eql({ tails: {} });

  });
});
