use anchor_lang::{
    prelude::*,
    system_program::{self, Transfer},
};

pub fn transfer<'info>(
    amount: u64,
    from: AccountInfo<'info>,
    to: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    seeds: &[&[u8]],
) -> Result<()> {
    let cpi_ctx = CpiContext::new(system_program, Transfer { from, to });
    system_program::transfer(cpi_ctx.with_signer(&[seeds]), amount)
}

pub fn pda_transfer<'info>(
    amount: u64,
    from_pda: AccountInfo<'info>,
    to: AccountInfo<'info>,
) -> Result<()> {
    **from_pda.try_borrow_mut_lamports()? -= amount;
    **to.try_borrow_mut_lamports()? += amount;
    Ok(())
}
