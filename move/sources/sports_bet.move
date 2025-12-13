/*
    Sports Bet Module - Ticket Based Architecture
    - User places bet -> Receives BetTicket (NFT)
    - Oracle resolves match -> User burns BetTicket for payout
*/
module degenarcade::sports_bet {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::event;

    // Errors
    const EInvalidOdds: u64 = 0;
    const EUnauthorized: u64 = 1;
    const EInsufficientHouseBalance: u64 = 2;

    // Capabilities
    public struct AdminCap has key, store { id: UID }
    public struct OracleCap has key, store { id: UID }

    // House Pool (Shared Object)
    public struct HousePool has key {
        id: UID,
        balance: Balance<SUI>
    }

    // The Bet Ticket (User owned object)
    public struct BetTicket has key, store {
        id: UID,
        match_id: vector<u8>,
        selection: vector<u8>, // "HOME", "AWAY", "DRAW"
        amount: u64,
        odds: u64, // Multiplier x 100 (e.g. 1.5x = 150)
        timestamp: u64
    }

    // Events
    public struct BetPlaced has copy, drop {
        ticket_id: ID,
        user: address,
        match_id: vector<u8>,
        selection: vector<u8>,
        amount: u64,
        odds: u64
    }

    public struct BetResolved has copy, drop {
        ticket_id: ID,
        user: address,
        won: bool,
        payout: u64
    }

    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCap { id: object::new(ctx) }, tx_context::sender(ctx));
        transfer::transfer(OracleCap { id: object::new(ctx) }, tx_context::sender(ctx));
        
        transfer::share_object(HousePool {
            id: object::new(ctx),
            balance: balance::zero()
        });
    }

    // --- Admin ---
    public entry fun fund_house(pool: &mut HousePool, coin: Coin<SUI>, _ctx: &mut TxContext) {
        balance::join(&mut pool.balance, coin::into_balance(coin));
    }

    public entry fun withdraw_house(
        _: &AdminCap, 
        pool: &mut HousePool, 
        amount: u64, 
        ctx: &mut TxContext
    ) {
        let coin = coin::take(&mut pool.balance, amount, ctx);
        transfer::public_transfer(coin, tx_context::sender(ctx));
    }

    // --- User ---
    public entry fun place_bet(
        pool: &mut HousePool, // Passed just to check solvency, though strictly not needed if we trust house will fund later.
        wager: Coin<SUI>,
        match_id: vector<u8>,
        selection: vector<u8>,
        odds: u64,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&wager);
        let potential_payout = (amount * odds) / 100;
        
        // Ensure house has enough to cover potential win? 
        // For high volume, we might allow fractional reserves, but for Hackathon, safe is better.
        assert!(balance::value(&pool.balance) >= potential_payout, EInsufficientHouseBalance);

        // We take the wager into the House Pool immediately? 
        // OR we wrap it in the ticket?
        // "Ticket Based" usually implies funds move to House or Escrow.
        // Let's move funds to House Pool. If they likely win, we pay from Pool.
        balance::join(&mut pool.balance, coin::into_balance(wager));

        let ticket = BetTicket {
            id: object::new(ctx),
            match_id,
            selection,
            amount,
            odds,
            timestamp: tx_context::epoch(ctx)
        };

        event::emit(BetPlaced {
            ticket_id: object::id(&ticket),
            user: tx_context::sender(ctx),
            match_id,
            selection,
            amount,
            odds
        });

        transfer::public_transfer(ticket, tx_context::sender(ctx));
    }

    // --- Oracle ---
    public entry fun resolve_bet(
        _oracle: &OracleCap,
        pool: &mut HousePool,
        ticket: BetTicket,
        winning_selection: vector<u8>,
        ctx: &mut TxContext
    ) {
        let BetTicket { id, match_id: _, selection, amount, odds, timestamp: _ } = ticket;
        
        let is_winner = (selection == winning_selection);
        let user = tx_context::sender(ctx);
        let payout: u64 = if (is_winner) { (amount * odds) / 100 } else { 0 };

        if (is_winner) {
            let win_coin = coin::take(&mut pool.balance, payout, ctx);
            transfer::public_transfer(win_coin, user);
        };

        event::emit(BetResolved {
            ticket_id: object::uid_to_inner(&id),
            user,
            won: is_winner,
            payout
        });

        object::delete(id);
    }
}
