import * as React from "react";
import { reduxForm, InjectedFormProps, Field, WrappedFieldProps, formValues, FormSection, FieldArray, formValueSelector, getFormValues, WrappedFieldArrayProps, submit,  initialize } from 'redux-form';
import { FormGroup, ControlLabel, FormControl, Form, Col, Grid, Tabs, Tab, Button, Glyphicon, ProgressBar, Modal, ButtonGroup, ListGroup, ListGroupItem } from 'react-bootstrap';
import Schemes from '../schemes';
import { connect } from 'react-redux';
import * as moment from 'moment';
import { render, hideConfirmation, showConfirmation, requestSavedList, saveState, loadState, deleteState, showSave, showLoad, hideSave, hideLoad } from'../actions';
import { LoadingOverlay } from './loading';
import { AddDisbursementsForm, AddItemForm, Uplift, findRate, hasBand, findDays, calculateAmount, prepareValues, SelectFieldRow,  SchemedCourtCosts, RateSelector, ConnectedDownloadForm, TextFieldRow, required, normalizeUplift } from './forms';
import { DisbursementsTable, ItemTable} from './tables';
import { formatCurrency, numberWithCommas } from '../utils';
import Loading from './loading';

const INITIAL_VALUES = {
        scheme: 'High Court',
        rateCode: '1',
        band: 'A',
        uplift: 0,
        costs: [],
        disbursements: []
    } as any;


interface AddItemProps {
    scheme: CC.Scheme, submit: () => void,
    defaults: {rateCode: number, band:string},
    prepareValues: (scheme: CC.Scheme, values: any) => any,
    tableComponent: React.ComponentClass<any>,
    formComponent: React.ComponentClass<any>,
    addText: string,
    title: string,
    modalNoun: string,
    additionalButtons: React.ComponentClass<any>,
    useUplift?: boolean,
    uplift?: number
}


export class TableAndModal extends React.PureComponent<AddItemProps & WrappedFieldArrayProps<CC.CostEntry | CC.DisbursementEntry>, {showAddItem: boolean, values?: CC.CostEntry, editIndex?: number}> {
    constructor(props: any) {
        super(props);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.editItem = this.editItem.bind(this);
        this.remove = this.remove.bind(this);
        this.submit = this.submit.bind(this);
        this.state = { showAddItem: false };
    }

    handleSubmit(values : any) {
        if(this.state.values){
            this.props.fields.remove(this.state.editIndex);
            // ugly, ugly hack
            setTimeout(() => this.props.fields.insert(this.state.editIndex, this.props.prepareValues(this.props.scheme, values)), 0)
        }
        else{
            this.props.fields.push(this.props.prepareValues(this.props.scheme, values));
        }
        this.handleClose();
    }

    editItem(values : any, editIndex: number) {
        this.setState({ showAddItem: true, values, editIndex });
    }

    handleClose() {
        this.setState({ showAddItem: false, values: null });
    }

    handleShow() {
        this.setState({ showAddItem: true, values: null });
    }

    submit() {
        this.props.submit();
    }

    remove(e: React.MouseEvent<HTMLElement>, index: number) {
        e.stopPropagation();
        this.props.fields.remove(index);
    }

    render() {
        let subtotal = this.props.fields.getAll().reduce((acc: number, item: CC.CostEntry) => {
            return item.amount + acc
        }, 0);
        let uplift = 0;
        if(this.props.useUplift && !!this.props.uplift){
            uplift = normalizeUplift(this.props.uplift);
            subtotal = subtotal + (uplift/100 * subtotal);
        }
        const TableComponent = this.props.tableComponent;
        const FormComponent = this.props.formComponent;
        const AdditionalButtons =  this.props.additionalButtons;
        return [
            <h3 key={-2}>{ this.props.title }</h3>,
            <TableComponent key={-1} {...this.props} editItem={this.editItem} remove={this.remove}/>,
            <div  key={0} className="button-row-left">
             <Button bsStyle="primary"  onClick={this.handleShow}>
               {this.props.addText}
                </Button>
                { !!AdditionalButtons && <AdditionalButtons hasUplift={!!uplift}/> }

                { this.props.useUplift && !!uplift && <div className="pull-right" >
                    <strong>Uplift: {uplift}% </strong>
                </div> }

                { this.props.useUplift && !!uplift && <div className="pull-right"    style={{clear: 'right'}}>
                    <strong>Uplift Amount: { formatCurrency(uplift/100 * subtotal) }  </strong>
                </div> }

                <div className="pull-right "  style={{clear: 'right'}}>
                <strong>Subtotal: { `${formatCurrency(subtotal)}` }</strong>
                </div>
               </div>,
            <Modal key={1} show={this.state.showAddItem} onHide={this.handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{ this.state.values ? 'Edit ' : 'Add ' }{ this.props.modalNoun}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <FormComponent scheme={this.props.scheme} onSubmit={this.handleSubmit} initialValues={{date: new Date(), ...(this.state.values || this.props.defaults)}}/>
           </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.handleClose}>Close</Button>
                <Button bsStyle="primary" onClick={this.submit}>{ this.state.values ? 'Edit ' : 'Add ' }{ this.props.modalNoun}</Button>
            </Modal.Footer>
           </Modal>]
    }
}

