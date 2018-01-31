import * as React from "react";
import { reduxForm, InjectedFormProps, Field, WrappedFieldProps, formValues, FormSection, FieldArray, formValueSelector, getFormValues, WrappedFieldArrayProps, submit } from 'redux-form';
import { FormGroup, ControlLabel, FormControl, Form, Col, Grid, Tabs, Tab, Button, Glyphicon, ProgressBar, Modal, ButtonGroup } from 'react-bootstrap';
import Schemes from '../schemes';
import { connect } from 'react-redux';
import * as moment from 'moment';
import { render } from'../actions';
import { LoadingOverlay } from './loading';
import { AddDisbursementsForm, AddItemForm, findRate, hasBand, findDays, calculateAmount, prepareValues, SelectFieldRow,  SchemedCourtCosts, RateSelector, ConnectedDownloadForm } from './forms';
import { DisbursementsTable, ItemTable} from './tables';
import { formatCurrency, numberWithCommas } from '../utils';







interface AddItemProps {
    scheme: CC.Scheme, submit: () => void,
    defaults: {rateCode: number, band:string},
    prepareValues: (scheme: CC.Scheme, values: any) => any,
    tableComponent: React.ComponentClass<any>,
    formComponent: React.ComponentClass<any>,
    addText: string,
    title: string,
    modalNoun: string
}


//export class AddItemModal extends React.PureComponent<AddItemProps & WrappedFieldArrayProps<CC.CostEntry>, {showAddItem: boolean, values?: CC.CostEntry, editIndex?: number}> {


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
        const subtotal = this.props.fields.getAll().reduce((acc: number, item: CC.CostEntry) => {
            return item.amount + acc
        }, 0)
        const TableComponent = this.props.tableComponent;
        const FormComponent = this.props.formComponent;
        return [
            <h3 key={-2}>{ this.props.title }</h3>,
            <TableComponent key={-1} {...this.props} editItem={this.editItem} remove={this.remove}/>,
            <div  key={0} className="">
             <Button bsStyle="primary"  onClick={this.handleShow}>
               {this.props.addText}
                </Button>
                <div className="pull-right">
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
    defaults: RateSelector(state, 'rateCode', 'band'),
}), {submit: () => submit('addItem')})(CostsModalAndTable);

const ConnectedDisbursementsModalAndTable = connect((state) => ({
    defaults: {count: 1},
}), {submit: () => submit('addDisbursements')})(DisbursementsModalAndTable);






interface DownloadProps {
    values: any,
    scheme: CC.Scheme,
    download: (values: any) => void,
    submit: () => void
}

interface DownloadState {
    showingModal: boolean
}


export class Download extends React.PureComponent<DownloadProps, DownloadState> {

    constructor(props: DownloadProps) {
        super(props);
        this.download = this.download.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.state = {showingModal: false}
    }

    handleClose() {
        this.setState({ showingModal: false });
    }

    handleShow() {
        this.setState({ showingModal: true });
    }

    download(values: any) {
        this.props.download(prepareValues(this.props.scheme, this.props.values, values));
        this.handleClose();
    }

    render() {
        return  <div className="button-row">
                <Button bsStyle="primary" onClick={this.handleShow}>Download</Button>
                <Modal show={this.state.showingModal} onHide={this.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Download Schedule</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <ConnectedDownloadForm onSubmit={this.download} initialValues={{fileType: 'pdf', filename: 'Court Costs'}}/>
               </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.handleClose}>Close</Button>
                    <Button bsStyle="primary" onClick={this.props.submit}>Download</Button>
                </Modal.Footer>
               </Modal>


            </div>
    }
}

const ConnectedDownload = connect((state: CC.State) => ({
    values: getFormValues('cc')(state),
    scheme: Schemes[RateSelector(state, 'scheme')]
}), {download: (values: any) => render(values), submit: () => submit('download')})(Download as any)




export class Modals extends React.PureComponent<{downloading: boolean}> {
    render() {
        if(!this.props.downloading){
            return false;
        }
        return <LoadingOverlay />
    }
}


const ConnectedModals = connect((state: CC.State) => ({
    downloading: state.document.downloadStatus === CC.DownloadStatus.InProgress
}))(Modals as any)





export class CourtCostsForm extends React.PureComponent<{}> {
    render() {
        return <Form horizontal>
            <Field title={'Scheme'} name={'scheme'} component={SelectFieldRow}>
                { Object.keys(Schemes).map((scheme: string) => {
                    return <option key={scheme} value={scheme}>{ scheme }</option>
                }) }
            </Field>
            <SchemedCourtCosts itemsComponent={ConnectedCostsModalAndTable} disbursementsComponent={ConnectedDisbursementsModalAndTable}/>
            <ConnectedDownload />
            <ConnectedModals />
        </Form>
    }
}

export class CourtCosts extends React.PureComponent<{}> {
    render() {
        return <div className="container">
        <h1 className="text-center">Court Costs Prototype</h1>
            <CourtCostsForm />
        </div>
    }
}




export default reduxForm<{}>({
    form: 'cc',
    initialValues: {
        scheme: 'High Court',
        rateCode: '1',
        band: 'A',
        costs: [],
        disbursements: []
    }
})(CourtCosts as any);