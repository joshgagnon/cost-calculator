declare let DEV : boolean;



declare namespace CC {

    interface Rate {
        category: string,
        rate: number
    }

    interface AllocationItem {
        allocationCode: string,
        A?: number,
        B?: number,
        C?: number,
        label: string,
        explaination?: string,
    }

    interface Allocation {
        label: string,
        items: [AllocationItem]
    }

    interface AllocationMap {
        [allocationCode: string]: AllocationItem
    }

    interface Scheme {
        rates: [Rate],
        allocations: [Allocation],
        allocationMap: AllocationMap

    }

    interface Schemes {
        [name: string]: Scheme
    }


    interface AllocationEntry {
        allocationCode: string,
        description: string,
        band: string,
        rate: number,
        rateCode: number,
        days: number,
        amount: number,
        date: Date
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
