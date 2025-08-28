uniffi::setup_scaffolding!();

pub mod api;

use std::sync::{Arc, RwLock, OnceLock};

#[uniffi::export]
pub fn sdk_version() -> String {
    "0.1.0".to_string()
}

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
            // Also push the error string to JS logger if present.
            __log_to_js("error", e.to_string());
            Err(SiaError::Message(e.to_string()))
        }
    }
}

#[uniffi::export]
pub fn init_logging() {
    // Initialize os_log based tracing. Safe to call multiple times.
    use tracing_subscriber::prelude::*;
    let _ = tracing_subscriber::registry()
        .with(tracing_oslog::OsLogger::new("SiaExample", "Rust"))
        .try_init();
    tracing::info!(target: "SiaExample", "Rust logging initialized");
}

// -------- Logger callback into Javascript --------
#[uniffi::export(with_foreign)]
pub trait JsLogger: Send + Sync {
    fn log(&self, level: String, message: String);
}

static LOGGER: OnceLock<RwLock<Option<Arc<dyn JsLogger>>>> = OnceLock::new();

fn log_to_js(level: &str, message: String) {
    if let Some(lock) = LOGGER.get() {
        if let Ok(guard) = lock.read() {
            if let Some(logger) = &*guard {
                // Best-effort call into JS.
                logger.log(level.to_string(), message);
            }
        }
    }
}

#[uniffi::export]
pub fn set_logger(logger: Arc<dyn JsLogger>) {
    let lock = LOGGER.get_or_init(|| RwLock::new(None));
    if let Ok(mut guard) = lock.write() {
        *guard = Some(logger);
    }
}

#[uniffi::export]
pub fn clear_logger() {
    if let Some(lock) = LOGGER.get() {
        if let Ok(mut guard) = lock.write() { *guard = None; }
    }
}

// Re-export helper for internal modules.
pub(crate) use log_to_js as __log_to_js;
