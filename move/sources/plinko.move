
/*
    Plinko Game Module
    - User sends SUI + bet details
    - Contract uses Randomness to determine multiplier
    - Payout = Bet * Multiplier
*/
module degenarcade::plinko {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::random::{Self, Random};
    use sui::event;

    // Errors
    const EInsufficientHouseBalance: u64 = 0;

    // Admin Cap Reuse? Or new one. Let's create a specific one for clarity or reuse existing package pattern.
    // For simplicity, defining a local AdminCap.
    public struct AdminCap has key, store { id: UID }

    public struct PlinkoPool has key {
        id: UID,
        balance: Balance<SUI>
    }

    // Events
    public struct PlinkoResult has copy, drop {
        player: address,
        wager: u64,
        multiplier: u64, // scaled x 100 (e.g. 150 = 1.5x)
        payout: u64
    }

    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCap { id: object::new(ctx) }, tx_context::sender(ctx));
        transfer::share_object(PlinkoPool {
            id: object::new(ctx),
            balance: balance::zero()
        });
    }

    // HOUSE FUNCTIONS
    public entry fun fund(pool: &mut PlinkoPool, coin: Coin<SUI>, _ctx: &mut TxContext) {
        balance::join(&mut pool.balance, coin::into_balance(coin));
    }

    public entry fun withdraw(
        _: &AdminCap, 
        pool: &mut PlinkoPool, 
        amount: u64, 
        ctx: &mut TxContext
    ) {
        let coin = coin::take(&mut pool.balance, amount, ctx);
        transfer::public_transfer(coin, tx_context::sender(ctx));
    }

    // GAMEPLAY
    public entry fun play(
        pool: &mut PlinkoPool, 
        wager: Coin<SUI>, 
        r: &Random, 
        ctx: &mut TxContext
    ) {
        let wager_amount = coin::value(&wager);
        let pool_val = balance::value(&pool.balance);
        
        // Take wager into house pool first
        balance::join(&mut pool.balance, coin::into_balance(wager));

        let mut generator = random::new_generator(r, ctx);
        // Generate a random number 0-100 to pick a bucket
        let roll = random::generate_u8_in_range(&mut generator, 0, 100);

        // Simple Plinko Distribution (Bell Curve-ish)
        // 0-5: 10x
        // 5-15: 5x
        // 15-30: 3x
        // 30-50: 0.5x (LOSS)
        // 50-70: 0.3x (LOSS)
        // 70-85: 3x
        // 85-95: 5x
        // 95-100: 10x
        
        // Multiplier x 100
        let multiplier: u64 = if (roll < 5 || roll >= 95) { 1000 } // 10x
            else if (roll < 15 || roll >= 85) { 500 } // 5x
            else if (roll < 30 || roll >= 70) { 150 } // 1.5x
            else if (roll < 50) { 50 } // 0.5x
            else { 30 }; // 0.3x

        let payout = (wager_amount * multiplier) / 100;

        if (payout > 0) {
            // Check solvency (if house strictly cannot pay, we might revert or cap payout)
            // For now, assert house has enough (minus the wager we just put in, which is already there)
            assert!(balance::value(&pool.balance) >= payout, EInsufficientHouseBalance);
            
            let win_coin = coin::take(&mut pool.balance, payout, ctx);
            transfer::public_transfer(win_coin, tx_context::sender(ctx));
        };

        event::emit(PlinkoResult {
            player: tx_context::sender(ctx),
            wager: wager_amount,
            multiplier,
            payout
        });
    }
}
