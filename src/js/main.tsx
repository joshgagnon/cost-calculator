"use strict";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Root from "./root";
import configureStore from './configureStore';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

const store = configureStore(browserHistory, {});
const history = syncHistoryWithStore(browserHistory, store);


ReactDOM.render(
     <Root store={store} history={history} />,
    document.getElementById('main')
);

