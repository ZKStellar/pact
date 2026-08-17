#![cfg(test)]

use super::*;
use pact_escrow::Contract as Escrow;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{token, Address, BytesN, Env};

fn id(env: &Env, n: u8) -> BytesN<32> {
    BytesN::from_array(env, &[n; 32])
}

/// Register the escrow contract and return (escrow_address, payer, payee, token_address).
fn setup_escrow(env: &Env) -> (Address, Address, Address, Address) {
    env.mock_all_auths();

    let payer = Address::generate(env);
    let payee = Address::generate(env);

    let token_addr = env
        .register_stellar_asset_contract_v2(payer.clone())
        .address();
    let _token = token::Client::new(env, &token_addr);
    token::StellarAssetClient::new(env, &token_addr).mint(&payer, &1_000_000);

    let escrow_addr = env.register(Escrow, ());
    let escrow = pact_escrow::ContractClient::new(env, &escrow_addr);

    let agreement_id = id(env, 1);
    escrow.create(&agreement_id, &payer, &payee, &token_addr, &100_000);

    (escrow_addr, payer, payee, token_addr)
}

/// Register & initialise the media contract wired to the escrow.
fn setup_media<'a>(env: &'a Env, escrow_addr: &Address) -> PactMediaClient<'a> {
    let media_addr = env.register(PactMedia, ());
    let client = PactMediaClient::new(env, &media_addr);
    client.initialize(escrow_addr);
    client
}

// -------------------------------------------------------------------
// Tests
// -------------------------------------------------------------------

#[test]
fn add_and_view() {
    let env = Env::default();
    let (escrow_addr, payer, payee, _) = setup_escrow(&env);
    let client = setup_media(&env, &escrow_addr);

    env.mock_all_auths();

    let agreement_id = id(&env, 1);
    let media_id = id(&env, 10);

    client.add(
        &payer,
        &media_id,
        &agreement_id,
        &None::<BytesN<32>>,
        &MediaType::Image,
        &String::from_str(&env, "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3dfuylqab55gz6twkjkgevk5i"),
        &String::from_str(&env, "screenshot.png"),
    );

    let record = client.view(&media_id);
    assert_eq!(record.agreement_id, agreement_id);
    assert_eq!(record.media_type, MediaType::Image);
    assert_eq!(record.version, 1);
    assert_eq!(
        record.cid,
        String::from_str(&env, "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3dfuylqab55gz6twkjkgevk5i")
    );
    assert_eq!(record.filename, String::from_str(&env, "screenshot.png"));
    assert_eq!(record.uploaded_by, payer);
}

#[test]
fn payee_can_add() {
    let env = Env::default();
    let (escrow_addr, _, payee, _) = setup_escrow(&env);
    let client = setup_media(&env, &escrow_addr);

    env.mock_all_auths();

    client.add(
        &payee,
        &id(&env, 20),
        &id(&env, 1),
        &None::<BytesN<32>>,
        &MediaType::Video,
        &String::from_str(&env, "QmXyz"),
        &String::from_str(&env, "demo.mp4"),
    );

    let record = client.view(&id(&env, 20));
    assert_eq!(record.uploaded_by, payee);
}

#[test]
fn add_with_milestone() {
    let env = Env::default();
    let (escrow_addr, payer, _, _) = setup_escrow(&env);
    let client = setup_media(&env, &escrow_addr);

    env.mock_all_auths();

    let media_id = id(&env, 21);
    let milestone = id(&env, 5);

    client.add(
        &payer,
        &media_id,
        &id(&env, 1),
        &Some(milestone.clone()),
        &MediaType::Video,
        &String::from_str(&env, "QmXyz"),
        &String::from_str(&env, "demo.mp4"),
    );

    let record = client.view(&media_id);
    assert_eq!(record.milestone_id, Some(milestone));
    assert_eq!(record.media_type, MediaType::Video);
}

#[test]
fn update_cid_bumps_version() {
    let env = Env::default();
    let (escrow_addr, payer, _, _) = setup_escrow(&env);
    let client = setup_media(&env, &escrow_addr);

    env.mock_all_auths();

    let media_id = id(&env, 30);
    client.add(
        &payer,
        &media_id,
        &id(&env, 1),
        &None::<BytesN<32>>,
        &MediaType::Document,
        &String::from_str(&env, "QmOld"),
        &String::from_str(&env, "doc.pdf"),
    );

    assert_eq!(client.view(&media_id).version, 1);

    client.update_cid(&payer, &media_id, &String::from_str(&env, "QmNew"));

    let record = client.view(&media_id);
    assert_eq!(record.version, 2);
    assert_eq!(record.cid, String::from_str(&env, "QmNew"));
    assert_eq!(record.filename, String::from_str(&env, "doc.pdf"));
}

#[test]
fn update_filename_preserves_cid() {
    let env = Env::default();
    let (escrow_addr, payer, _, _) = setup_escrow(&env);
    let client = setup_media(&env, &escrow_addr);

    env.mock_all_auths();

    let media_id = id(&env, 31);
    client.add(
        &payer,
        &media_id,
        &id(&env, 1),
        &None::<BytesN<32>>,
        &MediaType::Image,
        &String::from_str(&env, "QmCid"),
        &String::from_str(&env, "old.png"),
    );

    client.update_filename(&payer, &media_id, &String::from_str(&env, "new.png"));

    let record = client.view(&media_id);
    assert_eq!(record.cid, String::from_str(&env, "QmCid"));
    assert_eq!(record.filename, String::from_str(&env, "new.png"));
    assert_eq!(record.version, 1);
}

