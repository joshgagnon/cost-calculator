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


    interface SavedItemSummary {
        saved_id: any,
        name: string,
    }

    interface Saved {
        status?: DownloadStatus,
        list: [SavedItemSummary]
    }

    interface CurrentUser {
        name?: string;
        userId?: number;
        email?: string;
        emailVerified?: boolean;
        subscribed?: boolean;
    }

    interface State {
        document: DocumentState,
        dialogs: DialogState,
        saved: Saved,
        user: CurrentUser;

    }
}


declare namespace CC.Actions {
    const enum Types {
        RENDER = 'RENDER',
        UPDATE_RENDER = 'UPDATE_RENDER',
        SHOW_CONFIRMATION = 'SHOW_CONFIRMATION',
        HIDE_CONFIRMATION = 'HIDE_CONFIRMATION',
        REQUEST_SAVED_LIST = 'REQUEST_SAVED_LIST',
        UPDATE_SAVED_LIST = 'UPDATE_SAVED_LIST',
        SAVE_STATE = 'SAVE_STATE',
        LOAD_STATE = 'LOAD_STATE',
        DELETE_STATE = 'DELETE_STATE',
        SHOW_SAVE = 'SHOW_SAVE',
        HIDE_SAVE = 'HIDE_SAVE',
        SHOW_LOAD = 'SHOW_LOAD',
        HIDE_LOAD = 'HIDE_LOAD',
        SHOW_SIGN_UP = 'SHOW_SIGN_UP',
        HIDE_SIGN_UP = 'HIDE_SIGN_UP',
        SHOW_UPGRADE = 'SHOW_UPGRADE',
        HIDE_UPGRADE = 'HIDE_UPGRADE',
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

    interface RequestSavedListPayload {

    }

    interface UpdateSavedListPayload {
        status: CC.DownloadStatus,
        list?: [CC.SavedItemSummary]
    }

    interface SaveStatePayload {
        saved_id?: any,
        name: string,
        data: any
    }

    interface LoadStatePayload {
        saved_id: any
    }

    interface DeleteStatePayload {
        saved_id: any;
    }

    interface RequestSavedList extends ActionCreator<RequestSavedListPayload> {}
    interface UpdateSavedList extends ActionCreator<UpdateSavedListPayload> {}
    interface SaveState extends ActionCreator<SaveStatePayload> {}
    interface LoadState extends ActionCreator<LoadStatePayload> {}
    interface DeleteState extends ActionCreator<DeleteStatePayload> {}

    interface ShowSave extends ActionCreator<void> {}
    interface HideSave extends ActionCreator<void> {}
    interface ShowLoad extends ActionCreator<void> {}
    interface HideLoad extends ActionCreator<void> {}

    interface ShowSignUp extends ActionCreator<void> {}
    interface HideSignUp extends ActionCreator<void> {}

    interface ShowUpgrade extends ActionCreator<void> {}
    interface HideUpgrade extends ActionCreator<void> {}
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
