import * as React from "react";
import { Provider } from 'react-redux';
import routes from './routes';
import { Router } from 'react-router';

import '../style/style.scss';

interface RootProps {
    history: any,
    store: any
}


class Root extends React.PureComponent<RootProps> {
    render() {
        return (
            <Provider store={this.props.store}>
                <Router history={this.props.history}>
                    { routes() }
                    { this.props.children }
                </Router>
            </Provider>
        );
    }
}

export default Root;