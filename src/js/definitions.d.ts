declare let DEV : boolean;



declare namespace CC {
    interface Scheme {
        rates: [{
            category: string,
            rate: number
        }],
        allocations: [{
            label: string,
            items: [{
                A?: number,
                B?: number,
                C?: number,
                label: string,
                explaination?: string,
            }]

        }]

    }

    interface Schemes {
        [name: string]: Scheme
    }
}

declare module "*.json" {
    const value: any;
    export default value;
}


