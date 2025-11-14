use steamguard::{Confirmer, ConfirmerError, SteamGuardAccount};

use super::payloads::{ConfirmationResponse, GetConfirmationsError};
use crate::{
    app_state::AppState,
    confirmations::payloads::{
        ConfirmationActionRequest, ConfirmationDetailsResponse, ConfirmationError,
    },
};

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
    let confirmations = confirmer.get_confirmations().map_err(|err| {
        log::debug!("Encountered error when fetching confirmations from Steam: {err:?}");
        GetConfirmationsError::ApiError
    })?;
    Ok(confirmations.into_iter().map(|x| x.into()).collect())
}

#[tauri::command]
pub fn get_confirmation_details(
    state: tauri::State<'_, AppState>,
    payload: ConfirmationActionRequest,
) -> Result<ConfirmationDetailsResponse, GetConfirmationsError> {
    let accounts_config = state.accounts_config.lock().unwrap();
    let active_account = accounts_config
        .get_active_account()
        .ok_or(GetConfirmationsError::Unauthorized)?;
    let steam_guard_account: SteamGuardAccount = active_account.clone().into();
    let confirmer = Confirmer::new(state.transport.clone(), &steam_guard_account);
    let html = confirmer
        .get_confirmation_details(&payload)
        .map_err(|_| GetConfirmationsError::ApiError)?;
    Ok(ConfirmationDetailsResponse { html })
}

#[tauri::command]
pub fn accept_confirmation(
    state: tauri::State<'_, AppState>,
    payload: ConfirmationActionRequest,
) -> Result<(), ConfirmationError> {
    let accounts_config = state.accounts_config.lock().unwrap();
    let active_account = accounts_config
        .get_active_account()
        .ok_or(ConfirmationError::Unauthorized)?;
    let steam_guard_account: SteamGuardAccount = active_account.clone().into();
    let confirmer = Confirmer::new(state.transport.clone(), &steam_guard_account);
    confirmer
        .accept_confirmation(&payload)
        .map_err(|err| match err {
            ConfirmerError::InvalidTokens => ConfirmationError::Unauthorized,
            ConfirmerError::DeserializeError(_) => ConfirmationError::DeserializationError,
            ConfirmerError::NetworkFailure(_) => ConfirmationError::NetworkFailure,
            _ => ConfirmationError::ApiError,
        })?;
    Ok(())
}