#[test]
fn remove_deletes_record_and_list_entry() {
    let env = Env::default();
    let (escrow_addr, payer, _, _) = setup_escrow(&env);
    let client = setup_media(&env, &escrow_addr);

    env.mock_all_auths();

    let m1 = id(&env, 40);
    let m2 = id(&env, 41);
    let agreement = id(&env, 1);

    client.add(
        &payer,
        &m1,
        &agreement,
        &None::<BytesN<32>>,
        &MediaType::Image,
        &String::from_str(&env, "a"),
        &String::from_str(&env, "a.png"),
    );
    client.add(
        &payer,
        &m2,
        &agreement,
        &None::<BytesN<32>>,
        &MediaType::Image,
        &String::from_str(&env, "b"),
        &String::from_str(&env, "b.png"),
    );

    assert_eq!(client.list_by_agreement(&agreement).len(), 2);

    client.remove(&payer, &m1);

    let list = client.list_by_agreement(&agreement);
    assert_eq!(list.len(), 1);
    assert_eq!(list.get_unchecked(0).id, m2);
}

#[test]
fn list_by_agreement() {
    let env = Env::default();
    let (escrow_addr, payer, _, _) = setup_escrow(&env);
    let client = setup_media(&env, &escrow_addr);

    env.mock_all_auths();

    let agreement = id(&env, 1);
    let milestone_a = id(&env, 100);
    let milestone_b = id(&env, 101);

    let entries: [(u8, Option<BytesN<32>>); 4] = [
        (50, None),
        (51, Some(milestone_a.clone())),
        (52, Some(milestone_b.clone())),
        (53, Some(milestone_a.clone())),
    ];

    for (i, ms) in entries.iter().enumerate() {
        client.add(
            &payer,
            &id(&env, ms.0),
            &agreement,
            &ms.1,
            &MediaType::Image,
            &String::from_str(&env, "cid"),
            &String::from_str(&env, "f.png"),
        );
    }

    let all = client.list_by_agreement(&agreement);
    assert_eq!(all.len(), 4);

    let mA = client.list_by_milestone(&agreement, &milestone_a);
    assert_eq!(mA.len(), 2);

    let mB = client.list_by_milestone(&agreement, &milestone_b);
    assert_eq!(mB.len(), 1);
}

#[test]
#[should_panic(expected = "not a party to this agreement")]
fn non_party_cannot_add() {
    let env = Env::default();
    let (escrow_addr, _, _, _) = setup_escrow(&env);
    let client = setup_media(&env, &escrow_addr);

    let stranger = Address::generate(&env);
    env.mock_all_auths();

    client.add(
        &stranger,
        &id(&env, 99),
        &id(&env, 1),
        &None::<BytesN<32>>,
        &MediaType::Image,
        &String::from_str(&env, "cid"),
        &String::from_str(&env, "x.png"),
    );
}

#[test]
#[should_panic(expected = "not a party to this agreement")]
fn non_party_cannot_update() {
    let env = Env::default();
    let (escrow_addr, payer, _, _) = setup_escrow(&env);
    let client = setup_media(&env, &escrow_addr);

    env.mock_all_auths();
    let media_id = id(&env, 70);
    client.add(
        &payer,
        &media_id,
        &id(&env, 1),
        &None::<BytesN<32>>,
        &MediaType::Image,
        &String::from_str(&env, "a"),
        &String::from_str(&env, "a.png"),
    );

    let stranger = Address::generate(&env);
    client.update_cid(&stranger, &media_id, &String::from_str(&env, "hacked"));
}

#[test]
#[should_panic(expected = "already initialized")]
fn cannot_initialize_twice() {
    let env = Env::default();
    let escrow_addr = env.register(Escrow, ());
    let media_addr = env.register(PactMedia, ());
    let client = PactMediaClient::new(&env, &media_addr);
    client.initialize(&escrow_addr);
    client.initialize(&escrow_addr);
}

#[test]
#[should_panic(expected = "media record already exists")]
fn cannot_duplicate_id() {
    let env = Env::default();
    let (escrow_addr, payer, _, _) = setup_escrow(&env);
    let client = setup_media(&env, &escrow_addr);

    env.mock_all_auths();

    let media_id = id(&env, 60);
    let agreement = id(&env, 1);

    client.add(
        &payer,
        &media_id,
        &agreement,
        &None::<BytesN<32>>,
        &MediaType::Image,
        &String::from_str(&env, "a"),
        &String::from_str(&env, "a.png"),
    );
    client.add(
        &payer,
        &media_id,
        &agreement,
        &None::<BytesN<32>>,
        &MediaType::Image,
        &String::from_str(&env, "b"),
        &String::from_str(&env, "b.png"),
    );
}

#[test]
#[should_panic(expected = "media record not found")]
fn view_nonexistent_panics() {
    let env = Env::default();
    let (escrow_addr, _, _, _) = setup_escrow(&env);
    let client = setup_media(&env, &escrow_addr);
    client.view(&id(&env, 255));
}
