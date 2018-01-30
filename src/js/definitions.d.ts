declare let DEV : boolean;



declare namespace CC {

    const enum DownloadStatus {
        NotStarted,
        InProgress,
        Complete,
        Failed
    }

    interface Rate {
        category: string,
        rate: number
    }

    interface CostItem {
        costCode: string,
        A?: number,
        B?: number,
        C?: number,
        label: string,
        explaination?: string,
    }

    interface Cost {
        label: string,
        items: [CostItem]
    }

    interface CostMap {
        [costCode: string]: CostItem
    }


    interface Disbursement {
        label: string,
        items: [any]
        code: string
    }

    interface DisbursementMap {
        [code: string]: any
    }

    interface Scheme {
        rates: [Rate],
        costs: [Cost],
        costMap: CostMap,
        disbursements: [Disbursement],
        disbursementMap: DisbursementMap

    }

    interface Schemes {
        [name: string]: Scheme
    }


    interface CostEntry {
        costCode: string,
        description: string,
        band: string,
        rate: number,
        rateCode: number,
        days: number,
        amount: number,
        date: Date
    }

    interface DisbursementEntry {
        code: string,
        description: string,
        count: number,
        amount: number,
        date: Date
    }

    interface State {

    }
}


declare namespace CC.Actions {
    const enum Types {
        RENDER = 'RENDER',
        UPDATE_RENDER = 'UPDATE_RENDER',
    }

    interface ActionCreator<T> {
        type: CC.Actions.Types;
        payload: T;
    }

    interface Action {
        type: CC.Actions.Types;
    }

    interface RenderPayload {
        data: any
    }

    interface Render extends ActionCreator<RenderPayload> {}

    interface UpdateRenderPayload {
        downloadStatus: CC.DownloadStatus
        data?: any
    }

    interface UpdateRender extends ActionCreator<UpdateRenderPayload> {}

}



declare module "*.json" {
    const value: any;
    export default value;
}


declare module 'react-widgets/lib/DateTimePicker' {
    import { DateTimePicker } from "react-widgets";
    export = DateTimePicker;
}



declare module 'react-widgets-moment' {
    function momentLocalizer(moment : any): void;
    namespace momentLocalizer {}
    export = momentLocalizer;
}
