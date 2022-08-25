use anchor_lang::prelude::*;

use crate::state::*;
use crate::utils;

#[derive(Accounts)]
#[instruction(house_id: u16)]
pub struct InitializeHouse<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + House::LEN,
        seeds = [
            House::PREFIX,
            authority.key().as_ref(),
            &house_id.to_le_bytes(),
        ],
        bump
    )]
    pub house: Account<'info, House>,

    #[account(mut)]
    // TODO: Turn into PDA
    pub treasury_account: SystemAccount<'info>,

    // TODO: Turn into PDA
    pub vault_one: SystemAccount<'info>,

    // TODO: Turn into PDA
    pub vault_two: SystemAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitializeHouse<'info> {
    pub fn handler(
        ctx: Context<InitializeHouse>,
        id: u16,
        funds: u64,
        fee_basis_points: u16,
    ) -> Result<()> {
        let bump = *ctx.bumps.get("house").unwrap();

        *ctx.accounts.house = House::new(
            id,
            ctx.accounts.authority.key(),
            fee_basis_points,
            ctx.accounts.treasury_account.key(),
            [ctx.accounts.vault_one.key(), ctx.accounts.vault_two.key()],
            bump,
        );

        utils::transfer(
            funds,
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.treasury_account.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateBetProof<'info> {
    pub house: Account<'info, House>,

    #[account(
        init,
        payer = user,
        space = 8 + BetProof::LEN,
        seeds = [
            BetProof::PREFIX,
            house.key().as_ref(),
            user.key().as_ref(),
        ],
        bump
    )]
    pub bet_proof: Account<'info, BetProof>,

    #[account(address = house.fee_vaults[0])]
    pub fee_vault_one: SystemAccount<'info>,

    #[account(address = house.fee_vaults[1])]
    pub fee_vault_two: SystemAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreateBetProof<'info> {
    pub fn handler(ctx: Context<Self>, amount: u64) -> Result<()> {
        ctx.accounts.charge_fees(amount)?;

        *ctx.accounts.bet_proof = BetProof::new(
            ctx.accounts.user.key(),
            ctx.accounts.house.key(),
            amount,
            BetResult::Unset,
        );

        Ok(())
    }

    fn charge_fees(&self, amount: u64) -> Result<()> {
        let fee = self.house.calculate_fee(amount)?;

        utils::transfer(
            fee,
            self.user.to_account_info(),
            self.fee_vault_one.to_account_info(),
            self.system_program.to_account_info(),
        )?;

        utils::transfer(
            fee,
            self.user.to_account_info(),
            self.fee_vault_two.to_account_info(),
            self.system_program.to_account_info(),
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct ClaimBet<'info> {
    #[account(address = bet_proof.house)]
    pub house: Account<'info, House>,

    #[account(
        mut,
        close = user,
        has_one = user,
    )]
    pub bet_proof: Account<'info, BetProof>,

    #[account(mut)]
    pub user: Signer<'info>,
}

impl<'info> ClaimBet<'info> {
    pub fn handler(_ctx: Context<Self>) -> Result<()> {
        Ok(())
    }
}
