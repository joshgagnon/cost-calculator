import * as React from "react";
import { reduxForm, InjectedFormProps, Field, WrappedFieldProps, formValues, FormSection, FieldArray, formValueSelector, getFormValues } from 'redux-form';
import { FormGroup, ControlLabel, FormControl, Form, Col, Grid, Tabs, Tab, Button, Glyphicon, ProgressBar, Modal } from 'react-bootstrap';
import * as HighCourt from '../data/High Court.json';
import { connect } from 'react-redux';

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

const SelectFieldRow = FieldRow(SelectField);
const TextFieldRow = FieldRow(TextField);
const TextAreaFieldRow = FieldRow(TextAreaField);

const RateSelector = formValueSelector('cc');

export class RateAndBand extends React.PureComponent<{scheme: CC.Scheme}> {
    render() {
        return [<Field key={0} title={'Daily Rate'} name={'rate'} component={SelectFieldRow}>
                { this.props.scheme && this.props.scheme.rates.map((rate: any) => {
                    return <option key={rate.category} value={rate.category}>{ `${rate.category} - $${numberWithCommas(rate.rate)}` }</option>
                }) }
            </Field>,
              <Field key={1} title={'Band'} name={'band'} component={SelectFieldRow}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </Field>]
    }
}

export class AllocationSelect extends React.PureComponent<{scheme: CC.Scheme}> {
    render() {
        return <Field title={'Allocation'} name={'allocation'} component={SelectFieldRow}>
                <option value="" disabled>Please Select...</option>
                { this.props.scheme && this.props.scheme.allocations.map((allocation: any, index: number) => {
                    return <optgroup key={index} label={allocation.label}>
                        { allocation.items.map((item: any, index: number) => {
                            return <option key={index} value={item.number}>{ item.label }</option>
                        })}
                    </optgroup>
                }) }
            </Field>
    }
}


export class AddItem extends React.PureComponent<any, {showAddItem: boolean}> {
    constructor(props: any) {
        super(props);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.state = { showAddItem: false };
    }

    handleClose() {
        this.setState({ showAddItem: false });
    }

    handleShow() {
        this.setState({ showAddItem: true });
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
                     <Form horizontal>
                        <FormSection name="addItem">
                            <RateAndBand scheme={this.props.scheme} />
                            <AllocationSelect scheme={this.props.scheme} />
                        </FormSection>
                        </Form>
                   </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleClose}>Close</Button>
                    </Modal.Footer>
                   </Modal>]
    }
}

interface SchemedCourtCosts {
    scheme: string
}

export class UnSchemedCourtCosts extends React.PureComponent<SchemedCourtCosts> {

    render() {
        return [
             <RateAndBand key={'rateAndBand'} scheme={Schemes[this.props.scheme]} />,
            <AddItem key={'addItem'} scheme={Schemes[this.props.scheme]} />
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



const Schemes = {
    'High Court': (HighCourt as any) as CC.Scheme
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
        scheme: 'High Court'
    }
})(CourtCosts as any);