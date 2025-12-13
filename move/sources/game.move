/*
  Degen Arcade: Double-or-Nothing Coin Flip using Sui Randomness (VRF)
*/
module degenarcade::game {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::random::{Self, Random};
    use sui::event;

    // --- Errors ---
    const EHouseInsufficientBalance: u64 = 0;
    const EInvalidBetAmount: u64 = 1;

    // --- Events ---
    public struct GameResult has copy, drop {
        player: address,
        won: bool,
        amount: u64,
    }

    // --- State ---
    
    // The House Pool holds the SUI for payouts
    public struct HousePool has key {
        id: UID,
        balance: Balance<SUI>
    }

    // Admin Capability to fund/withdraw
    public struct AdminCap has key {
        id: UID
    }

    fun init(ctx: &mut TxContext) {
        let pool = HousePool {
            id: object::new(ctx),
            balance: balance::zero()
        };
        transfer::share_object(pool);

        let admin_cap = AdminCap {
            id: object::new(ctx)
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // --- Gameplay ---

    // Entry function to play the game
    entry fun play(
        pool: &mut HousePool, 
        wager: Coin<SUI>, 
        choice: bool, // true = heads, false = tails (user choice is mostly simplified here to just "coin flip")
        // actually, simpler: User just bets. If coin matches choice they win.
        // For physics simplicity "Heads" button calls play(true), "Tails" calls play(false).
        chosen_side: bool,
        r: &Random, 
        ctx: &mut TxContext
    ) {
        let bet_amount = coin::value(&wager);
        let pool_balance = balance::value(&pool.balance);

        // Max payout is 2x wager. Ensure house can cover it.
        assert!(pool_balance >= bet_amount, EHouseInsufficientBalance);

        // Generates a secure random boolean
        let mut generator = random::new_generator(r, ctx);
        let coin_side = random::generate_bool(&mut generator);

        let is_winner = (coin_side == chosen_side);
        let player = tx_context::sender(ctx);

        if (is_winner) {
            // User gets their wager back + equal amount from house
            let win_balance = balance::split(&mut pool.balance, bet_amount);
            let mut reward_coin = coin::from_balance(win_balance, ctx);
            
            // Join the reward with the original wager
            coin::join(&mut reward_coin, wager);
            
            transfer::public_transfer(reward_coin, player);
        } else {
            // House keeps the wager
            let wager_balance = coin::into_balance(wager);
            balance::join(&mut pool.balance, wager_balance);
        };

        event::emit(GameResult {
            player,
            won: is_winner,
            amount: bet_amount
        });
    }

    // --- Admin ---

    public entry fun deposit(pool: &mut HousePool, cash: Coin<SUI>, _ctx: &mut TxContext) {
        let balance = coin::into_balance(cash);
        balance::join(&mut pool.balance, balance);
    }

    public entry fun withdraw(
        _: &AdminCap, 
        pool: &mut HousePool, 
        amount: u64, 
        ctx: &mut TxContext
    ) {
        let cash = coin::take(&mut pool.balance, amount, ctx);
        transfer::public_transfer(cash, tx_context::sender(ctx));
    }
}
