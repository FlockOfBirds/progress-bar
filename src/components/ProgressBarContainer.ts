import { Component, createElement } from "react";
import { BarType, BootstrapStyle, ProgressBar } from "./ProgressBar";
import { Alert } from "./Alert";

interface ProgressBarContainerProps {
    barType: BarType;
    bootstrapStyleAttribute: string;
    mxObject: mendix.lib.MxObject;
    maximumValueAttribute: string;
    onClickMicroflow?: string;
    onClickOption: OnClickOptions;
    onClickPage?: string;
    progressAttribute: string;
    progressStyle: BootstrapStyle;
    textColorSwitch: number;
}

interface ProgressBarContainerState {
    bootstrapStyle?: BootstrapStyle;
    alertMessage?: string;
    maximumValue?: number;
    showAlert?: boolean;
    progressValue: number | null;
}

type OnClickOptions = "doNothing" | "showPage" | "callMicroflow";

export default class ProgressBarContainer extends Component<ProgressBarContainerProps, ProgressBarContainerState> {
    private subscriptionHandles: number[];
    private subscriptionCallback: (mxObject: mendix.lib.MxObject) => () => void;

    constructor(props: ProgressBarContainerProps) {
        super(props);

        const defaultState: ProgressBarContainerState = this.updateValues(props.mxObject);
        defaultState.alertMessage = this.validateProps();
        defaultState.showAlert = !!defaultState.alertMessage;
        this.state = defaultState;
        this.subscriptionHandles = [];
        this.handleClick = this.handleClick.bind(this);
        this.subscriptionCallback = mxObject => () => this.setState(this.updateValues(mxObject));
    }

    render() {
        if (this.state.showAlert) {
            return createElement(Alert, { message: this.state.alertMessage });
        }

        return createElement(ProgressBar, {
            alertMessage: this.state.alertMessage,
            barType: this.props.barType,
            bootstrapStyle: this.state.bootstrapStyle,
            colorSwitch: this.props.textColorSwitch,
            maximumValue: this.state.maximumValue,
            onClickAction: this.props.onClickMicroflow || this.props.onClickPage ? this.handleClick : undefined,
            progress: this.state.progressValue
        });
    }

    componentWillReceiveProps(newProps: ProgressBarContainerProps) {
        this.resetSubscription(newProps.mxObject);
        this.setState(this.updateValues(newProps.mxObject));
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(handle => window.mx.data.unsubscribe(handle));
    }

    private validateProps(): string {
        let errorMessage = "";
        if (this.props.onClickOption === "callMicroflow" && !this.props.onClickMicroflow) {
            errorMessage = "on click microflow is required";
        } else if (this.props.onClickOption === "showPage" && !this.props.onClickPage) {
            errorMessage = "on click page is required";
        }

        return errorMessage && `Error in progress bar configuration: ${errorMessage}`;
    }

    private getValue<T>(mxObject: mendix.lib.MxObject, attribute: string, defaultValue: T): T | number {
        return mxObject && attribute ? parseFloat(mxObject.get(attribute) as string) : defaultValue;
    }

    private getBootstrapStyle(mxObject: mendix.lib.MxObject): BootstrapStyle {
        if (mxObject && this.props.bootstrapStyleAttribute) {
            return mxObject.get(this.props.bootstrapStyleAttribute) as BootstrapStyle;
        }

        return this.props.progressStyle;
    }

    private updateValues(mxObject: mendix.lib.MxObject): ProgressBarContainerState {
        return {
            bootstrapStyle: this.getBootstrapStyle(mxObject),
            maximumValue: this.getValue<number>(mxObject, this.props.maximumValueAttribute, 100),
            progressValue: this.getValue<null>(mxObject, this.props.progressAttribute, null)
        };
    }

    private resetSubscription(mxObject: mendix.lib.MxObject) {
        this.subscriptionHandles.forEach(handle => window.mx.data.unsubscribe(handle));
        this.subscriptionHandles = [];

        if (mxObject) {
            this.subscriptionHandles.push(window.mx.data.subscribe({
                callback: this.subscriptionCallback(mxObject),
                guid: mxObject.getGuid()
            }));
            [
                this.props.progressAttribute,
                this.props.maximumValueAttribute,
                this.props.bootstrapStyleAttribute
            ].forEach(attr => {
                this.subscriptionHandles.push(window.mx.data.subscribe({
                    attr,
                    callback: this.subscriptionCallback(mxObject),
                    guid: mxObject.getGuid()
                }));
            });
        }

    }

    private handleClick() {
        const { mxObject, onClickMicroflow, onClickOption, onClickPage } = this.props;
        if (mxObject && onClickOption === "callMicroflow" && onClickMicroflow && mxObject.getGuid()) {
            window.mx.ui.action(onClickMicroflow, {
                context: new window.mendix.lib.MxContext(),
                error: error =>
                    window.mx.ui.error(`Error while executing microflow ${onClickMicroflow}: ${error.message}`),
                params: {
                    applyto: "selection",
                    guids: [mxObject.getGuid()]
                }
            });
        } else if (mxObject && onClickOption === "showPage" && onClickPage && mxObject.getGuid()) {
            const context = new window.mendix.lib.MxContext();
            context.setContext(mxObject.getEntity(), mxObject.getGuid());
            window.mx.ui.openForm(onClickPage, {
                error: error =>
                    window.mx.ui.error(`Error while opening page ${onClickPage}: ${error.message}`),
                context
            });
        }
    }
}
