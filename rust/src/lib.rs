uniffi::setup_scaffolding!();

pub mod api;
mod logger;

use logger::log_to_js;
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

    // Ensure a Tokio runtime is available when called from JS.
    // If we're already inside a runtime, use it; otherwise, create one on the fly.
    let fut = api::simple::upload_random([1u8;32], sk);
    if tokio::runtime::Handle::try_current().is_ok() {
        fut.await
    } else {
        match tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
        {
            Ok(rt) => rt.block_on(fut),
            Err(_) => (),
        }
    };
}