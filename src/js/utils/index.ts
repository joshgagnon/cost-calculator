
export function numberWithCommas(x: number | string) : string {
    if(!x) {
        return '0';
    }
    const parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export function formatCurrency(x: number | string) : string {
    if(!x) {
        return '$0.00';
    }
    x = parseFloat(x.toString()).toFixed(2);
    const parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return `$${parts.join(".")}`;
}

export const DATE_FORMAT = "DD MMM YYYY"