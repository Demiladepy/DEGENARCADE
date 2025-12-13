/*
    Prediction Market Module
    - Admin creates a market (e.g. "Lakers vs Warriors")
    - Users bet YES (Option A) or NO (Option B)
    - Admin resolves the market
    - Winners claim their share of the losing pool
*/
module degenarcade::prediction {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};
    use sui::event;

    // Errors
    const EMarketAlreadyResolved: u64 = 0;
    const EMarketNotResolved: u64 = 1;
    const ENotWinner: u64 = 2;
    const EInvalidOption: u64 = 3;

    // Events
    public struct MarketCreated has copy, drop {
        market_id: ID,
        description: vector<u8>
    }

    public struct BetPlaced has copy, drop {
        market_id: ID,
        user: address,
        amount: u64,
        is_option_a: bool // true = A, false = B
    }

    public struct MarketResolved has copy, drop {
        market_id: ID,
        winner_is_a: bool
    }

    // Market Object
    public struct Market has key, store {
        id: UID,
        description: vector<u8>,
        resolved: bool,
        winner_is_a: bool, // Set when resolved
        pool_a: Balance<SUI>, // Total bets on Option A
        pool_b: Balance<SUI>, // Total bets on Option B
        total_a_shares: u64,  // Track shares for payout calc
        total_b_shares: u64,
        bets: Table<address, BetInfo> // Track user bets
    }

    public struct BetInfo has store, drop {
        amount_a: u64,
        amount_b: u64,
        claimed: bool
    }

    // --- Admin ---

    public entry fun create_market(
        description: vector<u8>,
        ctx: &mut TxContext
    ) {
        let market = Market {
            id: object::new(ctx),
            description,
            resolved: false,
            winner_is_a: false,
            pool_a: balance::zero(),
            pool_b: balance::zero(),
            total_a_shares: 0,
            total_b_shares: 0,
            bets: table::new(ctx)
        };
        
        event::emit(MarketCreated {
            market_id: object::id(&market),
            description
        });

        transfer::share_object(market);
    }

    public entry fun resolve_market(
        _: &degenarcade::game::AdminCap, // Reuse AdminCap
        market: &mut Market,
        winner_is_a: bool,
        _ctx: &mut TxContext
    ) {
        assert!(!market.resolved, EMarketAlreadyResolved);
        market.resolved = true;
        market.winner_is_a = winner_is_a;

        event::emit(MarketResolved {
            market_id: object::id(market),
            winner_is_a
        });
    }

    // --- User ---

    public entry fun bet(
        market: &mut Market,
        wager: Coin<SUI>,
        is_option_a: bool,
        ctx: &mut TxContext
    ) {
        assert!(!market.resolved, EMarketAlreadyResolved);
        
        let amount = coin::value(&wager);
        let bettor = tx_context::sender(ctx);

        if (!table::contains(&market.bets, bettor)) {
            table::add(&mut market.bets, bettor, BetInfo { amount_a: 0, amount_b: 0, claimed: false });
        };

        let bet_info = table::borrow_mut(&mut market.bets, bettor);

        if (is_option_a) {
            balance::join(&mut market.pool_a, coin::into_balance(wager));
            market.total_a_shares = market.total_a_shares + amount;
            bet_info.amount_a = bet_info.amount_a + amount;
        } else {
            balance::join(&mut market.pool_b, coin::into_balance(wager));
            market.total_b_shares = market.total_b_shares + amount;
            bet_info.amount_b = bet_info.amount_b + amount;
        };

        event::emit(BetPlaced {
            market_id: object::id(market),
            user: bettor,
            amount,
            is_option_a
        });
    }

    public entry fun claim(
        market: &mut Market,
        ctx: &mut TxContext
    ) {
        assert!(market.resolved, EMarketNotResolved);
        
        let bettor = tx_context::sender(ctx);
        let bet_info = table::borrow_mut(&mut market.bets, bettor);
        assert!(!bet_info.claimed, ENotWinner); // Or already claimed

        let payout_amount: u64;

        if (market.winner_is_a) {
             assert!(bet_info.amount_a > 0, ENotWinner);
             // User share = (User Bet A / Total Bet A) * Total Pool (A + B)
             // simplified: (User A * (Pool A + Pool B)) / Total A
             let total_pool = balance::value(&market.pool_a) + balance::value(&market.pool_b);
             // Note: in a real claim, we would burn pool_a/b balances.
             // Here, let's keep it simple. We assume pool holds everything.
             payout_amount = (((bet_info.amount_a as u128) * (total_pool as u128)) / (market.total_a_shares as u128)) as u64;
        } else {
             assert!(bet_info.amount_b > 0, ENotWinner);
             let total_pool = balance::value(&market.pool_a) + balance::value(&market.pool_b);
             payout_amount = (((bet_info.amount_b as u128) * (total_pool as u128)) / (market.total_b_shares as u128)) as u64;
        };
        
        bet_info.claimed = true;
        
        // Take from pools? 
        // Logic simplification: We just need to take `payout_amount` from the Market object balance.
        // Wait, Market has `pool_a` and `pool_b`. We need to take from them proportionally? 
        // Actually, since resolved, we can just treat A and B as one big pot.
        // But `Balance` cannot be merged easily if defined separately in struct without cleanup.
        // Hack: Take from whichever has funds.
        
        let mut payout_balance = balance::zero<SUI>();
        
        // Drain from A first
        let val_a = balance::value(&market.pool_a);
        if (val_a > 0) {
            let take = if (val_a >= payout_amount) { payout_amount } else { val_a };
            balance::join(&mut payout_balance, balance::split(&mut market.pool_a, take));
        };
        
        // Drain rest from B
        let remaining = payout_amount - balance::value(&payout_balance);
        if (remaining > 0) {
             balance::join(&mut payout_balance, balance::split(&mut market.pool_b, remaining));
        };

        let reward = coin::from_balance(payout_balance, ctx);
        transfer::public_transfer(reward, bettor);
    }
}
