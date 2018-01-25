import * as React from "react";
import { reduxForm, InjectedFormProps, Field, WrappedFieldProps, formValues, FormSection, FieldArray, formValueSelector, getFormValues, WrappedFieldArrayProps, submit } from 'redux-form';
import { FormGroup, ControlLabel, FormControl, Form, Col, Grid, Tabs, Tab, Button, Glyphicon, ProgressBar, Modal } from 'react-bootstrap';
import * as HighCourt from '../data/High Court.json';
import { connect } from 'react-redux';
import * as DateTimePicker from 'react-widgets/lib/DateTimePicker'
import * as moment from 'moment';

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

const RateSelector = formValueSelector('cc');
const AddItemSelector = formValueSelector('addItem');


interface SchemeNamedCourtCosts {
    scheme: string
}

export class RateAndBand extends React.PureComponent<{scheme: CC.Scheme}> {
    render() {
        return [<Field key={0} title={'Daily Rate'} name={'rateCode'} component={SelectFieldRow} validate={required}>
                { this.props.scheme && this.props.scheme.rates.map((rate: any) => {
                    return <option key={rate.category} value={rate.category}>{ `${rate.category} - $${numberWithCommas(rate.rate)}` }</option>
                }) }
            </Field>,
              <Field key={1} title={'Band'} name={'band'} component={SelectFieldRow} validate={required}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </Field>]
    }
}

export class AllocationSelect extends React.PureComponent<{scheme: CC.Scheme}> {
    render() {
        return <Field title={'Allocation'} name={'allocationCode'} component={SelectFieldRow} validate={required}>
                <option value="" disabled>Please Select...</option>
                { this.props.scheme && this.props.scheme.allocations.map((allocation: any, index: number) => {
                    return <optgroup key={index} label={allocation.label}>
                        { allocation.items.map((item: any, index: number) => {
                            return <option key={index} value={item.allocationCode}>{ `${item.allocationCode} - ${item.label}` }</option>
                        })}
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
                        return <tr key={index} onClick={() => this.props.editItem(item, index)}>
                            <td>{ item.allocationCode }</td>
                            <td>{ item.description }</td>
                            <td>{ moment(item.date).format(DATE_FORMAT) }</td>
                            <td>{ `$${numberWithCommas(item.rate)}` }</td>
                            <td>{ item.band }</td>
                            <td>{ item.days }</td>
                            <td>{ `$${numberWithCommas(item.amount)}` }</td>
                            <td><Button bsSize='xs' onClick={(e) => this.props.remove(e, index)}><Glyphicon glyph="remove"/></Button> </td>
                        </tr>
                    }) }
                </tbody>
            </table>
        </div>
    }
}


class SelectDays extends React.PureComponent<{scheme: CC.Scheme, allocationCode: string}> {

    render(){
        const allocationCode = this.props.scheme.allocationMap[this.props.allocationCode];
        if(!allocationCode || !allocationCode.explaination){
            return false;
        }
        return [
            <FormGroup key="explaination">
                <Col sm={3} className="text-right">
                    <ControlLabel>Explaination</ControlLabel>
                </Col>
                <Col sm={7}>
                    { allocationCode.explaination }
                </Col>
            </FormGroup>,
            <Field key={1} name="days" title="Days" component={NumberFieldRow} />
        ]
    }
}


const ConnnectedSelectDays = connect<{}, {}, {scheme: CC.Scheme}>(state => ({
    allocationCode: AddItemSelector(state, 'allocationCode')
}))(SelectDays as any);

export class AddItem extends React.PureComponent<{scheme: CC.Scheme} & InjectedFormProps> {
    render() {
        const { error, handleSubmit } = this.props;
        return  <Form horizontal  onSubmit={handleSubmit}>
            <Field title="Date" name="date" component={DateFieldFieldRow} validate={required} />
            <RateAndBand scheme={this.props.scheme} />
            <AllocationSelect scheme={this.props.scheme} />
            <ConnnectedSelectDays scheme={this.props.scheme} />
        </Form>
    }
}

const findRate = (scheme: CC.Scheme, rateCode: string) =>  {
    return (scheme.rates.find((rate : CC.Rate) => rate.category === rateCode) || {rate : 0}).rate;
}

const findDescription = (scheme: CC.Scheme, allocationCode: string) =>  {
    return scheme.allocationMap[allocationCode].label;
}

