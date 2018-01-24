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
        days: number,
        amount: number
    }
}

declare module "*.json" {
    const value: any;
    export default value;
}


