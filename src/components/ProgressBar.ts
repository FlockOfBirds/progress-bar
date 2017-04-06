import { Component, DOM, createElement } from "react";
import * as classNames from "classnames";

import { Alert } from "./Alert";
import "../ui/ProgressBar.css";

interface ProgressBarProps {
    alertMessage?: string;
    barType?: BarType;
    bootstrapStyle?: BootstrapStyle;
    colorSwitch?: number;
    maximumValue?: number;
    onClickAction?: () => void;
    progress: number | null;
}

type BootstrapStyle = "default" | "info" | "primary" | "success" | "warning" | "danger";
type BarType = "default" | "striped" | "animated";

class ProgressBar extends Component<ProgressBarProps, { alertMessage?: string }> {
    static defaultProps: ProgressBarProps = {
        barType: "default",
        bootstrapStyle: "default",
        colorSwitch: 50,
        maximumValue: 100,
        progress: 0
    };

    constructor(props: ProgressBarProps) {
        super(props);

        this.state = { alertMessage: props.alertMessage };
    }

    render() {
        const { barType, bootstrapStyle, colorSwitch, maximumValue, onClickAction, progress } = this.props;
        const percentage = this.progressValue(progress, maximumValue);
        return DOM.div({ className: "widget-progressbar" },
            DOM.div(
                {
                    className: classNames("progress", {
                        "widget-progressbar-alert": !!maximumValue && maximumValue < 1,
                        "widget-progressbar-clickable": !!onClickAction,
                        "widget-progressbar-text-contrast": Math.abs(percentage) < (colorSwitch as number)
                    }),
                    onClick: this.props.onClickAction
                },
                DOM.div(
                    {
                        className: classNames("progress-bar", `progress-bar-${bootstrapStyle || "default"}`, {
                            "active": barType === "animated",
                            "progress-bar-striped": barType === "striped" || barType === "animated",
                            "widget-progressbar-negative": percentage < 0
                        }),
                        style: { width: `${Math.abs(percentage)}%` }
                    },
                    this.getProgressText(progress, maximumValue)
                )
            ),
            createElement(Alert, { message: this.state.alertMessage })
        );
    }

    private progressValue(progress: number | null, maximumValue = 100): number {
        if (typeof progress !== "number" || maximumValue < 1) {
            return 0;
        } else if (progress > maximumValue || Math.abs(this.calculatePercentage(progress, maximumValue)) > 100) {
            return 100;
        }

        return this.calculatePercentage(progress, maximumValue);
    }

    private calculatePercentage(progress: number, maxValue = 100): number {
        return Math.round((progress / maxValue) * 100);
    }

    private getProgressText(progress: number | null, maximumValue = 100): string {
        if (progress) {
            return maximumValue < 1 ? "Invalid" : `${this.calculatePercentage(progress, maximumValue)}%`;
        }

        return "";
    }
}

export { BarType, BootstrapStyle, ProgressBar, ProgressBarProps };
