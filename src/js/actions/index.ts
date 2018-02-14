export function render(payload: CC.Actions.RenderPayload): CC.Actions.Render{
    return {
        type: CC.Actions.Types.RENDER,
        payload
    };
}


export function updateRender(payload: CC.Actions.UpdateRenderPayload): CC.Actions.UpdateRender{
    return {
        type: CC.Actions.Types.UPDATE_RENDER,
        payload
    };
}

export function showSave(): CC.Actions.ShowSave{
    return {
        type: CC.Actions.Types.SHOW_SAVE,
        payload: null
    };
}

export function hideSave(): CC.Actions.HideSave{
    return {
        type: CC.Actions.Types.HIDE_SAVE,
        payload: null
    };
}

export function showLoad(): CC.Actions.ShowLoad{
    return {
        type: CC.Actions.Types.SHOW_LOAD,
        payload: null
    };
}

export function hideLoad(): CC.Actions.HideLoad{
    return {
        type: CC.Actions.Types.HIDE_LOAD,
        payload: null
    };
}

export function showSignUp(): CC.Actions.ShowSignUp{
    return {
        type: CC.Actions.Types.SHOW_SIGN_UP,
        payload: null
    };
}

export function hideSignUp(): CC.Actions.HideSignUp{
    return {
        type: CC.Actions.Types.HIDE_SIGN_UP,
        payload: null
    };
}


export function showUpgrade(): CC.Actions.ShowUpgrade{
    return {
        type: CC.Actions.Types.SHOW_UPGRADE,
        payload: null
    };
}


export function hideUpgrade(): CC.Actions.HideUpgrade{
    return {
        type: CC.Actions.Types.HIDE_UPGRADE,
        payload: null
    };
}

export function showRestore(): CC.Actions.ShowRestore{
    return {
        type: CC.Actions.Types.SHOW_RESTORE,
        payload: null
    };
}


export function hideRestore(): CC.Actions.HideRestore{
    return {
        type: CC.Actions.Types.HIDE_RESTORE,
        payload: null
    };
}

export function showConfirmation(payload: CC.Actions.ShowConfirmationPayload): CC.Actions.ShowConfirmation{
    return {
        type: CC.Actions.Types.SHOW_CONFIRMATION,
        payload
    };
}


export function hideConfirmation(payload: CC.Actions.HideConfirmationPayload): CC.Actions.HideConfirmation{
    return {
        type: CC.Actions.Types.HIDE_CONFIRMATION,
        payload
    };
}

export function requestSavedList(payload: CC.Actions.RequestSavedListPayload): CC.Actions.RequestSavedList{
    return {
        type: CC.Actions.Types.REQUEST_SAVED_LIST,
        payload
    };
}

export function updateSavedList(payload: CC.Actions.UpdateSavedListPayload): CC.Actions.UpdateSavedList{
    return {
        type: CC.Actions.Types.UPDATE_SAVED_LIST,
        payload
    };
}


export function saveState(payload: CC.Actions.SaveStatePayload): CC.Actions.SaveState{
    return {
        type: CC.Actions.Types.SAVE_STATE,
        payload
    };
}

export function loadState(payload: CC.Actions.LoadStatePayload): CC.Actions.LoadState{
    return {
        type: CC.Actions.Types.LOAD_STATE,
        payload
    };
}

export function deleteState(payload: CC.Actions.DeleteStatePayload): CC.Actions.DeleteState{
    return {
        type: CC.Actions.Types.DELETE_STATE,
        payload
    };
}

