import {Button} from '@airtable/blocks/ui';
import React from 'react';
import _ from 'lodash';
import { makeStyles, createMuiTheme } from "@material-ui/core/styles";

function SetupWizard({ children, currentScreen, goToNextScreen }) {
    const screenIndicesByKey = {};
    React.Children.toArray(children).forEach((child, i) => {
      screenIndicesByKey[child.key.slice(2)] = i;
    });

    const screenIndex = screenIndicesByKey[currentScreen];
    const child = React.Children.toArray(children)[screenIndex];

    return React.cloneElement(child, {
        screenIndex,
        onButtonClick: child.props.onButtonClick || goToNextScreen,
    });
}

const SetupWizardScreen = ({
    children,
    screenIndex,
    buttonText,
    isButtonDisabled,
    onButtonClick,
}) => {
    const numScreens = 2;


    const useStyles = makeStyles(theme => ({
        box: {
            marginTop: 25,
            marginLeft: "38%",
            color: "#9752e0",
        },
    }));
    const classes = useStyles();

    return (
        <div>
            <div>{children}</div>
            <div>
                <Button onClick={onButtonClick} disabled={isButtonDisabled} className={classes.box}>
                    {buttonText}
                </Button>
            </div>
        </div>
    );
};

SetupWizard.Screen = SetupWizardScreen;

export default SetupWizard;