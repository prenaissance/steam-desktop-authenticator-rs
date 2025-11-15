use std::time::{SystemTime, UNIX_EPOCH};

use steamguard::approver::Challenge;
use steamguard::protobufs::steammessages_auth_steamclient::CAuthentication_GetAuthSessionInfo_Response;
use steamguard::token::{Tokens, TwoFactorSecret};
use steamguard::{ApproverError, LoginApprover};

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
pub async fn get_sessions(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<AuthSessionResponse>, GetApprovalsError> {
    let tokens = state
        .accounts_config
        .lock()
        .unwrap()
        .get_active_account()
        .map(|active_account| {
            Tokens::new(
                active_account.access_token.clone(),
                active_account.refresh_token.clone(),
            )
        })
        .ok_or(GetApprovalsError::Unauthorized)?;

    let transport = state.transport.clone();
    let result = tauri::async_runtime::spawn_blocking(
        move || -> Result<Vec<(u64, CAuthentication_GetAuthSessionInfo_Response)>, _> {
            let login_approver = LoginApprover::new(transport, &tokens);
            login_approver
                .list_auth_sessions()
                .inspect(|client_ids| {
                    log::debug!(
                        "Loaded session ids: {client_ids:?}. Hydrating detailed information...",
                    );
                })?
                .into_iter()
                .map(|client_id| {
                    login_approver
                        .get_auth_session_info(client_id)
                        .map(|response| (client_id, response))
                })
                .collect()
        },
    )
    .await;

    result
        .map_err(|err| {
            log::error!("The spawned blocking task panicked or failed to join. {err}");
            ApproverError::Unknown(err.into())
        })
        .flatten()
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
pub async fn approve_session(
    state: tauri::State<'_, AppState>,
    payload: AuthApproveRequest,
) -> Result<(), AuthApprovalError> {
    let steam_guard_account = state
        .get_active_steam_guard_account()
        .ok_or(AuthApprovalError::Unauthorized)?;
    let transport = state.transport.clone();
    let result = tauri::async_runtime::spawn_blocking(move || {
        let mut login_approver =
            LoginApprover::new(transport, steam_guard_account.tokens.as_ref().unwrap());
        login_approver
            .approve(
                &steam_guard_account,
                Challenge::new(1, payload.client_id),
                payload.persistence,
            )
            .map_err(AuthApprovalError::from)
    })
    .await;

    result
        .map_err(|err| {
            log::error!("The spawned blocking task panicked or failed to join. {err}");
            AuthApprovalError::Unknown
        })
        .flatten()
}

#[tauri::command]
pub async fn deny_session(
    state: tauri::State<'_, AppState>,
    payload: AuthDenyRequest,
) -> Result<(), AuthApprovalError> {
    let steam_guard_account = state
        .get_active_steam_guard_account()
        .ok_or(AuthApprovalError::Unauthorized)?;
    let transport = state.transport.clone();
    let result = tauri::async_runtime::spawn_blocking(move || {
        let mut login_approver =
            LoginApprover::new(transport, steam_guard_account.tokens.as_ref().unwrap());
        login_approver
            .deny(&steam_guard_account, Challenge::new(1, payload.client_id))
            .map_err(AuthApprovalError::from)
    })
    .await;

    result
        .map_err(|err| {
            log::error!("The spawned blocking task panicked or failed to join. {err}");
            AuthApprovalError::Unknown
        })
        .flatten()
}

#[tauri::command]
pub async fn approve_qr_login(
    state: tauri::State<'_, AppState>,
    payload: ApproveQrLoginRequest,
) -> Result<(), AuthApprovalError> {
    let steam_guard_account = state
        .get_active_steam_guard_account()
        .ok_or(AuthApprovalError::Unauthorized)?;
    let transport = state.transport.clone();
    let result = tauri::async_runtime::spawn_blocking(move || {
        let mut login_approver =
            LoginApprover::new(transport, steam_guard_account.tokens.as_ref().unwrap());
        login_approver
            .approve_from_challenge_url(
                &steam_guard_account,
                payload.challenge_url,
                payload.persistence,
            )
            .map_err(|err| match err {
                ApproverError::Unauthorized => AuthApprovalError::Unauthorized,
                _ => AuthApprovalError::Unknown,
            })
    })
    .await;

    result
        .map_err(|err| {
            log::error!("The spawned blocking task panicked or failed to join. {err}");
            AuthApprovalError::Unknown
        })
        .flatten()
}