const findDays = (scheme: CC.Scheme, allocationCode: string, band: string, days?: string) =>  {
    const item = scheme.allocationMap[allocationCode] as CC.AllocationItem;
    if(item.explaination){
        return days;
    }
    return (item as any)[band];
}

const calculateAmount = (scheme: CC.Scheme, allocationCode: string, rate: number, band: string) => {
    const days = findDays(scheme, allocationCode, band);
    return days * rate;
}

const AddItemForm = reduxForm<{scheme: CC.Scheme}>({
    form: 'addItem',
})(AddItem) as any;

interface AddItemProps {
    scheme: CC.Scheme, submit: () => void,
    defaults: {rateCode: number, band:string}
}


export class AddItemModal extends React.PureComponent<AddItemProps & WrappedFieldArrayProps<CC.AllocationEntry>, {showAddItem: boolean, values?: CC.AllocationEntry, editIndex?: number}> {
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

    prepareValues(values : any){
        const rate = findRate(this.props.scheme, values.rateCode);
        const description = findDescription(this.props.scheme, values.allocationCode);
        return {
            allocationCode: values.allocationCode,
            description,
            band: values.band,
            rate,
            date: values.date,
            rateCode: values.rateCode,
            days: findDays(this.props.scheme, values.allocationCode, values.band, values.days),
            amount:  calculateAmount(this.props.scheme, values.allocationCode, rate, values.band)
        };
    }

    addItem(values : any) {
        this.props.fields.push(this.prepareValues(values));
        this.handleClose();
    }

    handleSubmit(values : any) {
        if(this.state.values){
            this.props.fields.remove(this.state.editIndex);
            // ugly, ugly hack
            setTimeout(() => this.props.fields.insert(this.state.editIndex, this.prepareValues(values)), 0)
        }
        else{
            this.props.fields.push(this.prepareValues(values));
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
        const subtotal = this.props.fields.getAll().reduce((acc: number, item: CC.AllocationEntry) => {
            return item.amount + acc
        }, 0)
        return [
            <h3 key={-2}>Costs</h3>,
            <ItemTable key={-1} {...this.props} editItem={this.editItem} remove={this.remove}/>,
            <div  key={0} className="">
             <Button bsStyle="primary"  onClick={this.handleShow}>
                Add Item
                </Button>
                <div className="pull-right">
                <strong>Subtotal: { `$${numberWithCommas(subtotal)}` }</strong>
                </div>
               </div>,
            <Modal key={1} show={this.state.showAddItem} onHide={this.handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{ this.state.values ? 'Edit Item' : 'Add Item' }</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <AddItemForm scheme={this.props.scheme} onSubmit={this.handleSubmit} initialValues={{date: new Date(), ...(this.state.values || this.props.defaults)}}/>
           </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.handleClose}>Close</Button>
                <Button bsStyle="primary" onClick={this.submit}>{ this.state.values ? 'Edit Item' : 'Add Item' }</Button>
            </Modal.Footer>
           </Modal>]
    }
}

const ConnectedAddItemModal = connect((state) => ({
    defaults: RateSelector(state, 'rateCode', 'band'),
}), {submit: () => submit('addItem')})(AddItemModal);


export class UnSchemedCourtCosts extends React.PureComponent<SchemeNamedCourtCosts> {

    render() {
        return [
             <RateAndBand key={'rateAndBand'} scheme={Schemes[this.props.scheme]} />,
            <FieldArray key={'addItem'} name="items" component={ConnectedAddItemModal  as any} props={{scheme: Schemes[this.props.scheme]}} />
         ];
    }
}

const SchemedCourtCosts = connect(state => ({
    scheme: RateSelector(state, 'scheme')
}))(UnSchemedCourtCosts as any);


export class CourtCostsForm extends React.PureComponent<{}> {
    render() {
        return <Form horizontal>
            <Field title={'Scheme'} name={'scheme'} component={SelectFieldRow}>
                { Object.keys(Schemes).map((scheme: string) => {
                    return <option key={scheme} value={scheme}>{ scheme }</option>
                }) }
            </Field>
            <SchemedCourtCosts />

        </Form>
    }
}

const massageScheme = (scheme: any) => {
    scheme.allocationMap = scheme.allocations.reduce((acc: CC.AllocationMap, allocation: CC.Allocation) => {
        allocation.items.map((allocationItem: CC.AllocationItem) => {
            acc[allocationItem.allocationCode] = allocationItem;
        })
        return acc;
    }, {});
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
        items: []
    }
})(CourtCosts as any);