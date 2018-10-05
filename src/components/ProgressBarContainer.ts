import { CSSProperties, Component, createElement } from "react";
import { BarStyle, BarType, ProgressBar, ProgressBarProps } from "./ProgressBar";
export interface ProgressBarContainerProps {
    class?: string;
    style?: CSSProperties;
    barType: BarType;
    bootstrapStyle: BarStyle;
    bootstrapStyleAttribute: PluginWidget.EditableValue<string>;
    displayText: DisplayText;
    displayTextAttribute: PluginWidget.EditableValue<string>;
    displayTextStatic: PluginWidget.DynamicValue<string>;
    maximumValueAttribute: PluginWidget.EditableValue<string>;
    progressAttribute: PluginWidget.EditableValue<string>;
    textColorSwitch: PluginWidget.DynamicValue<number>;
    staticValue: PluginWidget.DynamicValue<number>;
    staticMaximumValue: PluginWidget.DynamicValue<number>;
    onClickAction: PluginWidget.ActionValue;
}

type Handler = () => void;

export type DisplayText = "none" | "value" | "percentage" | "static" | "attribute";

export default class ProgressBarContainer extends Component<ProgressBarContainerProps> {
    private readonly clickHandler: Handler = this.handleClick.bind(this);

    render() {
        return createElement(ProgressBar, {
            barType: this.props.barType,
            bootstrapStyle: this.props.bootstrapStyleAttribute
                ? this.props.bootstrapStyleAttribute.value
                : this.props.bootstrapStyle,
            className: this.props.class,
            colorSwitch: this.props.textColorSwitch.value,
            displayText: this.props.displayText,
            displayTextValue: this.getDisplayTextValue(),
            maximumValue: this.props.maximumValueAttribute ? this.props.maximumValueAttribute.value : this.props.staticMaximumValue,
            onClickAction: this.clickHandler,
            progress: this.props.progressAttribute ? Number(this.props.progressAttribute.value) || 0 : this.props.staticValue,
            style: this.props.style
        } as ProgressBarProps);
    }

    private getDisplayTextValue() {
        if (this.props.displayText === "attribute") {
            return this.props.displayTextAttribute.value;
        } else if (this.props.displayText === "static") {
            return this.props.displayTextStatic.value;
        }

        return "";
    }

    private handleClick() {
        if (this.props.onClickAction) {
            this.props.onClickAction.execute();
        }
    }
}
