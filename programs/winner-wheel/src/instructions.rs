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
            [ctx.accounts.vault_one.key(), ctx.accounts.vault_two.key()],
            bump,
        );

        let house_key = ctx.accounts.house.key();

        *ctx.accounts.vault_one = Vault {
            house: house_key,
            bump: [*ctx.bumps.get("vault_one").unwrap()],
        };

        *ctx.accounts.vault_two = Vault {
            house: house_key,
            bump: [*ctx.bumps.get("vault_two").unwrap()],
        };

        utils::transfer(
            funds,
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.house.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateBetProof<'info> {
    #[account(mut)]
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
        ctx.accounts.charge_fees(amount)?;

        // this is probably random enough
        let i = Clock::get()?.unix_timestamp / 14 % 12;

        // 1/12 -> 3x
        // 3/12 -> 2x
        // 3/12 -> Retry
        // 5/12 -> 0
        let result = match i {
            0 => BetResult::Triplicate,
            1..=3 => BetResult::Duplicate,
            4..=6 => BetResult::Retry,
            _ => BetResult::LoseAll,
        };

        utils::transfer(
            amount,
            ctx.accounts.user.to_account_info(),
            ctx.accounts.house.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        )?;

        *ctx.accounts.bet_proof = BetProof::new(
            ctx.accounts.user.key(),
            ctx.accounts.house.key(),
            amount,
            result,
        );

        Ok(())
    }

    fn charge_fees(&mut self, amount: u64) -> Result<()> {
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
    #[account(mut)]
    pub house: Account<'info, House>,

    #[account(
        mut,
        close = user,
        has_one = user,
        has_one = house,
    )]
    pub bet_proof: Account<'info, BetProof>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> ClaimBet<'info> {
    #[inline(always)]
    pub fn handler(ctx: Context<Self>) -> Result<()> {
        let bet_proof = &mut ctx.accounts.bet_proof;

        let amount = match bet_proof.result {
            BetResult::LoseAll => 0,
            BetResult::Retry => bet_proof.amount,
            BetResult::Duplicate => bet_proof.amount * 2,
            BetResult::Triplicate => bet_proof.amount * 3,
        };

        utils::pda_transfer(
            amount,
            ctx.accounts.house.to_account_info(),
            ctx.accounts.user.to_account_info(),
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct WithdrawTreasury<'info> {
    #[account(mut, has_one = authority)]
    pub house: Account<'info, House>,

    #[account(mut)]
    pub receiver: SystemAccount<'info>,

    pub authority: Signer<'info>,
}

impl<'info> WithdrawTreasury<'info> {
    pub fn handler(ctx: Context<Self>, amount: u64) -> Result<()> {
        utils::pda_transfer(
            amount,
            ctx.accounts.house.to_account_info(),
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
            let balance = **vault.try_borrow_lamports()?;
            utils::pda_transfer(
                balance,
                vault.to_account_info(),
                ctx.accounts.receiver.to_account_info(),
            )
        };

        sweep(ctx.accounts.vault_one.to_account_info())?;
        sweep(ctx.accounts.vault_two.to_account_info())?;

        Ok(())
    }
}
