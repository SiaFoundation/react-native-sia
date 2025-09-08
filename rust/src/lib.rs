uniffi::setup_scaffolding!();

pub mod api;
mod logger;

use sia::signing::PrivateKey;

use crate::logger::log_to_js;

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

#[uniffi::export(async_runtime = "tokio")]
pub async fn upload_bullshit() {
    let sk = PrivateKey::from_seed(&[0u8; 32]);

    log_to_js("info", "before spawn".into());
    tokio::spawn(async move {
        log_to_js("info", "starting upload".into());
        match api::simple::upload_random([1u8;32], sk).await {
            Ok(_) => log_to_js("info", "upload complete".into()),
            Err(e) => log_to_js("error", format!("upload failed: {}", e).into()),
        }
        log_to_js("info", "upload task complete".into());
    });
}