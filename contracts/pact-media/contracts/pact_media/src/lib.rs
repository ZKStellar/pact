#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, BytesN, Env, IntoVal, String, Vec,
};

// ---------------------------------------------------------------------------
// Local mirror of pact_escrow::Agreement so we can deserialise cross-contract
// reads without pulling in the full escrow crate as a build dependency.
// The field order and types must stay in sync with the escrow contract.
// ---------------------------------------------------------------------------

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowStatus {
    Open,
    Completed,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowAgreement {
    pub payer: Address,
    pub payee: Address,
    pub token: Address,
    pub total: i128,
    pub funded: i128,
    pub released: i128,
    pub status: EscrowStatus,
}

// ---------------------------------------------------------------------------
// Media types & records
// ---------------------------------------------------------------------------

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MediaType {
    Image,
    Video,
    Document,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MediaRecord {
    pub id: BytesN<32>,
    pub agreement_id: BytesN<32>,
    pub milestone_id: Option<BytesN<32>>,
    pub media_type: MediaType,
    pub cid: String,
    pub filename: String,
    pub version: u32,
    pub uploaded_by: Address,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    EscrowContract,
    Media(BytesN<32>),
    AgreementMediaIds(BytesN<32>),
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

#[contract]
pub struct PactMedia;

#[contractimpl]
impl PactMedia {
    /// One-time initialisation.  Stores the address of the pact_escrow program
    /// so every `add` / `update` / `remove` can verify the caller is a party
    /// to the referenced agreement.
    pub fn initialize(env: Env, escrow_contract: Address) {
        let key = DataKey::EscrowContract;
        assert!(!env.storage().instance().has(&key), "already initialized");
        env.storage().instance().set(&key, &escrow_contract);
    }

    /// Attach a new piece of media (image, video, document) to an agreement.
    /// `caller` must be either the payer or payee of the agreement.
    pub fn add(
        env: Env,
        caller: Address,
        id: BytesN<32>,
        agreement_id: BytesN<32>,
        milestone_id: Option<BytesN<32>>,
        media_type: MediaType,
        cid: String,
        filename: String,
    ) {
        caller.require_auth();
        Self::require_party(&env, &agreement_id, &caller);

        let key = DataKey::Media(id.clone());
        assert!(
            !env.storage().instance().has(&key),
            "media record already exists"
        );

        env.storage().instance().set(
            &key,
            &MediaRecord {
                id: id.clone(),
                agreement_id: agreement_id.clone(),
                milestone_id,
                media_type,
                cid,
                filename,
                version: 1,
                uploaded_by: caller,
            },
        );

        Self::push_media_id(&env, &agreement_id, &id);
    }

    /// Replace the IPFS CID for an existing media record.  The version number
    /// is bumped automatically.
    pub fn update_cid(env: Env, caller: Address, id: BytesN<32>, cid: String) {
        caller.require_auth();

        let key = DataKey::Media(id.clone());
        let mut record: MediaRecord = env
            .storage()
            .instance()
            .get(&key)
            .expect("media record not found");

        Self::require_party(&env, &record.agreement_id, &caller);

        record.cid = cid;
        record.version += 1;

        env.storage().instance().set(&key, &record);
    }

    /// Update the human-readable filename for a media record.
    pub fn update_filename(env: Env, caller: Address, id: BytesN<32>, filename: String) {
        caller.require_auth();

        let key = DataKey::Media(id.clone());
        let mut record: MediaRecord = env
            .storage()
            .instance()
            .get(&key)
            .expect("media record not found");

        Self::require_party(&env, &record.agreement_id, &caller);

        record.filename = filename;
        env.storage().instance().set(&key, &record);
    }

    /// Remove a media record entirely.
    pub fn remove(env: Env, caller: Address, id: BytesN<32>) {
        caller.require_auth();

        let key = DataKey::Media(id.clone());
        let record: MediaRecord = env
            .storage()
            .instance()
            .get(&key)
            .expect("media record not found");

        Self::require_party(&env, &record.agreement_id, &caller);

        env.storage().instance().remove(&key);
        Self::remove_media_id(&env, &record.agreement_id, &id);
    }

    /// Read a single media record.
    pub fn view(env: Env, id: BytesN<32>) -> MediaRecord {
        env.storage()
            .instance()
            .get(&DataKey::Media(id))
            .expect("media record not found")
    }

    /// List every media record attached to an agreement.
    pub fn list_by_agreement(env: Env, agreement_id: BytesN<32>) -> Vec<MediaRecord> {
        let ids = Self::media_ids_for(&env, &agreement_id);
        let mut out: Vec<MediaRecord> = Vec::new(&env);
        let mut i: u32 = 0;
        while i < ids.len() {
            let record = Self::read_media(&env, &ids.get_unchecked(i));
            out.push_back(record);
            i += 1;
        }
        out
    }

    /// List media records for a specific milestone within an agreement.
    pub fn list_by_milestone(
        env: Env,
        agreement_id: BytesN<32>,
        milestone_id: BytesN<32>,
    ) -> Vec<MediaRecord> {
        let ids = Self::media_ids_for(&env, &agreement_id);
        let mut out: Vec<MediaRecord> = Vec::new(&env);
        let mut i: u32 = 0;
        while i < ids.len() {
            let record = Self::read_media(&env, &ids.get_unchecked(i));
            if record.milestone_id.as_ref() == Some(&milestone_id) {
                out.push_back(record);
            }
            i += 1;
        }
        out
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    /// Cross-contract read to pact_escrow, then assert the caller is a party.
    fn require_party(env: &Env, agreement_id: &BytesN<32>, caller: &Address) {
        let agreement = Self::read_escrow(env, agreement_id);
        assert!(
            *caller == agreement.payer || *caller == agreement.payee,
            "not a party to this agreement"
        );
    }

    fn read_escrow(env: &Env, agreement_id: &BytesN<32>) -> EscrowAgreement {
        let escrow: Address = env
            .storage()
            .instance()
            .get(&DataKey::EscrowContract)
            .expect("contract not initialized");

        env.invoke_contract::<EscrowAgreement>(
            &escrow,
            &symbol_short!("view"),
            (agreement_id.clone(),).into_val(env),
        )
    }

    fn read_media(env: &Env, id: &BytesN<32>) -> MediaRecord {
        env.storage()
            .instance()
            .get(&DataKey::Media(id.clone()))
            .expect("media record missing")
    }

    fn media_ids_for(env: &Env, agreement_id: &BytesN<32>) -> Vec<BytesN<32>> {
        env.storage()
            .instance()
            .get(&DataKey::AgreementMediaIds(agreement_id.clone()))
            .unwrap_or_else(|| Vec::new(env))
    }

    fn push_media_id(env: &Env, agreement_id: &BytesN<32>, id: &BytesN<32>) {
        let list_key = DataKey::AgreementMediaIds(agreement_id.clone());
        let mut ids = Self::media_ids_for(env, agreement_id);
        ids.push_back(id.clone());
        env.storage().instance().set(&list_key, &ids);
    }

    fn remove_media_id(env: &Env, agreement_id: &BytesN<32>, id: &BytesN<32>) {
        let list_key = DataKey::AgreementMediaIds(agreement_id.clone());
        let ids = Self::media_ids_for(env, agreement_id);
        let mut kept: Vec<BytesN<32>> = Vec::new(env);
        let mut i: u32 = 0;
        while i < ids.len() {
            let item = ids.get_unchecked(i);
            if item != *id {
                kept.push_back(item);
            }
            i += 1;
        }
        env.storage().instance().set(&list_key, &kept);
    }
}

mod test;
