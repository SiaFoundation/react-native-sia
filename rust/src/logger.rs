use std::sync::{Arc, RwLock, OnceLock};
use log::{Level, LevelFilter, Log, Metadata, Record};

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

// Bridge Rust's `log` crate to the JS logger via `log_to_js`.
struct JsLogForwarder;

impl Log for JsLogForwarder {
    fn enabled(&self, metadata: &Metadata) -> bool {
        metadata.level() <= log::max_level()
    }

    fn log(&self, record: &Record) {
        if !self.enabled(record.metadata()) {
            return;
        }

        let level_str = match record.level() {
            Level::Error => "error",
            Level::Warn => "warn",
            Level::Info => "info",
            Level::Debug => "debug",
            Level::Trace => "trace",
        };

        let msg = match (record.module_path(), record.file(), record.line()) {
            (Some(module), Some(file), Some(line)) => {
                format!("{} ({} @ {}:{})", record.args(), module, file, line)
            }
            (Some(module), _, _) => format!("{} ({})", record.args(), module),
            _ => format!("{}", record.args()),
        };

        log_to_js(level_str, msg);
    }

    fn flush(&self) {}
}

// Initialize the global Rust `log` logger to forward to JS.
// Call this after `set_logger` from JS side.
#[uniffi::export]
pub fn init_rust_log(){
    log::set_logger(&JsLogForwarder).unwrap();
    log::set_max_level(LevelFilter::Debug);
}
