uniffi::setup_scaffolding!();

pub mod api;
mod logger;

use logger::log_to_js;

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
pub async fn get_host_settings(address: String, port: u16) -> Result<String, SiaError> {
    // Ensure a Tokio runtime is available when called from JS.
    // If we're already inside a runtime, use it; otherwise, create one on the fly.
    let fut = api::simple::get_host_settings(&address, port);
    let res = if tokio::runtime::Handle::try_current().is_ok() {
        fut.await
    } else {
        match tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
        {
            Ok(rt) => rt.block_on(fut),
            Err(e) => Err(anyhow::anyhow!(e)),
        }
    };
    match res {
        Ok(result) => Ok(result),
        Err(e) => {
            // Push the error string to JS logger.
            log_to_js("error", e.to_string());
            Err(SiaError::Message(e.to_string()))
        }
    }
}
