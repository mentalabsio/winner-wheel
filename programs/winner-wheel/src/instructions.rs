use anchor_lang::prelude::*;

use crate::error::CasinoError;
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

    #[account(
        init,
        payer = authority,
        space = 8 + Vault::LEN,
        seeds = [
            Vault::PREFIX,
            b"treasury",
            house.key().as_ref(),
        ],
        bump
    )]
    pub treasury: Account<'info, Vault>,

    #[account(
        init,
        payer = authority,
        space = 8 + Vault::LEN,
        seeds = [
            Vault::PREFIX,
            b"vault_one",
            house.key().as_ref(),
        ],
        bump
    )]
    pub vault_one: Account<'info, Vault>,

    #[account(
        init,
        payer = authority,
        space = 8 + Vault::LEN,
        seeds = [
            Vault::PREFIX,
            b"vault_two",
            house.key().as_ref(),
        ],
        bump
    )]
    pub vault_two: Account<'info, Vault>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitializeHouse<'info> {
    #[inline(always)]
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
            ctx.accounts.treasury.key(),
            [ctx.accounts.vault_one.key(), ctx.accounts.vault_two.key()],
            bump,
        );

        {
            // Initialize vaults
            *ctx.accounts.treasury = Vault {
                house: ctx.accounts.house.key(),
                bump: [*ctx.bumps.get("treasury").unwrap()],
            };

            *ctx.accounts.vault_one = Vault {
                house: ctx.accounts.house.key(),
                bump: [*ctx.bumps.get("vault_one").unwrap()],
            };

            *ctx.accounts.vault_one = Vault {
                house: ctx.accounts.house.key(),
                bump: [*ctx.bumps.get("vault_two").unwrap()],
            };
        }

        // Add funds to treasury account.
        utils::transfer(
            funds,
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.treasury.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            &[],
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

    #[account(mut, address = house.fee_vaults[0])]
    pub fee_vault_one: Account<'info, Vault>,

    #[account(mut, address = house.fee_vaults[1])]
    pub fee_vault_two: Account<'info, Vault>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreateBetProof<'info> {
    #[inline(always)]
    pub fn handler(ctx: Context<Self>, amount: u64) -> Result<()> {
        // Update amount to `amount - fee`
        let amount = ctx.accounts.charge_fees(amount)?;

        *ctx.accounts.bet_proof =
            BetProof::new(ctx.accounts.user.key(), ctx.accounts.house.key(), amount);

        Ok(())
    }

    fn charge_fees(&mut self, amount: u64) -> Result<u64> {
        let fee = self.house.calculate_fee(amount)?;

        utils::transfer(
            fee,
            self.user.to_account_info(),
            self.fee_vault_one.to_account_info(),
            self.system_program.to_account_info(),
            &[],
        )?;

        utils::transfer(
            fee,
            self.user.to_account_info(),
            self.fee_vault_two.to_account_info(),
            self.system_program.to_account_info(),
            &[],
        )?;

        Ok(amount - (fee * 2))
    }
}

#[derive(Accounts)]
pub struct SetBetResult<'info> {
    #[account(
        mut,
        has_one = house,
    )]
    pub bet_proof: Account<'info, BetProof>,

    #[account(
        has_one = authority
    )]
    pub house: Account<'info, House>,

    pub authority: Signer<'info>,
}

impl<'info> SetBetResult<'info> {
    #[inline(always)]
    pub fn handler(ctx: Context<Self>, result: BetResult) -> Result<()> {
        match ctx.accounts.bet_proof.result {
            Some(_) => err!(CasinoError::ResultIsAlreadySet),
            #[allow(clippy::unit_arg)]
            None => Ok(ctx.accounts.bet_proof.result = Some(result)),
        }
    }
}

#[derive(Accounts)]
pub struct ClaimBet<'info> {
    #[account(has_one = treasury)]
    pub house: Account<'info, House>,

    #[account(
        mut,
        close = user,
        has_one = user,
        has_one = house,
    )]
    pub bet_proof: Account<'info, BetProof>,

    #[account(mut, has_one = house)]
    pub treasury: Account<'info, Vault>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> ClaimBet<'info> {
    #[inline(always)]
    pub fn handler(ctx: Context<Self>) -> Result<()> {
        let bet_proof = &mut ctx.accounts.bet_proof;

        require!(bet_proof.result.is_some(), CasinoError::ResultNotSet);

        let amount = match bet_proof.result.unwrap() {
            BetResult::LoseAll => 0,
            BetResult::Retry => bet_proof.amount,
            BetResult::Duplicate => bet_proof.amount * 2,
            BetResult::Triplicate => bet_proof.amount * 3,
        };

        utils::pda_transfer(
            amount,
            ctx.accounts.treasury.to_account_info(),
            ctx.accounts.user.to_account_info(),
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct WithdrawTreasury<'info> {
    #[account(has_one = authority)]
    pub house: Account<'info, House>,

    #[account(
        mut,
        seeds = [
            Vault::PREFIX,
            b"treasury",
            house.key().as_ref(),
        ],
        bump
    )]
    pub treasury: Account<'info, Vault>,

    #[account(mut)]
    pub receiver: SystemAccount<'info>,

    pub authority: Signer<'info>,
}

impl<'info> WithdrawTreasury<'info> {
    pub fn handler(ctx: Context<Self>, amount: u64) -> Result<()> {
        utils::pda_transfer(
            amount,
            ctx.accounts.treasury.to_account_info(),
            ctx.accounts.receiver.to_account_info(),
        )
    }
}

#[derive(Accounts)]
pub struct SweepVaults<'info> {
    #[account(has_one = authority)]
    pub house: Account<'info, House>,

    #[account(
        mut,
        seeds = [
            Vault::PREFIX,
            b"vault_one",
            house.key().as_ref(),
        ],
        bump
    )]
    pub vault_one: Account<'info, Vault>,

    #[account(
        mut,
        seeds = [
            Vault::PREFIX,
            b"vault_two",
            house.key().as_ref(),
        ],
        bump
    )]
    pub vault_two: Account<'info, Vault>,

    #[account(mut)]
    pub receiver: SystemAccount<'info>,

    pub authority: Signer<'info>,
}

impl<'info> SweepVaults<'info> {
    pub fn handler(ctx: Context<Self>) -> Result<()> {
        let sweep = |vault: AccountInfo| -> Result<_> {
            utils::pda_transfer(
                **vault.try_borrow_lamports()?,
                vault.to_account_info(),
                ctx.accounts.receiver.to_account_info(),
            )
        };

        sweep(ctx.accounts.vault_one.to_account_info())?;
        sweep(ctx.accounts.vault_two.to_account_info())?;

        Ok(())
    }
}
