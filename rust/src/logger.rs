use std::sync::{Arc, RwLock, OnceLock};

#[uniffi::export(with_foreign)]
pub trait JsLogger: Send + Sync {
    fn log(&self, level: String, message: String);
}

static LOGGER: OnceLock<RwLock<Option<Arc<dyn JsLogger>>>> = OnceLock::new();

pub(crate) fn log_to_js(level: &str, message: String) {
    if let Some(lock) = LOGGER.get() {
        if let Ok(guard) = lock.read() {
            if let Some(logger) = &*guard {
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
