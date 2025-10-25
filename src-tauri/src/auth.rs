use std::path::PathBuf;

use tauri::{AppHandle, Manager};

fn get_config_path(app: AppHandle) -> PathBuf {
    app.path()
        .app_config_dir()
        .expect("Expected access to config directory")
}
