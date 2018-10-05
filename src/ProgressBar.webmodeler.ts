import { Component, createElement } from "react";
import { ProgressBar, ProgressBarProps } from "./components/ProgressBar";
import { ProgressBarContainerProps } from "./components/ProgressBarContainer";

declare function require(name: string): string;

type VisibilityMap = {
    [P in keyof ProgressBarContainerProps]: boolean;
};

// tslint:disable-next-line:class-name
export class preview extends Component<ProgressBarContainerProps, {}> {
    render() {
        const bar = createElement(ProgressBar, this.transformProps(this.props));
        return bar;
    }

    private transformProps(props: ProgressBarContainerProps): ProgressBarProps {
        return {
            barType: props.barType,
            bootstrapStyle: props.bootstrapStyle,
            className: props.class,
            colorSwitch: props.textColorSwitch.value,
            displayText: props.displayText,
            displayTextValue: this.getDisplayTextValue() as string,
            maximumValue: props.staticMaximumValue.value as number,
            progress: props.staticValue.value,
            style: props.style
        };
    }

    private getDisplayTextValue() {
        if (this.props.displayText === "attribute") {
            return `{ ${this.props.displayTextAttribute} }`;
        } else if (this.props.displayText === "static") {
            return this.props.displayTextStatic;
        }

        return "";
    }
}

export function getPreviewCss() {
    return require("./ui/ProgressBar.scss");
}

export function getVisibleProperties(valueMap: ProgressBarContainerProps, visibilityMap: VisibilityMap) {
    visibilityMap.displayTextAttribute = valueMap.displayText === "attribute";
    visibilityMap.displayTextStatic = valueMap.displayText === "static";

    return visibilityMap;
}
