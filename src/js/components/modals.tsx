import * as React from "react";
import { FormGroup, ControlLabel, FormControl, Form, Col, Grid, Tabs, Tab, Button, Glyphicon, ProgressBar, Modal, ButtonGroup, ListGroup, ListGroupItem } from 'react-bootstrap';
import { render, hideConfirmation, showConfirmation, requestSavedList, saveState, loadState, deleteState, showSave, showLoad, hideSave, hideLoad, hideUpgrade, hideSignUp, hideRestore } from'../actions';
import Loading, { LoadingOverlay } from './loading';
import { reduxForm, InjectedFormProps, Field, WrappedFieldProps, formValues, FormSection, FieldArray, formValueSelector, getFormValues, WrappedFieldArrayProps, submit,  initialize } from 'redux-form';
import { connect } from 'react-redux';
import { TextFieldRow, required } from './forms';


export class SaveModal extends React.PureComponent<{
    saveMode: boolean,
    handleClose: () => void,
    loading: boolean,
    entries: [CC.SavedItemSummary],
    courtCostsValues: any,
    request: () => void,
    save: (args: CC.Actions.SaveStatePayload) => void,
    overwrite: (args: CC.Actions.SaveStatePayload) => void,
    deleteEntry: (args: CC.Actions.DeleteStatePayload) => void,
    load: (args: CC.Actions.LoadStatePayload) => void,

    } & InjectedFormProps> {

    componentWillMount() {
        this.props.request();
    }

    save(values: any) {
        //localStorage.setItem(values.name, JSON.stringify(this.props.courtCostsValues));
        // if name collides, add id
        const match = this.props.entries.find((item: CC.SavedItemSummary) => {
            return item.name === values.name;
        })
        this.props.handleClose();;
        if(match){
            this.props.overwrite({name: values.name, data: this.props.courtCostsValues, saved_id: match.saved_id});
        }
        else{
            this.props.save({name: values.name, data: this.props.courtCostsValues});
        }
    }

    deleteItem(e: React.MouseEvent<Button>, saved_id: number) {
        e.stopPropagation();
        this.props.deleteEntry({saved_id});
    }

    handleClick(item: CC.SavedItemSummary) {
        if(this.props.saveMode){
             this.props.change('name', item.name)
        }
        else{
            this.props.load({saved_id: item.saved_id});
        }
    }


    render(){
        const { handleSubmit } = this.props;
        return <Modal show={true} onHide={this.props.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{ this.props.saveMode ? 'Save' : 'Load' }</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form horizontal >
                 { this.props.loading && <Loading />}
                    <ListGroup style={{ maxHeight: 200, overflowY: 'scroll' }}>
                    { this.props.entries.map((item: CC.SavedItemSummary) =>
                            <a className="btn btn-default list-group-item text-left" key={item.saved_id} onClick={() => this.handleClick(item)}>
                         { item.name }
                         <Button bsSize="xs" className="pull-right" onClick={(e) => this.deleteItem(e, item.saved_id) }><Glyphicon glyph="remove"/></Button>
                         </a>) }
                  </ListGroup>
                 { this.props.saveMode && <Field name="name" title="Name" component={TextFieldRow} validate={required}/> }
                </Form>
               </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.handleClose}>Close</Button>
                    { this.props.saveMode && <Button bsStyle="primary" onClick={handleSubmit((values) => this.save(values))}>Save</Button> }
                </Modal.Footer>
               </Modal>
    }
}


const ConnectedSaveModal = connect<{entries: [CC.SavedItemSummary], courtCostsValues: any, saveMode: boolean}, {}, {}>((state: CC.State) => {
    return {
        entries: state.saved.list || ([] as [CC.SavedItemSummary]),
        loading: state.saved.status !== CC.DownloadStatus.Complete,
        courtCostsValues: getFormValues('cc')(state),
        saveMode: true,
    };
}, {
    request: () => requestSavedList({}),
    save: (args: CC.Actions.SaveStatePayload) => saveState(args),
    overwrite: (args: CC.Actions.SaveStatePayload) => showConfirmation({title: 'Overwrite',
                                  message: 'Are you sure you wish to save over this entry?',
                                  rejectLabel: 'Cancel', acceptLabel: 'Overwrite',
                                  acceptActions: [saveState(args)],
                                  rejectActions: [showSave()]
                              }),
    deleteEntry: (args: CC.Actions.DeleteStatePayload) => showConfirmation({title: 'Deleted Saved Entry',
                                  message: 'Are you sure you wish to delete this entry?',
                                  rejectLabel: 'Cancel', acceptLabel: 'Delete',
                                  acceptActions: [deleteState(args), showSave()],
                                  rejectActions: [showSave()]
                              }),
    handleClose: () => hideSave()
})(reduxForm<{}>({form: 'save'})(SaveModal as any) as any);

const ConnectedLoadModal = connect<{entries: [CC.SavedItemSummary], courtCostsValues: any, saveMode: boolean}, {}, {}>((state: CC.State) => {
    return {
        entries: state.saved.list || ([] as [CC.SavedItemSummary]),
        loading: state.saved.status !== CC.DownloadStatus.Complete,
        courtCostsValues: getFormValues('cc')(state),
        saveMode: false,
    };
}, {
    request: () => requestSavedList({}),
    deleteEntry: (args: CC.Actions.DeleteStatePayload) => showConfirmation({title: 'Deleted Saved Entry',
                                  message: 'Are you sure you wish to delete this entry?',
                                  rejectLabel: 'Cancel', acceptLabel: 'Delete',
                                  acceptActions: [deleteState(args), showLoad()],
                                  rejectActions: [showLoad()]
                              }),
    load: (args: CC.Actions.LoadStatePayload) => showConfirmation({title: 'Load Saved Entry',
                                  message: 'Are you sure load this entry? All unsaved changes will be lost.',
                                  rejectLabel: 'Cancel', acceptLabel: 'Load',
                                  acceptActions: [loadState(args)],
                                  rejectActions: [showLoad()]
                              }),
    handleClose: () => hideLoad()
})(reduxForm<{}>({form: 'save'})(SaveModal as any) as any);

