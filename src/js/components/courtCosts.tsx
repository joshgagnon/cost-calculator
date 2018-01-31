import * as React from "react";
import { reduxForm, InjectedFormProps, Field, WrappedFieldProps, formValues, FormSection, FieldArray, formValueSelector, getFormValues, WrappedFieldArrayProps, submit } from 'redux-form';
import { FormGroup, ControlLabel, FormControl, Form, Col, Grid, Tabs, Tab, Button, Glyphicon, ProgressBar, Modal, ButtonGroup } from 'react-bootstrap';
import * as HighCourt from '../data/High Court.json';
import { connect } from 'react-redux';
import * as DateTimePicker from 'react-widgets/lib/DateTimePicker'
import * as moment from 'moment';
import { render } from'../actions';
import { LoadingOverlay } from './loading';


const DATE_FORMAT = "DD MMM YYYY";


interface SchemedFieldProps {
    scheme : CC.Scheme
}

class SchemedField extends Field<SchemedFieldProps> {}

const required = (value : any) => (value ? undefined : 'Required')


function FieldRow(Component: any) : any {

    return class Wrapped extends React.PureComponent<any> {
        getValidationState() {
            if(this.props.meta.touched){
                return this.props.meta.valid ? 'success' : 'error';
            }
            return null;
        }

        render(){
            const props = this.props;
            return <FormGroup validationState={this.getValidationState()}>
                <Col sm={3} className="text-right">
                    <ControlLabel>{ props.title }</ControlLabel>
                </Col>
                <Col sm={7}>
                     <Component {...props} />
                    <FormControl.Feedback />
                </Col>
            </FormGroup>
        }

    }
}

