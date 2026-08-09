#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{token, Address, BytesN, Env};

fn id(env: &Env, n: u8) -> BytesN<32> {
    BytesN::from_array(env, &[n; 32])
}

fn setup(env: &Env) -> (BytesN<32>, Address, Address, Address, token::Client<'_>) {
    env.mock_all_auths();

    let payer = Address::generate(env);
    let payee = Address::generate(env);

    let token_address = env.register_stellar_asset_contract_v2(payer.clone()).address();
    let token = token::Client::new(env, &token_address);
    token::StellarAssetClient::new(env, &token_address).mint(&payer, &1_000_000);

    (id(env, 1), payer, payee, token_address, token)
}

#[test]
fn full_flow() {
    let env = Env::default();
    let (agreement_id, payer, payee, token_address, token) = setup(&env);

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.create(
        &agreement_id,
        &payer,
        &payee,
        &token_address,
        &100_000,
    );

    token.approve(&payer, &contract_id, &100_000, &200);

    client.fund(&agreement_id, &100_000);
    assert_eq!(token.balance(&payer), 900_000);
    assert_eq!(token.balance(&contract_id), 100_000);

    client.release(&agreement_id, &40_000);
    assert_eq!(token.balance(&payee), 40_000);
    assert_eq!(token.balance(&contract_id), 60_000);

    client.release(&agreement_id, &60_000);
    assert_eq!(token.balance(&payee), 100_000);
    assert_eq!(token.balance(&contract_id), 0);

    let a = client.view(&agreement_id);
    assert_eq!(a.status, AgreementStatus::Completed);
    assert_eq!(a.funded, 100_000);
    assert_eq!(a.released, 100_000);
}

#[test]
#[should_panic(expected = "funding exceeds total")]
fn cannot_overfund() {
    let env = Env::default();
    let (agreement_id, payer, payee, token_address, token) = setup(&env);

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.create(&agreement_id, &payer, &payee, &token_address, &100_000);
    token.approve(&payer, &contract_id, &100_000, &200);

    client.fund(&agreement_id, &100_000);
    client.fund(&agreement_id, &1);
}

#[test]
#[should_panic(expected = "release exceeds funded amount")]
fn cannot_overrelease() {
    let env = Env::default();
    let (agreement_id, payer, payee, token_address, token) = setup(&env);

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.create(&agreement_id, &payer, &payee, &token_address, &100_000);
    token.approve(&payer, &contract_id, &100_000, &200);

    client.fund(&agreement_id, &100_000);
    client.release(&agreement_id, &100_001);
}

#[test]
fn cancel_returns_unreleased_balance() {
    let env = Env::default();
    let (agreement_id, payer, payee, token_address, token) = setup(&env);

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.create(&agreement_id, &payer, &payee, &token_address, &100_000);
    token.approve(&payer, &contract_id, &100_000, &200);

    client.fund(&agreement_id, &100_000);
    client.release(&agreement_id, &40_000);

    client.cancel(&agreement_id);

    let a = client.view(&agreement_id);
    assert_eq!(a.status, AgreementStatus::Cancelled);
    assert_eq!(token.balance(&payer), 960_000);
    assert_eq!(token.balance(&payee), 40_000);
    assert_eq!(token.balance(&contract_id), 0);
}
