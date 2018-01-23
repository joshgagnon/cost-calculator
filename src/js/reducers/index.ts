import { combineReducers, Reducer } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { reducer as form } from 'redux-form'


const appReducer: Reducer<any> = combineReducers<any>({
    routing,
    form,
});



export default appReducer;
