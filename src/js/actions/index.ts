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

