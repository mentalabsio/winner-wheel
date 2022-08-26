use anchor_lang::{
    prelude::*,
    system_program::{self, Transfer},
};

use crate::error::CasinoError;

pub fn transfer<'info>(
    amount: u64,
    from: AccountInfo<'info>,
    to: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
) -> Result<()> {
    let cpi_ctx = CpiContext::new(system_program, Transfer { from, to });
    system_program::transfer(cpi_ctx, amount)
}

pub fn pda_transfer(amount: u64, from_pda: AccountInfo, to: AccountInfo) -> Result<()> {
    **from_pda.try_borrow_mut_lamports()? = from_pda
        .lamports()
        .checked_sub(amount)
        .ok_or(CasinoError::ArithmeticError)?;

    **to.try_borrow_mut_lamports()? = to
        .lamports()
        .checked_add(amount)
        .ok_or(CasinoError::ArithmeticError)?;

    Ok(())
}
