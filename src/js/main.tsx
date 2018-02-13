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


let data : any = {};

try{
    const input : any = JSON.parse(document.getElementById("token").textContent)
    window._CSRF_TOKEN = input['_csrf_token'];
}catch(e){

}

try{
    const input : any = JSON.parse(document.getElementById("data").textContent);
    if(input.user) {
        data.user = input.user;
    }
}catch(e){
    //do nothing
}

const store = configureStore(browserHistory, data);
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
     <Root store={store} history={history} />,
    document.getElementById('main')
);
