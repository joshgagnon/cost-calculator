declare let DEV : boolean;



declare namespace CC {

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

    interface State {

    }
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
