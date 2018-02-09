declare let DEV : boolean;

interface Window {
     _CSRF_TOKEN: string;
}


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
        items?: [CostItem],
        implicit?: boolean

    }

    interface CostMap {
        [costCode: string]: CostItem
    }


    interface Disbursement {
        label: string,
        items: [Disbursement]
        code: string,
        amount?: number
    }

    interface DisbursementMap {
        [code: string]: any
    }

    interface Scheme {
        rates: [Rate],
        costs: [Cost | CostItem],
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

    interface DocumentState {
        downloadStatus?: DownloadStatus;
        data?: any;

    }

    interface Confirmation {
        title: string,
        message: string,
        acceptLabel: string,
        rejectLabel: string,
        acceptActions?: [any],
        rejectActions?: [any]
    }

    interface DialogState {
        showing?: string,
        confirmation?: Confirmation
    }

    interface State {
        document: DocumentState,
        dialogs: DialogState
    }
}


declare namespace CC.Actions {
    const enum Types {
        RENDER = 'RENDER',
        UPDATE_RENDER = 'UPDATE_RENDER',
        SHOW_CONFIRMATION = 'SHOW_CONFIRMATION',
        HIDE_CONFIRMATION = 'HIDE_CONFIRMATION'
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

    interface ShowConfirmationPayload extends CC.Confirmation {

    }

    interface HideConfirmationPayload {}

    interface ShowConfirmation extends ActionCreator<ShowConfirmationPayload> {}
    interface HideConfirmation extends ActionCreator<HideConfirmationPayload> {}

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