interface ConfirmationProps extends CC.Confirmation{
    hide: () => void,
    accept: () => void,
    reject: () => void
}

export class ConfirmationDialog extends React.PureComponent<ConfirmationProps> {
    render() {
        return <Modal show={true} onHide={this.props.reject}>
                <Modal.Header closeButton>
                    <Modal.Title>{ this.props.title }</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <p>{ this.props.message }</p>
               </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.reject}>{ this.props.rejectLabel }</Button>
                    <Button bsStyle="primary" onClick={this.props.accept}>{ this.props.acceptLabel }</Button>
                </Modal.Footer>
               </Modal>
    }
}

const ConnectedConfirmationDialog = connect((state: CC.State) => ({
    ...state.dialogs.confirmation
}), (dispatch) => ({ dispatch }), (ownProps: CC.Confirmation, dispatchProps: {dispatch: (args: any) => void}) => {
    return {
    ...ownProps,
    hide: () => dispatchProps.dispatch(hideConfirmation({})),
    reject: () => {
        dispatchProps.dispatch(hideConfirmation({}));
        (ownProps.rejectActions || []).map((action: any) => {
            return dispatchProps.dispatch(action)
        });
    },
    accept: () => {
        dispatchProps.dispatch(hideConfirmation({}));
        (ownProps.acceptActions || []).map((action: any) => {
            return dispatchProps.dispatch(action)
        });
    }
}})(ConfirmationDialog as any)


export class SignUp extends React.PureComponent<{handleClose: any}> {
    render(){
        return <Modal show={true} onHide={this.props.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Log In or Sign Up to Court Costs</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <p>Sign up or use your existing CataLex account to save and load your costs and disbursements.</p>
                <p>
                    You can also subscribe to CataLex Court Costs today to access other cost schemes and download your schedules in PDF, Word, and ODT formats.
                </p>
               </Modal.Body>
                <Modal.Footer>
                <a href="/signup" className="btn btn-primary">Log In or Sign Up</a>
                </Modal.Footer>
               </Modal>
    }

}

const ConnectedSignUp = connect(undefined, {
    handleClose: hideSignUp
})(SignUp)


export class Upgrade extends React.PureComponent<{handleClose: any}> {
    render(){
        return <Modal show={true} onHide={this.props.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Subscribe to Court Costs</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <p>
                    The free version of Court Costs allows you to calculate High Court costs only.
                    Please upgrade to calculate costs for the District Court, Court of Appeal, and Employment Court, download formatted costs schedules (in PDF, DOCX, or ODT).  It costs just $5 per month or $50 per year.
                </p>
               </Modal.Body>
                <Modal.Footer>
                <a href="/upgrade" className="btn btn-primary">Upgrade</a>
                </Modal.Footer>
               </Modal>
    }

}

const ConnectedUpgrade = connect(undefined, {
    handleClose: hideSignUp,
})(Upgrade)

interface RestoreProps {
    handleClose: () => void;
    setForm: (args: any) => void;
}

export class Restore extends React.PureComponent<RestoreProps> {
    constructor(props: RestoreProps) {
        super(props);
        this.handleNo = this.handleNo.bind(this);
        this.handleRestore = this.handleRestore.bind(this);
    }

    handleNo() {
        localStorage.removeItem('saved');
        this.props.handleClose();
    }

    handleRestore() {
        this.props.setForm(JSON.parse(localStorage.getItem('saved')));
        localStorage.removeItem('saved');
        this.props.handleClose();
    }

    render() {
        return <Modal show={true} onHide={this.props.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Restore Previous Session</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <p>
                    Would you like to restore your previous Court Cost's session?
                </p>
               </Modal.Body>
                <Modal.Footer>
                <Button onClick={this.handleNo}>No</Button>
                <Button onClick={this.handleRestore} bsStyle="primary">Restore</Button>
                </Modal.Footer>
               </Modal>
    }

}

const ConnectedRestore = connect(undefined, {
    handleClose: hideSignUp,
    setForm: (args: any) => initialize('cc', args)
})(Restore as any)


export class Modals extends React.PureComponent<{downloading: boolean, showing: string}> {
    render() {
        if(this.props.downloading){
            return <LoadingOverlay />
        }
        if(this.props.showing === 'confirmation'){
            return <ConnectedConfirmationDialog />
        }
        if(this.props.showing === 'save'){
            return <ConnectedSaveModal  />
        }
        if(this.props.showing === 'load'){
            return <ConnectedLoadModal/>
        }
        if(this.props.showing === 'signUp'){
            return <ConnectedSignUp />
        }
        if(this.props.showing === 'upgrade'){
            return <ConnectedUpgrade />
        }
        if(this.props.showing === 'restore'){
            return <ConnectedRestore />
        }
        return false;
    }
}


const ConnectedModals = connect((state: CC.State) => ({
    downloading: state.document.downloadStatus === CC.DownloadStatus.InProgress,
    showing: state.dialogs.showing
}))(Modals as any)

export default ConnectedModals;

