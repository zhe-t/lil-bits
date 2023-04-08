use anchor_lang::prelude::*;

declare_id!("E12wjANt2B7oUzucZ6jnfoLbymFmtC3UhUQn7HPaBrGr");

// Let's create a psuedo-coinflip game (without the randomness)
// We'll emit an event when the game is finished

#[program]
pub mod little_bites_events {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>, 
        prediction: Coinside
    ) -> Result<()> {
        ctx.accounts.game.start(ctx.accounts.player.key(), prediction)?;
        Ok(())
    }

    pub fn flip(ctx: Context<Flip>) -> Result<()> {
        ctx.accounts.game.flip()?;
        Ok(())
    }
}

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Copy,
    Clone,
    PartialEq,
    Eq
)]
pub enum Coinside {
    Heads,
    Tails,
}

#[error_code]
pub enum ErrorCode {
    GameAlreadyStarted
}

#[event]
pub struct GameResult {
    pub player: Pubkey,
    pub prediction: Coinside,
    pub result: Coinside,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = player, space = 8 + Game::MAXIMUM_SIZE)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Flip<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[account]
pub struct Game {
    pub prediction: Coinside,       // 2
    pub result: Option<Coinside>,   // 3
    pub player: Pubkey,             // 32
}

impl Game {
    pub const MAXIMUM_SIZE: usize = 2 + 3 + 32;

    pub fn start(
        &mut self,
        player: Pubkey,
        prediction: Coinside
    ) -> Result<()> {
        require!(self.is_active(), ErrorCode::GameAlreadyStarted);
        self.player = player;
        self.prediction = prediction;
        self.result = None;
        Ok(())
    }

    pub fn is_active(&self) -> bool {
        self.result.is_none()
    }

    pub fn flip(&mut self) -> Result<()> {
        require!(self.is_active(), ErrorCode::GameAlreadyStarted);

        // TODO: Randomize! This is just a demo
        self.result = Some(Coinside::Tails); 

        emit!(GameResult {
            player: self.player,
            prediction: self.prediction,
            result: self.result.unwrap(),
        });

        Ok(())
    }
}