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