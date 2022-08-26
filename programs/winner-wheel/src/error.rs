use anchor_lang::prelude::*;

#[error_code]
pub enum CasinoError {
    #[msg("An arithmetic error occurred.")]
    ArithmeticError,

    #[msg("Cannot change a result twice.")]
    ResultIsAlreadySet,

    #[msg("Bet result was not set yet.")]
    ResultNotSet,
}