export function numberWithCommas(x: number | string) : string {
    if(!x) {
        return '0';
    }
    const parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export function formatCurrency(x: number | string) : string {
    if(!x) {
        return '$0.00';
    }
    const parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `$${parts.join(".")}`;
}



class RenderDateTimePicker extends React.PureComponent<WrappedFieldProps> {
    render() {
        const  { input: { onChange, value }} = this.props;
        return   <DateTimePicker
            onChange={onChange}
            format={DATE_FORMAT}
            time={false}
            value={!value ? null : new Date(value)}
          />
    }
}


class SelectField extends React.PureComponent<WrappedFieldProps> {
    render() {
        return <FormControl {...this.props.input} componentClass="select">
            { this.props.children }
        </FormControl>
    }
}

class TextField extends React.PureComponent<WrappedFieldProps> {
    render() {
        return <FormControl {...this.props.input} componentClass="input" />
    }
}

class TextAreaField extends React.PureComponent<WrappedFieldProps> {
    render() {
        return <FormControl {...this.props.input} componentClass="textarea" />
    }
}

class NumberField extends React.PureComponent<WrappedFieldProps> {
    render() {
        return <FormControl {...this.props.input} componentClass="input" type='number' step="0.05" />
    }
}

class IntegerField extends React.PureComponent<WrappedFieldProps> {
    render() {
        return <FormControl {...this.props.input} componentClass="input" type='number' step="1" />
    }
}

class DateField extends React.PureComponent<WrappedFieldProps> {
    render() {
        return <FormControl {...this.props} componentClass={RenderDateTimePicker}  />
    }
}

const DateFieldFieldRow = FieldRow(DateField)
const SelectFieldRow = FieldRow(SelectField);
const TextFieldRow = FieldRow(TextField);
const TextAreaFieldRow = FieldRow(TextAreaField);
const NumberFieldRow = FieldRow(NumberField);
const IntegerFieldRow = FieldRow(IntegerField);

const RateSelector = formValueSelector('cc');
const AddItemSelector = formValueSelector('addItem');
const AddDisbursementSelector = formValueSelector('addDisbursements');


interface SchemeNamedCourtCosts {
    scheme: string
}

export class Rate extends React.PureComponent<{scheme: CC.Scheme}> {
    render() {
        return <Field  title={'Daily Rate'} name={'rateCode'} component={SelectFieldRow} validate={required}>
                { this.props.scheme && this.props.scheme.rates.map((rate: any) => {
                    return <option key={rate.category} value={rate.category}>{ `${rate.category} - ${formatCurrency(rate.rate)}` }</option>
                }) }
            </Field>
    }
}

export class Band extends React.PureComponent<{scheme: CC.Scheme}> {
    render() {
        return  <Field  title={'Band'} name={'band'} component={SelectFieldRow} validate={required}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </Field>
    }
}

export class CostSelect extends React.PureComponent<{scheme: CC.Scheme, onChange: (event : React.FormEvent<HTMLSelectElement>, value: string) => void }> {
    render() {
        return <Field title={'Cost'} name={'costCode'} component={SelectFieldRow} validate={required} onChange={this.props.onChange}>
                <option value="" disabled>Please Select...</option>
                { this.props.scheme && this.props.scheme.costs.map((cost: any, index: number) => {
                    return <optgroup key={index} label={cost.label}>
                        { cost.items.map((item: any, index: number) => {
                            return <option key={index} value={item.costCode}>{ `${item.costCode} - ${item.label}` }</option>
                        })}
                    </optgroup>
                }) }
            </Field>
    }
}

export class DisbursementsSelect extends React.PureComponent<{scheme: CC.Scheme, onChange: (event : React.FormEvent<HTMLSelectElement>, value: string) => void }> {
    render() {

        let path = [] as [string];
        const recurse = (acc: [any], item: any, index: number) => {
            path.push(item.code)
            const value = path.join('')
            acc.push(<option key={value} value={value} disabled={!item.amount}>{ `${item.code.padStart(8 * (path.length-1)).replace(/ /g, '\u00A0')} - ${item.label}` }</option>);
            acc = item.items ? item.items.reduce(recurse, acc) : acc;
            path.pop();
            return acc;
        }

        return <Field title={'Disbursement'} name={'code'} component={SelectFieldRow} validate={required}  onChange={this.props.onChange}>
                <option value="" disabled>Please Select...</option>
                <option value="custom">Custom Disbursement</option>
                { this.props.scheme && this.props.scheme.disbursements.map((cost: any, index: number) => {
                    return <optgroup key={index} label={cost.label}>
                        { cost.items.reduce(recurse, []) }

                    </optgroup>
                }) }
            </Field>
    }
}



export class ItemTable extends React.PureComponent<any> {
    render() {
        return <div>
            <table className="table table-striped">
                <thead>
                    <tr>
                    <th>Item</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Rate</th>
                    <th>Band</th>
                    <th>Days</th>
                    <th>Amount</th>
                    <th></th>
                    </tr>
                </thead>
                <tbody>
                    { this.props.fields.getAll().map((item: any, index: number) => {
                        return <tr key={index}>
                            <td>{ item.costCode }</td>
                            <td>{ item.description }</td>
                            <td>{ moment(item.date).format(DATE_FORMAT) }</td>
                            <td>{ `${formatCurrency(item.rate)}` }</td>
                            <td>{ item.band || '-' }</td>
                            <td>{ item.days }</td>
                            <td>{ `${formatCurrency(item.amount)}` }</td>
                            <td className="button-cell">
                            <ButtonGroup>
                                <Button bsSize='sm' onClick={() => this.props.editItem(item, index)}><Glyphicon glyph="pencil"/></Button>
                                <Button bsSize='sm' onClick={(e) => this.props.remove(e, index)}><Glyphicon glyph="remove"/></Button>
                             </ButtonGroup>
                            </td>
                        </tr>
                    }) }
                </tbody>
            </table>
        </div>
    }
}

export class DisbursementsTable extends React.PureComponent<any> {
    render() {
        return <div>
            <table className="table table-striped">
                <thead>
                    <tr>
                    <th>Item</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Item Cost</th>
                    <th>Count</th>
                    <th>Amount</th>
                    <th></th>
                    </tr>
                </thead>
                <tbody>
                    { this.props.fields.getAll().map((item: any, index: number) => {
                        return <tr key={index} onClick={() => this.props.editItem(item, index)}>
                            <td>{ item.code }</td>
                            <td>{ item.description }</td>
                            <td>{ moment(item.date).format(DATE_FORMAT) }</td>
                            <td>{ `${formatCurrency(item.itemAmount)}` }</td>
                            <td>{ `${numberWithCommas(item.count)}` }</td>
                            <td>{ `${formatCurrency(item.amount)}` }</td>
                            <td><Button bsSize='xs' onClick={(e) => this.props.remove(e, index)}><Glyphicon glyph="remove"/></Button> </td>
                        </tr>
                    }) }
                </tbody>
            </table>
        </div>
    }
}



const bandedCostMap = (state: CC.State, ownProps: {scheme: CC.Scheme}) => {
    const costCode = AddItemSelector(state, 'costCode');
    const cost = ownProps.scheme.costMap[costCode];
    const hasBands = !costCode || !cost.explaination;
    return {
        cost,
        hasBands
    }
};


const disbursementMap = (state: CC.State, ownProps: {scheme: CC.Scheme}) => {
    const { code, count, amount } = AddDisbursementSelector(state, 'code', 'count', 'amount');
    let disbursement = ownProps.scheme.disbursementMap[code];
    const custom = code === 'custom';
    if(disbursement){
        disbursement = disbursement[disbursement.length -1];
    }
    const noFee = disbursement && disbursement.amount === 'no fee';
    const userDefined = !disbursement && (!noFee || typeof disbursement.amount !== 'number');
    const calcAmount = noFee ? 0 : (userDefined ? amount : disbursement.amount);
    return {
        custom,
        count,
        amount: calcAmount,
        disbursement,
        noFee,
        userDefined
    }
};

interface AddItemProps{
    scheme: CC.Scheme,
    hasBands: boolean,
    cost: CC.CostItem
}

type AddItemFormProps = AddItemProps & InjectedFormProps;

export class AddItem extends React.PureComponent<AddItemFormProps> {
    constructor(props: AddItemFormProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event: React.FormEvent<HTMLSelectElement>, value: string) {
        const description = findDescription(this.props.scheme, value);
        this.props.change('description', description || '');

    }

    render() {
        const { error, handleSubmit, hasBands, cost } = this.props;
        return  <Form horizontal  onSubmit={handleSubmit}>
            <Field title="Date" name="date" component={DateFieldFieldRow} validate={required} />
            <Rate scheme={this.props.scheme} />
            <CostSelect scheme={this.props.scheme} onChange={this.handleChange}/>
            <Field title="Description" name="description"  component={TextAreaFieldRow} validate={required} />
            {hasBands && <Band scheme={this.props.scheme} />}
            {!hasBands && <FormGroup key="explaination">
                <Col sm={3} className="text-right">
                    <ControlLabel>Explaination</ControlLabel>
                </Col>
                <Col sm={7}><div className="form-text">
                    { this.props.cost.explaination }
                    </div>
                </Col>
            </FormGroup> }
            {!hasBands && <Field name="days" title="Days" component={NumberFieldRow} /> }
        </Form>
    }
}

const findRate = (scheme: CC.Scheme, rateCode: string) =>  {
    return (scheme.rates.find((rate : CC.Rate) => rate.category === rateCode) || {rate : 0}).rate;
}

const findDescription = (scheme: CC.Scheme, costCode: string) =>  {
    return scheme.costMap[costCode].label;
}

const hasBand = (scheme: CC.Scheme, costCode: string) =>  {
    return !scheme.costMap[costCode].explaination;
}

const findDays = (scheme: CC.Scheme, costCode: string, band: string, days?: number) =>  {
    const item = scheme.costMap[costCode] as CC.CostItem;
    if(item.explaination){
        return days;
    }
    return (item as any)[band];
}

const calculateAmount = (scheme: CC.Scheme, costCode: string, rate: number, band: string, days?: number) => {
    days = findDays(scheme, costCode, band, days);
    return days * rate;
}

const AddItemForm = reduxForm<{scheme: CC.Scheme}>({
    form: 'addItem',
})(connect<{}, {}, {scheme: CC.Scheme}>(bandedCostMap)(AddItem)) as any;


interface AddDisbursementsProps {
    scheme: CC.Scheme, userDefined: boolean, noFee: boolean, disbursement: CC.Disbursement, count: number, amount: number, custom: boolean
}

type AddDisbursementFormProps = AddDisbursementsProps & InjectedFormProps;

export class AddDisbursements extends React.PureComponent<AddDisbursementFormProps> {
    constructor(props: AddDisbursementFormProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event: React.FormEvent<HTMLSelectElement>, value: string) {
        const disbursementList = this.props.scheme.disbursementMap[value];
        let description = ''
        if(disbursementList){
            description = disbursementList.map((d: CC.Disbursement) => d.label).join('\n');
        }
        this.props.change('description', description);

    }

    render() {
        const { error, handleSubmit, userDefined, noFee, disbursement, custom  } = this.props;
        const showTotal = !!this.props.count && !!this.props.amount;
        return  <Form horizontal  onSubmit={handleSubmit}>
            <Field title="Date" name="date" component={DateFieldFieldRow} validate={required} />
            <DisbursementsSelect scheme={this.props.scheme} onChange={this.handleChange}/>
            <Field title="Description" name="description"  component={TextAreaFieldRow} validate={required} />
            { userDefined && <Field title="Item Cost" name="amount" component={NumberFieldRow} validate={required} /> }
            <Field title="Count" name="count" component={IntegerFieldRow} validate={required} />
            <FormGroup key="explaination">
                <Col sm={3} className="text-right">
                    <ControlLabel>Total</ControlLabel>
                </Col>
                <Col sm={7}>
                <div className="form-text">
                { showTotal && `${numberWithCommas(this.props.count)} x ${formatCurrency(this.props.amount)} = ` }
                { showTotal && <strong>{ `${formatCurrency((this.props.count * this.props.amount) || 0)}`}</strong> }
                { !showTotal && '$0'}
                </div>
                </Col>
               </FormGroup>
        </Form>
    }
}

const AddDisbursementsForm = reduxForm<{scheme: CC.Scheme}>({
    form: 'addDisbursements',
})(connect<{}, {}, {scheme: CC.Scheme}>(disbursementMap)(AddDisbursements)) as any;

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


export class DisplayTotal extends React.PureComponent<{lists: any}> {
    render() {
        const lists = this.props.lists;
        const costs = lists.costs.reduce((acc: number, item: CC.CostEntry) => {
            return item.amount + acc
        }, 0);
        const disbursements = lists.disbursements.reduce((acc: number, item: any) => {
            return item.amount + acc
        }, 0);
        const total = costs + disbursements;
        return <div className="text-right">
                <strong>Total: { `${formatCurrency(total)}` }</strong>
        </div>
    }
}

const ConnectedDisplayTotal = connect(state => ({
    lists: RateSelector(state, 'costs', 'disbursements')
}))(DisplayTotal as any);



export class UnSchemedCourtCosts extends React.PureComponent<SchemeNamedCourtCosts> {

    render() {
        return [

             <Rate key={'rate'} scheme={Schemes[this.props.scheme]} />,
             <Band key={'band'} scheme={Schemes[this.props.scheme]} />,
            <FieldArray key={'addItem'} name="costs" component={ConnectedCostsModalAndTable  as any} props={{scheme: Schemes[this.props.scheme]}} />,
            <FieldArray key={'addDisbursements'} name="disbursements" component={ConnectedDisbursementsModalAndTable  as any} props={{scheme: Schemes[this.props.scheme]}} />,
            <ConnectedDisplayTotal key={'total'}/>
         ];
    }
}

interface DownloadProps {
    values: any,
    scheme: CC.Scheme,
    download: (values: any) => void
}

function prepareValues(scheme: CC.Scheme, values: any){
    const rate = findRate(scheme, values.rateCode);
    const costTotal = values.costs.reduce((sum: number, costs: any) => sum + costs.amount, 0);
    const disbursementTotal = values.disbursements.reduce((sum: number, costs: any) => sum + costs.amount, 0)
    const result = {
        rateCode: values.rateCode,
        rate: formatCurrency(rate),
        costs: values.costs.map((c: any) => ({
            costCode: c.costCode,
            description: c.description,
            rateCode: c.rateCode,
            band: values.band,
            days: numberWithCommas(c.days),
            dateString: moment(c.date).format(DATE_FORMAT) ,
            amount: formatCurrency(c.amount)
        })),
        disbursements: values.disbursements.map((c: any) => ({
            code: c.code,
            description: c.description,
            itemCost: formatCurrency(c.itemCost),
            count: numberWithCommas(c.count),
            dateString: moment(c.date).format(DATE_FORMAT) ,
            amount: formatCurrency(c.amount)
        })),
        costsTotal: formatCurrency(costTotal),
        disbursementsTotal: formatCurrency(disbursementTotal),
        total: formatCurrency(costTotal + disbursementTotal)
    };

    return {
        formName: 'court_costs',
        templateTitle: 'Court Costs',
        values: result,
        metadata: {},
        env: 'cc'
    }
}

export class Download extends React.PureComponent<DownloadProps> {
    constructor(props: DownloadProps) {
        super(props);
        this.download = this.download.bind(this);
    }

    download() {
        this.props.download(prepareValues(this.props.scheme, this.props.values));
    }

    render() {
        return  <div className="button-row" onClick={this.download}>
                <Button bsStyle="primary">Download</Button>
            </div>
    }
}

const ConnectedDownload = connect((state: CC.State) => ({
    values: getFormValues('cc')(state),
    scheme: Schemes[RateSelector(state, 'scheme')]
}), {download: (values: any) => render(values)})(Download as any)


const SchemedCourtCosts = connect(state => ({
    scheme: RateSelector(state, 'scheme')
}))(UnSchemedCourtCosts as any);

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
            <SchemedCourtCosts />
            <ConnectedDownload />
            <ConnectedModals />
        </Form>
    }
}

const massageScheme = (scheme: any) => {
    scheme.costMap = scheme.costs.reduce((acc: CC.CostMap, cost: CC.Cost) => {
        cost.items.map((costItem: CC.CostItem) => {
            acc[costItem.costCode] = costItem;
        })
        return acc;
    }, {});


    let parts = [] as [CC.Disbursement];
    const recurse = (acc: any, item: any, index: number) => {
        parts.push(item)
        const value = parts.map(p => p.code).join('')
        acc[value] = [...parts];
        if(item.items){
            item.items.reduce(recurse, acc)
        }
        parts.pop();
        return acc;
    }
    scheme.disbursementMap = scheme.disbursements.reduce(recurse, {});
    return scheme as CC.Scheme;
}

const Schemes = {
    'High Court': massageScheme(HighCourt)
} as CC.Schemes;


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