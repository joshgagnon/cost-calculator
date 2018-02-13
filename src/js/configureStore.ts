import { createStore, applyMiddleware, compose} from 'redux';
import rootReducer from './reducers';
import { routerMiddleware } from 'react-router-redux';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';
import { accountMiddleware } from './middleware'

// using any for history due to changes in ts definition
export default function configureStore(history :any, initialState={}) {
    const loggerMiddleware = createLogger();
    const sagaMiddleware = createSagaMiddleware();

    const middleware =  DEV ?  applyMiddleware(
        accountMiddleware,
        sagaMiddleware,
        loggerMiddleware,
        routerMiddleware(history)
    ) : applyMiddleware(
        accountMiddleware,
        sagaMiddleware,
        routerMiddleware(history)
    )

    const createStoreWithMiddleware = compose(middleware)(createStore);
    const store = createStoreWithMiddleware(rootReducer, initialState);

    sagaMiddleware.run(rootSaga);

    return store;
}
