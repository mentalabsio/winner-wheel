import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { WinnerWheel } from "../target/types/winner_wheel";

describe("winner-wheel", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.WinnerWheel as Program<WinnerWheel>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
