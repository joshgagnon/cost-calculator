import { createStore, applyMiddleware, compose} from 'redux';
import rootReducer from './reducers';
import { routerMiddleware } from 'react-router-redux';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';

// using any for history due to changes in ts definition
export default function configureStore(history :any, initialState={}) {
    const loggerMiddleware = createLogger();
    const sagaMiddleware = createSagaMiddleware();

    const middleware =  DEV ?  applyMiddleware(
        sagaMiddleware,
        loggerMiddleware,
        routerMiddleware(history)
    ) : applyMiddleware(
        sagaMiddleware,
        routerMiddleware(history)
    )

    const createStoreWithMiddleware = compose(middleware)(createStore);
    const store = createStoreWithMiddleware(rootReducer, initialState);

    sagaMiddleware.run(rootSaga);

    return store;
}
