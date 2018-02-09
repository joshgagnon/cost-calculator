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

const appReducer: Reducer<any> = combineReducers<any>({
    routing,
    form,
    document,
    dialogs,
    saved
});



export default appReducer;
