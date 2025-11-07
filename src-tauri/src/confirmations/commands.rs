use steamguard::{Confirmer, SteamGuardAccount};

use super::payloads::{ConfirmationResponse, GetConfirmationsError};
use crate::app_state::AppState;

#[tauri::command]
pub fn get_confirmations(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<ConfirmationResponse>, GetConfirmationsError> {
    let accounts_config = state.accounts_config.lock().unwrap();
    let active_account = accounts_config
        .get_active_account()
        .ok_or(GetConfirmationsError::Unauthorized)?;
    let steam_guard_account: SteamGuardAccount = active_account.clone().into();
    let confirmer = Confirmer::new(state.transport.clone(), &steam_guard_account);
    let confirmations = confirmer
        .get_confirmations()
        .map_err(|_| GetConfirmationsError::ApiError)?;
    Ok(confirmations.into_iter().map(|x| x.into()).collect())
}
