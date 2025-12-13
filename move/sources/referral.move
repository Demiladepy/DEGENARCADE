
/*
    Referral System
    - Users register a referrer (on-chain or off-chain indexer, here on-chain for demo)
    - Referrer gets credit
    - Every 5 referrals -> Claim Reward
*/
module degenarcade::referral_system {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};
    use sui::event;

    const EAlreadyRegistered: u64 = 0;
    const ENotEnoughReferrals: u64 = 1;
    const EInsufficientFunds: u64 = 2;

    public struct ReferralPool has key {
        id: UID,
        balance: Balance<SUI>,
        referrals: Table<address, u64>, // Address -> Count of people they referred
        registry: Table<address, address> // User -> Who referred them
    }

    public struct AdminCap has key, store { id: UID }

    // Events
    public struct ReferralRegistered has copy, drop {
        user: address,
        referrer: address
    }

    public struct RewardClaimed has copy, drop {
        referrer: address,
        amount: u64
    }

    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCap { id: object::new(ctx) }, tx_context::sender(ctx));
        transfer::share_object(ReferralPool {
            id: object::new(ctx),
            balance: balance::zero(),
            referrals: table::new(ctx),
            registry: table::new(ctx)
        });
    }

    public entry fun fund(pool: &mut ReferralPool, coin: Coin<SUI>, _ctx: &mut TxContext) {
        balance::join(&mut pool.balance, coin::into_balance(coin));
    }

    public entry fun register(
        pool: &mut ReferralPool,
        referrer: address,
        ctx: &mut TxContext
    ) {
        let user = tx_context::sender(ctx);
        assert!(!table::contains(&pool.registry, user), EAlreadyRegistered);
        
        // Cannot refer self
        if (user == referrer) return;

        table::add(&mut pool.registry, user, referrer);

        // Increment referrer count
        if (!table::contains(&pool.referrals, referrer)) {
            table::add(&mut pool.referrals, referrer, 0);
        };
        let count = table::borrow_mut(&mut pool.referrals, referrer);
        *count = *count + 1;

        event::emit(ReferralRegistered { user, referrer });
    }

    public entry fun claim_reward(
        pool: &mut ReferralPool,
        ctx: &mut TxContext
    ) {
        let referrer = tx_context::sender(ctx);
        
        // Check count
        if (!table::contains(&pool.referrals, referrer)) {
            abort ENotEnoughReferrals
        };

        let count = table::borrow_mut(&mut pool.referrals, referrer);
        assert!(*count >= 5, ENotEnoughReferrals);

        // Payout 10 SUI (10 * 10^9)
        let reward_amt = 10_000_000_000;
        assert!(balance::value(&pool.balance) >= reward_amt, EInsufficientFunds);

        // Deduct 5 referrals (so they can earn again)
        *count = *count - 5;

        // Transfer
        let reward_coin = coin::take(&mut pool.balance, reward_amt, ctx);
        transfer::public_transfer(reward_coin, referrer);

        event::emit(RewardClaimed { referrer, amount: reward_amt });
    }
}
