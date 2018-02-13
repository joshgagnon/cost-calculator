import { combineReducers, Reducer } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { reducer as form } from 'redux-form'

const document = (state: CC.DocumentState = {}, action: any) => {
    switch(action.type){
        case CC.Actions.Types.UPDATE_RENDER:
            return {...state, ...action.payload}
    }
    return state;
}

const dialogs = (state: CC.DialogState = {}, action: any) => {
    switch(action.type){
        case CC.Actions.Types.SHOW_CONFIRMATION:
            return {...state, showing: 'confirmation', confirmation: action.payload}
        case CC.Actions.Types.HIDE_CONFIRMATION:
            return {...state, showing: null, confirmation: null}
        case CC.Actions.Types.SHOW_SAVE:
            return {...state, showing: 'save'}
        case CC.Actions.Types.HIDE_SAVE:
            return {...state, showing: null}
        case CC.Actions.Types.SHOW_LOAD:
            return {...state, showing: 'load'}
        case CC.Actions.Types.HIDE_LOAD:
            return {...state, showing: null}
        case CC.Actions.Types.SHOW_SIGN_UP:
            return {...state, showing: 'signUp'}
        case CC.Actions.Types.HIDE_SIGN_UP:
            return {...state, showing: null}
        case CC.Actions.Types.SHOW_UPGRADE:
            return {...state, showing: 'upgrade'}
        case CC.Actions.Types.HIDE_UPGRADE:
            return {...state, showing: null}

    }
    return state;
}

const saved = (state: CC.Saved = {list: [] as [CC.SavedItemSummary]}, action: any) => {
    switch(action.type){
        case CC.Actions.Types.UPDATE_SAVED_LIST:
            return {...action.payload}
    }
    return state;
}

const user = (state: CC.CurrentUser = {}) => {
    return state;
}

const appReducer: Reducer<any> = combineReducers<any>({
    routing,
    form,
    document,
    dialogs,
    saved,
    user
});



export default appReducer;
