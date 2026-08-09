#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, BytesN, Env, MuxedAddress,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AgreementStatus {
    Open,
    Completed,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Agreement {
    pub payer: Address,
    pub payee: Address,
    pub token: Address,
    pub total: i128,
    pub funded: i128,
    pub released: i128,
    pub status: AgreementStatus,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Agreement(BytesN<32>),
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Open a new escrow. Caller must be the payer. Funds are locked by the
    /// program until released to the payee or cancelled by both parties.
    pub fn create(
        env: Env,
        id: BytesN<32>,
        payer: Address,
        payee: Address,
        token: Address,
        total: i128,
    ) {
        payer.require_auth();

        let key = DataKey::Agreement(id);
        assert!(!env.storage().instance().has(&key), "agreement already exists");
        assert!(total > 0, "total must be positive");
        assert_ne!(payer, payee, "parties must differ");

        env.storage().instance().set(
            &key,
            &Agreement {
                payer,
                payee,
                token,
                total,
                funded: 0,
                released: 0,
                status: AgreementStatus::Open,
            },
        );
    }

    /// Deposit tokens into escrow. Requires the payer to have approved this
    /// contract for at least `amount` on the token.
    pub fn fund(env: Env, id: BytesN<32>, amount: i128) {
        let key = DataKey::Agreement(id.clone());
        let mut a: Agreement = env.storage().instance().get(&key).expect("agreement not found");
        assert!(a.status == AgreementStatus::Open, "agreement is not open");
        assert!(amount > 0, "amount must be positive");
        assert!(a.funded + amount <= a.total, "funding exceeds total");

        a.payer.require_auth();

        let client = token::Client::new(&env, &a.token);
        client.transfer_from(
            &env.current_contract_address(),
            &a.payer,
            &env.current_contract_address(),
            &amount,
        );
        a.funded += amount;

        env.storage().instance().set(&key, &a);
    }

    /// Release `amount` from escrow to the payee. Caller must be the payer.
    /// Completes the agreement when everything funded has been released.
    pub fn release(env: Env, id: BytesN<32>, amount: i128) {
        let key = DataKey::Agreement(id.clone());
        let mut a: Agreement = env.storage().instance().get(&key).expect("agreement not found");
        assert!(a.status == AgreementStatus::Open, "agreement is not open");
        assert!(amount > 0, "amount must be positive");
        assert!(a.released + amount <= a.funded, "release exceeds funded amount");

        a.payer.require_auth();

        let client = token::Client::new(&env, &a.token);
        client.transfer(
            &env.current_contract_address(),
            &MuxedAddress::from(&a.payee),
            &amount,
        );
        a.released += amount;

        if a.released == a.funded {
            a.status = AgreementStatus::Completed;
        }

        env.storage().instance().set(&key, &a);
    }

    /// Cancel an open agreement and return the unreleased balance to the payer.
    /// Requires authorization from both parties.
    pub fn cancel(env: Env, id: BytesN<32>) {
        let key = DataKey::Agreement(id.clone());
        let mut a: Agreement = env.storage().instance().get(&key).expect("agreement not found");
        assert!(a.status == AgreementStatus::Open, "agreement is not open");

        a.payer.require_auth();
        a.payee.require_auth();

        let remainder = a.funded - a.released;
        a.status = AgreementStatus::Cancelled;
        env.storage().instance().set(&key, &a);

        if remainder > 0 {
            let client = token::Client::new(&env, &a.token);
            client.transfer(
                &env.current_contract_address(),
                &MuxedAddress::from(&a.payer),
                &remainder,
            );
        }
    }

    /// Read the current state of an agreement.
    pub fn view(env: Env, id: BytesN<32>) -> Agreement {
        env.storage()
            .instance()
            .get(&DataKey::Agreement(id))
            .expect("agreement not found")
    }
}

mod test;
