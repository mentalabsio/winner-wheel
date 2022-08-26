use anchor_lang::prelude::*;

#[error_code]
pub enum CasinoError {
    #[msg("An arithmetic error occurred.")]
    ArithmeticError,

    #[msg("Cannot change a result twice.")]
    ResultIsAlreadySet,
}
