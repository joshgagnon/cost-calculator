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


const appReducer: Reducer<any> = combineReducers<any>({
    routing,
    form,
    document
});



export default appReducer;
