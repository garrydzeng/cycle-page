export interface DOMDriverOptions {
    modules?: Array<Object>;
    transposition?: boolean;
}
declare function makeDOMDriver(container: string | Element, options?: DOMDriverOptions): Function;
export { makeDOMDriver };
