use std::time::{SystemTime, UNIX_EPOCH};

use steamguard::approver::Challenge;
use steamguard::protobufs::steammessages_auth_steamclient::CAuthentication_GetAuthSessionInfo_Response;
use steamguard::token::{Tokens, TwoFactorSecret};
use steamguard::{ApproverError, LoginApprover, SteamGuardAccount};

use super::payloads::{ApproveQrLoginRequest, AuthSessionResponse, GetApprovalsError};
use crate::AppState;
use crate::authentication_approvals::payloads::{
    AuthApprovalError, AuthApproveRequest, AuthDenyRequest,
};

#[tauri::command]
pub fn get_otp(state: tauri::State<'_, AppState>) -> Option<String> {
    let shared_secret = state
        .accounts_config
        .lock()
        .unwrap()
        .get_active_account()
        .map(|account| account.shared_secret.clone());

    shared_secret.map(|secret| {
        TwoFactorSecret::parse_shared_secret(secret)
            .unwrap()
            .generate_code(
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_secs(),
            )
    })
}

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
            .inspect(|client_ids| {
                log::debug!(
                    "Loaded session ids: {client_ids:?}. Hydrating detailed information...",
                );
            })
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
            vec.into_iter()
                .map(|(client_id, response)| AuthSessionResponse::new(client_id, response))
                .collect()
        })
}

#[tauri::command]
pub fn approve_session(
    state: tauri::State<'_, AppState>,
    payload: AuthApproveRequest,
) -> Result<(), AuthApprovalError> {
    let active_account = state
        .accounts_config
        .lock()
        .unwrap()
        .get_active_account()
        .ok_or(AuthApprovalError::Unauthorized)?
        .clone();
    let steam_guard_account: SteamGuardAccount = active_account.into();
    let mut login_approver = LoginApprover::new(
        state.transport.clone(),
        steam_guard_account.tokens.as_ref().unwrap(),
    );
    login_approver
        .approve(
            &steam_guard_account,
            Challenge::new(1, payload.client_id),
            payload.persistence,
        )
        .map_err(AuthApprovalError::from)
}

#[tauri::command]
pub fn deny_session(
    state: tauri::State<'_, AppState>,
    payload: AuthDenyRequest,
) -> Result<(), AuthApprovalError> {
    let active_account = state
        .accounts_config
        .lock()
        .unwrap()
        .get_active_account()
        .ok_or(AuthApprovalError::Unauthorized)?
        .clone();
    let steam_guard_account: SteamGuardAccount = active_account.into();
    let mut login_approver = LoginApprover::new(
        state.transport.clone(),
        steam_guard_account.tokens.as_ref().unwrap(),
    );
    login_approver
        .deny(&steam_guard_account, Challenge::new(1, payload.client_id))
        .inspect_err(|err| {
            log::debug!("Received error while trying to deny session: {err:?}");
        })
        .map_err(AuthApprovalError::from)
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
