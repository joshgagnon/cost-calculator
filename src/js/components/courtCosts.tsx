import * as React from "react";
import { reduxForm, InjectedFormProps, Field, WrappedFieldProps, formValues, FormSection, FieldArray, formValueSelector, getFormValues, WrappedFieldArrayProps, submit } from 'redux-form';
import { FormGroup, ControlLabel, FormControl, Form, Col, Grid, Tabs, Tab, Button, Glyphicon, ProgressBar, Modal } from 'react-bootstrap';
import * as HighCourt from '../data/High Court.json';
import { connect } from 'react-redux';


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
        return <FormControl {...this.props.input} componentClass="input" type='number' step="0.1" />
    }
}

const SelectFieldRow = FieldRow(SelectField);
const TextFieldRow = FieldRow(TextField);
const TextAreaFieldRow = FieldRow(TextAreaField);
const NumberFieldRow = FieldRow(NumberField);

const RateSelector = formValueSelector('cc');


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
                            return <option key={index} value={item.allocationCode}>{ item.label }</option>
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
                    <th>Band</th>
                    <th>Rate</th>
                    <th>Days</th>
                    <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    { this.props.fields.getAll().map((item: any, index: number) => {
                        return <tr key={index}>
                            <td>{ item.allocationCode }</td>
                            <td>{ item.description }</td>
                            <td>{ item.band }</td>
                            <td>{ item.rate }</td>
                            <td>{ item.days }</td>
                            <td>{ item.amount }</td>
                        </tr>
                    }) }
                </tbody>
            </table>
        </div>
    }
}

export class AddItem extends React.PureComponent<{scheme: CC.Scheme} & InjectedFormProps> {
    render() {
        const { error, handleSubmit } = this.props;
        return  <Form horizontal  onSubmit={handleSubmit}>
            <RateAndBand scheme={this.props.scheme} />
            <AllocationSelect scheme={this.props.scheme} />
            <Field  title={'Days'} name={'days'} component={NumberFieldRow} validate={required} />
        </Form>
    }
}

const findRate = (scheme: CC.Scheme, rateCode: string) =>  {
    return (scheme.rates.find((rate : CC.Rate) => rate.category === rateCode) || {rate : 0}).rate;
}

const findDescription = (scheme: CC.Scheme, allocationCode: string) =>  {
    return scheme.allocationMap[allocationCode].label;
}

const calculateAmount = (scheme: CC.Scheme, rate: number, band: string, days: number) => {
    return 0;
}

const AddItemForm = reduxForm<{scheme: CC.Scheme}>({
    form: 'addItem',
})(AddItem) as any;

export class AddItemModal extends React.PureComponent<{scheme: CC.Scheme, submit: () => void, defaults: {rateCode: number, band:string}} & WrappedFieldArrayProps<CC.AllocationEntry>, {showAddItem: boolean}> {
    constructor(props: any) {
        super(props);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.addItem = this.addItem.bind(this);
        this.submit = this.submit.bind(this);
        this.state = { showAddItem: false };
    }

    addItem(values : any) {
        const rate = findRate(this.props.scheme, values.rateCode);
        const description = findDescription(this.props.scheme, values.allocationCode);
        this.props.fields.push({
            allocationCode: values.allocationCode,
            description,
            band: values.band,
            rate,
            days: values.days,
            amount:  calculateAmount(this.props.scheme, rate, values.band, values.days)
        });
        this.handleClose();
    }

    handleClose() {
        this.setState({ showAddItem: false });
    }

    handleShow() {
        this.setState({ showAddItem: true });
    }

    submit() {
        this.props.submit();
    }

    render() {
        return [
            <div  key={0} className="button-row">
             <Button bsStyle="primary" onClick={this.handleShow}>
                Add Item
                </Button></div>,
            <Modal key={1} show={this.state.showAddItem} onHide={this.handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Item</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <AddItemForm scheme={this.props.scheme} onSubmit={this.addItem} initialValues={{...this.props.defaults, days: 1}}/>
           </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.handleClose}>Close</Button>
                <Button bsStyle="primary" onClick={this.submit}>Add Item</Button>
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
            <FieldArray key={'addItem'} name="items" component={ItemTable as any} props={{scheme: Schemes[this.props.scheme]}} />,
            <FieldArray key={'itemTable'} name="items" component={ConnectedAddItemModal as any} props={{scheme: Schemes[this.props.scheme]}} />,
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
            <div className="row">
                <div className="col-md-6 col-md-offset-3">
                    <CourtCostsForm />
                </div>
            </div>
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