const CostsModalAndTable = (props: any) => {
    return <TableAndModal
        {...props}
        title='Costs'
        addText='Add Cost'
        modalNoun="Cost"
        tableComponent={ItemTable}
        formComponent={AddItemForm}
        additionalButtons={Uplift}
        useUplift={true}
        prepareValues={(scheme: CC.Scheme, values : any) => {
            const rate = findRate(scheme, values.rateCode);
            return {
                costCode: values.costCode,
                description: values.description,
                band: hasBand(scheme, values.costCode) ? values.band : null,
                rate,
                date: values.date,
                rateCode: values.rateCode,
                days: findDays(scheme, values.costCode, values.band, values.days),
                amount:  calculateAmount(scheme, values.costCode, rate, values.band, values.days)
            };
        }}
    />
}

const DisbursementsModalAndTable = (props: any) => {
    return <TableAndModal
        {...props}
        title='Disbursements'
        addText='Add Disbursement'
        modalNoun="Disbursement"
        tableComponent={DisbursementsTable}
        formComponent={AddDisbursementsForm}
        useUplift={false}
        prepareValues={(scheme: CC.Scheme, values : any) => {
            let description, amount;
            if(values.code === 'custom'){
                amount = values.amount;
            }
            else{
                const disbursementList = scheme.disbursementMap[values.code];
                const disbursement = disbursementList[disbursementList.length - 1];
                if(disbursement.amount === 'no fee'){
                    amount = 0;
                }
                else if(typeof disbursement.amount !== 'number') {
                    amount = values.amount;
                }
                else{
                    amount = disbursement.amount;
                }
            }
            return {
                code: values.code,
                description: values.description,
                itemAmount: amount,
                amount: values.count * amount,
                count: values.count,
                date: values.date
            };
        }}
    />
}

const ConnectedCostsModalAndTable = connect((state) => ({
    defaults: {...RateSelector(state, 'rateCode', 'band'), days: '0.25'},
    uplift:  RateSelector(state, 'uplift'),
}), {submit: () => submit('addItem')})(CostsModalAndTable);

const ConnectedDisbursementsModalAndTable = connect((state) => ({
    defaults: {count: 1},
}), {submit: () => submit('addDisbursements')})(DisbursementsModalAndTable);







export class DownloadModal extends React.PureComponent<{download: (values: any) => void, submit: () => void, handleClose: () => void}> {
    render(){
        return <Modal show={true} onHide={this.props.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Download Schedule</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <ConnectedDownloadForm onSubmit={this.props.download} initialValues={{fileType: 'pdf', filename: 'Court Costs'}}/>
               </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.handleClose}>Close</Button>
                    <Button bsStyle="primary" onClick={this.props.submit}>Download</Button>
                </Modal.Footer>
               </Modal>
    }

}


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


interface DownloadProps {
    values: any,
    scheme: CC.Scheme,
    download: (values: any) => void,
    submit: () => void
    reset: () => void,
    showSave: () => void,
    showLoad: () => void,
}

interface DownloadState {
    showingDownload: boolean
}

export class Controls extends React.PureComponent<DownloadProps, DownloadState> {

    constructor(props: DownloadProps) {
        super(props);
        this.download = this.download.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.showDownload = this.showDownload.bind(this);
        this.state = {showingDownload: false}
    }


    handleClose() {
        this.setState({showingDownload: false});
    }

    showDownload() {
        this.setState({ showingDownload: true });
    }

    download(values: any) {
        this.props.download(prepareValues(this.props.scheme, this.props.values, values));
        this.handleClose();
    }

    render() {
        return  <div className="button-row">
                <Button bsStyle="primary" onClick={this.showDownload}>Download</Button>
                <Button bsStyle="info" onClick={this.props.showSave}>Save</Button>
                <Button bsStyle="info" onClick={this.props.showLoad}>Load</Button>
                <Button bsStyle="default" onClick={this.props.reset}>Reset</Button>
                { this.state.showingDownload && <DownloadModal  submit={this.props.submit} download={this.download} handleClose={this.handleClose} /> }
            </div>
    }
}

const ConnectedControls = connect((state: CC.State) => ({
    values: getFormValues('cc')(state),
    scheme: Schemes[RateSelector(state, 'scheme')]
}), {download: (values: any) => render(values),
    submit: () => submit('download'),
    showSave: () => showSave(),
    showLoad: () => showLoad(),
    reset: () => showConfirmation({title: 'Reset Form',
                                  message: 'Are you sure you wish to reset the form?',
                                  rejectLabel: 'Cancel', acceptLabel: 'Reset',
                                  acceptActions: [initialize('cc', INITIAL_VALUES)]})}
                                  )(Controls as any)


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
        return false;
    }
}


const ConnectedModals = connect((state: CC.State) => ({
    downloading: state.document.downloadStatus === CC.DownloadStatus.InProgress,
    showing: state.dialogs.showing
}))(Modals as any)





export class CourtCostsForm extends React.PureComponent<{}> {
    render() {
        return <Form horizontal>
            <div className="row">
                <div className="col-md-offset-3 col-md-6">
                    <Field title={'Scheme'} name={'scheme'} component={SelectFieldRow}>
                        { Object.keys(Schemes).map((scheme: string) => {
                            return <option key={scheme} value={scheme}>{ scheme }</option>
                        }) }
                    </Field>
                </div>
            </div>
             <SchemedCourtCosts itemsComponent={ConnectedCostsModalAndTable} disbursementsComponent={ConnectedDisbursementsModalAndTable}/>
            <ConnectedControls />
            <ConnectedModals />
        </Form>
    }
}

export class CourtCosts extends React.PureComponent<{}> {
    render() {
        return <div className="container">
            <CourtCostsForm />
        </div>
    }
}




export default reduxForm<{}>({
    form: 'cc',
    initialValues: INITIAL_VALUES
})(CourtCosts as any);