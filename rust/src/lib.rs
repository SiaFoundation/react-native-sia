uniffi::setup_scaffolding!();

pub mod api;
mod logger;

use sia::signing::PrivateKey;

#[derive(Debug, thiserror::Error, uniffi::Error)]
pub enum SiaError {
    #[error("{0}")]
    Message(String),
}

impl From<anyhow::Error> for SiaError {
    fn from(err: anyhow::Error) -> Self {
        SiaError::Message(err.to_string())
    }
}

#[uniffi::export]
pub async fn upload_bullshit() {
    let sk = PrivateKey::from_seed(&[0u8; 32]);

    tokio::spawn(async move {
        api::simple::upload_random([1u8;32], sk).await
    });
}