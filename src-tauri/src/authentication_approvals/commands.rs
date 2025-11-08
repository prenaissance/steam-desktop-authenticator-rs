use steamguard::protobufs::steammessages_auth_steamclient::CAuthentication_GetAuthSessionInfo_Response;
use steamguard::token::Tokens;
use steamguard::{ApproverError, LoginApprover, SteamGuardAccount};

use super::payloads::{ApproveQrLoginRequest, AuthSessionResponse, GetApprovalsError};
use crate::AppState;

#[tauri::command]
pub fn get_sessions(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<AuthSessionResponse>, GetApprovalsError> {
    let guard = state.accounts_config.lock().unwrap();
    let active_account = guard
        .get_active_account()
        .ok_or(GetApprovalsError::Unauthorized)?;
    let tokens = Tokens::new(
        active_account.access_token.clone(),
        active_account.refresh_token.clone(),
    );
    let login_approver = LoginApprover::new(state.transport.clone(), &tokens);
    let approvals: Result<Vec<(u64, CAuthentication_GetAuthSessionInfo_Response)>, _> =
        login_approver
            .list_auth_sessions()
            .map_err(|err| match err {
                ApproverError::Unauthorized => GetApprovalsError::Unauthorized,
                _ => GetApprovalsError::Unknown,
            })?
            .into_iter()
            .map(|client_id| {
                login_approver
                    .get_auth_session_info(client_id)
                    .map(|response| (client_id, response))
            })
            .collect();

    approvals
        .map_err(|err| {
            log::debug!("Failed to fetch sessions: {err:?}");
            match err {
                ApproverError::Unauthorized => GetApprovalsError::Unauthorized,
                _ => GetApprovalsError::Unknown,
            }
        })
        .map(|vec| {
            log::trace!(
                "Loaded {} approval ids. Hydrating detailed information...",
                vec.len()
            );
            vec.into_iter()
                .map(|(client_id, response)| AuthSessionResponse::new(client_id, response))
                .collect()
        })
}

#[tauri::command]
pub fn approve_qr_login(
    state: tauri::State<'_, AppState>,
    payload: ApproveQrLoginRequest,
) -> Result<(), GetApprovalsError> {
    let active_account = state
        .accounts_config
        .lock()
        .unwrap()
        .get_active_account()
        .ok_or(GetApprovalsError::Unauthorized)?
        .clone();
    let steam_guard_account: SteamGuardAccount = active_account.into();
    let mut login_approver = LoginApprover::new(
        state.transport.clone(),
        steam_guard_account.tokens.as_ref().unwrap(),
    );
    login_approver
        .approve_from_challenge_url(
            &steam_guard_account,
            payload.challenge_url,
            payload.persistence,
        )
        .map_err(|err| match err {
            ApproverError::Unauthorized => GetApprovalsError::Unauthorized,
            _ => GetApprovalsError::Unknown,
        })
}
