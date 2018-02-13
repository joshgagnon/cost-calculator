import * as React from "react";
import * as ReactDOM from "react-dom";
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Dropdown, MenuItem, Navbar, Nav, NavItem, NavDropdown} from 'react-bootstrap';
import { Provider } from 'react-redux';
import { showSignUp } from '../actions';

export class AccountControls extends React.PureComponent {
    render() {
        return (
            <Dropdown id="account-dropdown" componentClass="li" className="control-icon">
                <Dropdown.Toggle href={`/account`} onClick={(e) => e.preventDefault()} useAnchor={true}>
                    <span className="fa fa-user-circle"/>
                </Dropdown.Toggle>

                <Dropdown.Menu >
                    <MenuItem rel="noopener noreferrer" target="_blank" href={`/account`}>CataLex Home</MenuItem>

                    <li className="separator" />

                    <MenuItem rel="noopener noreferrer" target="_blank" href='https://goodcompanies.catalex.nz'>Good Companies</MenuItem>
                    <MenuItem rel="noopener noreferrer" target="_blank" href='https://browser.catalex.nz'>Law Browser</MenuItem>
                    <MenuItem rel="noopener noreferrer" target="_blank" href='https://workingdays.catalex.nz'>Working Days</MenuItem>
                    <MenuItem rel="noopener noreferrer" target="_blank" href='https://concat.catalex.nz'>ConCat</MenuItem>
                    <MenuItem rel="noopener noreferrer" target="_blank" href='https://sign.catalex.nz'>Sign</MenuItem>

                    <li className="separator" />

                    <MenuItem href='/logout'>Log out</MenuItem>
                </Dropdown.Menu>
            </Dropdown>
        );

    }
}


export class Header extends React.PureComponent {
    render() {
        return (
            <Navbar collapseOnSelect>
                <ul className="nav navbar-nav navbar-right">
                    <AccountControls />
                </ul>
            </Navbar>
        );
    }
}


export class HeaderPublic extends React.PureComponent<{showSignUp: () => void}> {
    constructor(props: {showSignUp: () => void}){
        super(props);
        this.click = this.click.bind(this);
    }

    click(e: any) {
        e.preventDefault();
        return this.props.showSignUp();
    }
    render() {
        return (
            <Navbar collapseOnSelect>
                <ul className="nav navbar-nav navbar-right">
                    <li><a href="https://users.catalex.nz" onClick={this.click}>Sign In</a></li>
                </ul>
            </Navbar>
        );
    }
}


export class HeaderSelect extends React.PureComponent<{user: CC.CurrentUser, showSignUp: any}> {
    render() {
        if(this.props.user && this.props.user.email){
            return ReactDOM.createPortal(<Header />, document.getElementById('header-hook'))
        }
        return ReactDOM.createPortal(<HeaderPublic showSignUp={this.props.showSignUp} />, document.getElementById('header-hook'))
    }
}

const ConnectedHeader = connect((state: CC.State) => ({
    user: state.user
}), {
    showSignUp
})(HeaderSelect);

export default ConnectedHeader;