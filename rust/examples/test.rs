use sia_lib::App;


#[tokio::main]
async fn main() {
    pretty_env_logger::init();

    let app = App::new(
        "https://app.indexd.zeus.sia.dev".into(), 
        "name".into(),
        "1".repeat(64), 
         "description".into()).unwrap();
    
    log::info!("app created");
    app.connect().await.unwrap();
    log::info!("connected");
    let upload = app.upload("1".repeat(64), 2, 2).await.unwrap();
    log::info!("upload started");
    let buf =  vec![0u8; 1024 * 1024];
    upload.write(&buf).await.unwrap();
    log::info!("chunk written");
    upload.finish().await.unwrap();
    log::info!("upload finished");
}