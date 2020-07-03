import {Button} from '@airtable/blocks/ui';
import React from 'react';
import _ from 'lodash';

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

    return (
        <div>
            <div>{children}</div>
            <div>
                <div
                    style={{
                        left: '50%',
                        transform: 'translateX(-50%)',
                        position: 'absolute',
                        display: 'flex',
                    }}
                >
                    {_.times(numScreens, (i) => (
                        <div
                            key={`dot-${i}`}
                            style={{
                                width: '.5rem',
                                height: '.5rem',
                                borderRadius: '50%',
                                marginRight: (i ===0 && numScreens === 2 || i !== 0 && i !== numScreens -1 ? '0.5rem': 0 ),
                                marginLeft: (i !== 0 && i !== numScreens - 1 ? '0.5rem' : 0 ),
                                backgroundColor: (screenIndex >= i ? 'hsla(0,0%,0%,0.5)' : 'hsla(0,0%,0%,0.25)' )
                            }}
                        />
                    ))}
                </div>
                <Button onClick={onButtonClick} disabled={isButtonDisabled}>
                    {buttonText} &rarr;
                </Button>
            </div>
        </div>
    );
};

SetupWizard.Screen = SetupWizardScreen;

export default SetupWizard;