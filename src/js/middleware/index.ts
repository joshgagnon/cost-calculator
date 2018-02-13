import { showSignUp, showUpgrade } from '../actions';

const ALLOWED_SCHEME = 'High Court';

function restrictedScheme(action: any){
    return (action.type === '@@redux-form/CHANGE' || action.type === '@@redux-form/BLUR')

            && action.meta.form === 'cc' && action.meta.field === 'scheme' && action.payload !== ALLOWED_SCHEME;
}

export function accountMiddleware({
    dispatch, getState
} : {dispatch: any, getState: any}) : any {
    return (next : any) => {
        return (action : any) => {
            // if not logged in, can't do a great deal
            // catch save, load, download, and ask user to sign up
            const user = getState().user;

            if(!user || !user.email){
                switch(action.type){
                    case CC.Actions.Types.SHOW_SAVE:
                    case CC.Actions.Types.SHOW_LOAD:
                    case CC.Actions.Types.RENDER:
                        return dispatch(showSignUp());
                }
                if(restrictedScheme(action)){
                    dispatch(showSignUp());
                    action = {
                        ...action,
                        payload: ALLOWED_SCHEME
                    }
                }
            }
            if(!user.subscribed){
                switch(action.type){
                    case CC.Actions.Types.RENDER:
                        return next(showUpgrade());
                }
                if(restrictedScheme(action)){
                    action = {
                        ...action,
                        payload: ALLOWED_SCHEME
                    }
                    dispatch(showUpgrade());
                }
            }
            next(action);
        }
    }
}