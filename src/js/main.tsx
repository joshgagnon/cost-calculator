"use strict";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Root from "./root";
import configureStore from './configureStore';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import * as moment from 'moment';
import * as momentLocalizer from 'react-widgets-moment';
momentLocalizer(moment);

const store = configureStore(browserHistory, {});
const history = syncHistoryWithStore(browserHistory, store);

try{
    const input : any = JSON.parse(document.getElementById("token").textContent)
    window._CSRF_TOKEN = input['_csrf_token'];
}catch(e){

}

ReactDOM.render(
     <Root store={store} history={history} />,
    document.getElementById('main')
);

