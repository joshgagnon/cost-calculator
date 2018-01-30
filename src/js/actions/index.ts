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