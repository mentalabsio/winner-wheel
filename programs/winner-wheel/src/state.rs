use anchor_lang::prelude::*;

use crate::error::CasinoError;

#[derive(Debug, Clone, Copy, AnchorSerialize, AnchorDeserialize)]
pub enum BetResult {
    Retry,
    LoseAll,
    Duplicate,
    Triplicate,
}

#[account]
pub struct BetProof {
    pub version: u8,
    pub user: Pubkey,
    pub house: Pubkey,
    pub amount: u64,
    pub result: Option<BetResult>,
    _reserved: [u8; 32],
}

impl BetProof {
    pub const PREFIX: &'static [u8] = b"betproof";
    pub const LEN: usize = 1 + 32 + 32 + 8 + 2 + 32;

    pub fn new(user: Pubkey, house: Pubkey, amount: u64) -> Self {
        Self {
            user,
            house,
            amount,
            version: 0,
            result: None,
            _reserved: [0; 32],
        }
    }
}

#[account]
pub struct House {
    pub version: u8,
    /// Numerical unique ID (range 0-65535)
    pub id: u16,
    /// Account where the prizes are taken from.
    pub treasury_account: Pubkey,
    /// Fee price in basis points. This will be charged on every bet proof creation for every
    /// account passed as fee vault.
    pub fee_basis_points: u16,
    /// Wallet allowed to withdraw and deposit from vaults.
    pub authority: Pubkey,
    /// Vaults (2) to where the fees go.
    pub fee_vaults: [Pubkey; 2],
    bump: [u8; 1],
    _reserved: [u8; 64],
}

impl House {
    pub const PREFIX: &'static [u8] = b"house";
    pub const LEN: usize = 1 + 2 + 32 + 2 + 32 + (4 + 32 * 2) + 1 + 64;

    pub fn new(
        id: u16,
        authority: Pubkey,
        fee_basis_points: u16,
        treasury_account: Pubkey,
        house_fee_vaults: [Pubkey; 2],
        bump: u8,
    ) -> Self {
        Self {
            version: 0,
            id,
            authority,
            fee_basis_points,
            treasury_account,
            fee_vaults: house_fee_vaults,
            bump: [bump],
            _reserved: [0u8; 64],
        }
    }

    pub fn calculate_fee(&self, amount: u64) -> Result<u64> {
        let basis_points = self.fee_basis_points as u64;
        // bps * amount / 10_000
        // 0.05$SOL * 125bps = 1.25% * 50_000_000 = 125 * 50kk / 10_000
        basis_points
            .checked_mul(amount)
            .and_then(|n| n.checked_div(10_000))
            .ok_or_else(|| error!(CasinoError::ArithmeticError))
    }
}

#[account]
pub struct Vault {
    pub house: Pubkey,
    pub bump: [u8; 1],
}

impl Vault {
    pub const PREFIX: &'static [u8] = b"vault";
    pub const LEN: usize = 32 + 1;
}
