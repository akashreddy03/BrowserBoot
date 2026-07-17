declare module "@novnc/novnc" {
    export default class RFB extends EventTarget {
        constructor(
            target: HTMLElement,
            url: string,
            options?: {
                credentials?: {
                    username?: string;
                    password?: string;
                    target?: string;
                };
                shared?: boolean;
                repeaterID?: string;
            }
        );

        disconnect(): void;
        sendCtrlAltDel(): void;

        scaleViewport: boolean;
        resizeSession: boolean;
        viewOnly: boolean;
        focusOnClick: boolean;
        clipViewport: boolean;
        background: string;
    }
}