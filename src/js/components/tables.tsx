import * as React from "react";
import {  Button, Glyphicon, ButtonGroup } from 'react-bootstrap';
import { formatCurrency, numberWithCommas, DATE_FORMAT } from '../utils';
import * as moment from 'moment';


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
