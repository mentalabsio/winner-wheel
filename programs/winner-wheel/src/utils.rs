use anchor_lang::{
    prelude::*,
    system_program::{self, Transfer},
};

pub fn transfer<'info>(
    amount: u64,
    from: AccountInfo<'info>,
    to: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
) -> Result<()> {
    let cpi_accounts = Transfer { from, to };
    let cpi_ctx = CpiContext::new(system_program, cpi_accounts);
    system_program::transfer(cpi_ctx, amount)
}
