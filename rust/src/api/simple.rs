use std::sync::Arc;

use anyhow::{Error, Context};
use sia::{encoding_async::{AsyncDecoder, AsyncEncoder, EncodingError, Result as EncodingResult}, rhp};
use quinn::{crypto::rustls::QuicClientConfig, RecvStream, SendStream};
use std::net::ToSocketAddrs;
use sia::rhp::RPCSettings;
use tracing::info;
use crate::__log_to_js;

struct QUICStream {
    send: SendStream,
    recv: RecvStream,
}

impl AsyncDecoder for QUICStream {
    async fn read_exact(&mut self, buf: &mut [u8]) -> EncodingResult<()> {
        self.recv.read_exact(buf).await.map_err(|e| {
            EncodingError::IOError(e.to_string())
        })
    }
}

impl AsyncEncoder for QUICStream {
    async fn write_all(&mut self, buf: &[u8]) -> EncodingResult<()> {
        self.send.write_all(buf).await.map_err(|e| {
            EncodingError::IOError(e.to_string())
        })
    }
}

pub async fn get_host_settings(address: &str, port: u16) -> Result<String, Error> {
    info!(target: "SiaExample", address, port, "get_host_settings: start");
    __log_to_js("info", format!("get_host_settings: start address={} port={}", address, port));
    if rustls::crypto::CryptoProvider::get_default().is_none() {
            rustls::crypto::ring::default_provider()
                .install_default().unwrap();
    }
    info!(target: "SiaExample", "CryptoProvider installed");
    __log_to_js("debug", "CryptoProvider installed".to_string());
    let mut client_crypto = rustls::ClientConfig::builder()
        .dangerous()
        .with_custom_certificate_verifier(SkipServerVerification::new())
        .with_no_client_auth();

    client_crypto.alpn_protocols = vec![b"sia/rhp4".to_vec()];
    info!(target: "SiaExample", "Configured ALPN for sia/rhp4");
    __log_to_js("debug", "Configured ALPN for sia/rhp4".to_string());

    let client_config = QuicClientConfig::try_from(client_crypto)?;
    let client_config =
        quinn::ClientConfig::new(Arc::new(client_config));
    info!(target: "SiaExample", "QUIC client config ready");
    __log_to_js("debug", "QUIC client config ready".to_string());

    __log_to_js("debug", "Creating QUIC endpoint (IPv6)".to_string());
    let mut endpoint = match quinn::Endpoint::client((std::net::Ipv6Addr::UNSPECIFIED, 0).into()) {
        Ok(ep) => ep,
        Err(e) => {
            __log_to_js("warn", format!("IPv6 endpoint failed: {}. Retrying IPv4…", e));
            quinn::Endpoint::client((std::net::Ipv4Addr::UNSPECIFIED, 0).into())
                .map_err(|e| rhp::Error::Transport(e.to_string()))?
        }
    };
    __log_to_js("debug", "QUIC endpoint created".to_string());
    endpoint.set_default_client_config(client_config);
    __log_to_js("debug", format!("Resolving addresses for {}:{}", address, port));
    let addrs = (address, port)
        .to_socket_addrs()
        .context("DNS resolution failed")?
        .collect::<Vec<_>>();
    info!(target: "SiaExample", ?addrs, "Resolved addresses");
    __log_to_js("debug", format!("Resolved addresses: {:?}", addrs));
    let addr = addrs[0];

    let conn = endpoint.connect(addr, address)
        .map_err(|e| {
            __log_to_js("error", format!("QUIC connect error (init): {}", e));
            rhp::Error::Transport(e.to_string())
        })?
        .await
        .map_err(|e| {
            __log_to_js("error", format!("QUIC connect error (await): {}", e));
            rhp::Error::Transport(e.to_string())
        })?;
    info!(target: "SiaExample", %addr, "Connected");
    __log_to_js("info", format!("Connected to {}", addr));

    let (send, recv) = conn.open_bi().await.map_err(|e| {
        __log_to_js("error", format!("open_bi failed: {}", e));
        anyhow::anyhow!(e)
    })?;
    info!(target: "SiaExample", "Opened bidirectional stream");
    __log_to_js("debug", "Opened bidirectional stream".to_string());
    let stream = QUICStream { send, recv };

    let settings = RPCSettings::send_request(stream)
        .await
        .map_err(|e| {
            __log_to_js("error", format!("RPCSettings::send_request failed: {}", e));
            e
        })?
        .complete()
        .await
        .map_err(|e| {
            __log_to_js("error", format!("RPC complete failed: {}", e));
            e
        })?;
    info!(target: "SiaExample", "RPC complete, serializing");
    __log_to_js("debug", "RPC complete, serializing".to_string());

    let str = serde_json::to_string(&settings.settings)?;
    info!(target: "SiaExample", bytes = str.len(), "Done");
    __log_to_js("info", format!("Done ({} bytes)", str.len()));
    Ok(str)
}

#[derive(Debug)]
struct SkipServerVerification;

impl SkipServerVerification {
    fn new() -> Arc<Self> {
        Arc::new(Self)
    }
}

impl rustls::client::danger::ServerCertVerifier for SkipServerVerification {
    fn verify_server_cert(
        &self,
        _end_entity: &rustls::pki_types::CertificateDer<'_>,
        _intermediates: &[rustls::pki_types::CertificateDer<'_>],
        _server_name: &rustls::pki_types::ServerName<'_>,
        _ocsp_response: &[u8],
        _now: rustls::pki_types::UnixTime,
    ) -> Result<rustls::client::danger::ServerCertVerified, rustls::Error> {
        Ok(rustls::client::danger::ServerCertVerified::assertion())
    }

    fn verify_tls12_signature(
        &self,
        _message: &[u8],
        _cert: &rustls::pki_types::CertificateDer<'_>,
        _dss: &rustls::DigitallySignedStruct,
    ) -> Result<rustls::client::danger::HandshakeSignatureValid, rustls::Error> {
        Ok(rustls::client::danger::HandshakeSignatureValid::assertion())
    }

    fn verify_tls13_signature(
        &self,
        _message: &[u8],
        _cert: &rustls::pki_types::CertificateDer<'_>,
        _dss: &rustls::DigitallySignedStruct,
    ) -> Result<rustls::client::danger::HandshakeSignatureValid, rustls::Error> {
        Ok(rustls::client::danger::HandshakeSignatureValid::assertion())
    }

    fn supported_verify_schemes(&self) -> Vec<rustls::SignatureScheme> {
        vec![
            rustls::SignatureScheme::RSA_PKCS1_SHA1,
            rustls::SignatureScheme::ECDSA_SHA1_Legacy,
            rustls::SignatureScheme::RSA_PKCS1_SHA256,
            rustls::SignatureScheme::ECDSA_NISTP256_SHA256,
            rustls::SignatureScheme::RSA_PKCS1_SHA384,
            rustls::SignatureScheme::ECDSA_NISTP384_SHA384,
            rustls::SignatureScheme::RSA_PKCS1_SHA512,
            rustls::SignatureScheme::ECDSA_NISTP521_SHA512,
            rustls::SignatureScheme::RSA_PSS_SHA256,
            rustls::SignatureScheme::RSA_PSS_SHA384,
            rustls::SignatureScheme::RSA_PSS_SHA512,
            rustls::SignatureScheme::ED25519,
            rustls::SignatureScheme::ED448,
        ]
    }
} 