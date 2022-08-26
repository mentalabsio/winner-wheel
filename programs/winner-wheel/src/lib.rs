use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

mod error;
mod instructions;
mod state;
mod utils;

use instructions::*;

#[program]
pub mod winner_wheel {
    use super::*;

    pub fn initialize_house(
        ctx: Context<InitializeHouse>,
        id: u16,
        funds: u64,
        fee_basis_points: u16,
    ) -> Result<()> {
        instructions::InitializeHouse::handler(ctx, id, funds, fee_basis_points)
    }

    pub fn create_bet_proof(ctx: Context<CreateBetProof>, bet_value: u64) -> Result<()> {
        instructions::CreateBetProof::handler(ctx, bet_value)
    }

    pub fn claim_bet(ctx: Context<ClaimBet>) -> Result<()> {
        instructions::ClaimBet::handler(ctx)
    }

    pub fn withdraw_treasury(ctx: Context<WithdrawTreasury>, amount: u64) -> Result<()> {
        instructions::WithdrawTreasury::handler(ctx, amount)
    }

    pub fn sweep_vaults(ctx: Context<SweepVaults>) -> Result<()> {
        instructions::SweepVaults::handler(ctx)
    }
}
