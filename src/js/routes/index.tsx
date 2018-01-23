import * as React from 'react';
import { IndexRoute, Route } from 'react-router';
import App from '../components/app';


export default () => {
    return (
        <Route path='/' component={App}>

        </Route>
    );
}
