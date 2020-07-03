import {ViewportConstraint, Input, useViewport, useGlobalConfig} from '@airtable/blocks/ui';
import React, {useState} from 'react';
import { TextField } from '@material-ui/core';
import { makeStyles, createMuiTheme } from "@material-ui/core/styles";

import SetupWizard from './SetupWizard';

const SetupScreenKeys = {
    intro: 'intro',
    apiSetup: 'apiSetup',
};

function getNextScreen(currentScreen) {
    switch (currentScreen) {
        case SetupScreenKeys.intro:
            return SetupScreenKeys.apiSetup;
        default:
            return null;
    }
}

function useSetupScreen() {
    const [currentScreen, setCurrentScreen] = useState(SetupScreenKeys.intro);

    function goToNextScreen() {
        const nextScreen = getNextScreen(currentScreen);
        if (nextScreen !== null) {
            setCurrentScreen(nextScreen);

            // Reset scroll position when navigating between screens.
            window.scrollTo(0, 0);
        }
    }

    return [currentScreen, goToNextScreen];
}

function WatsonSetupWizard({ onSetupComplete }) {
    const globalConfig = useGlobalConfig();
    const viewport = useViewport();
    const [currentScreen, goToNextScreen] = useSetupScreen();
    const [apiKey, setApiKey] = useState();

    function onSaveApiKeyClick() {
        globalConfig.setAsync('apiKey', apiKey);
        onSetupComplete();
    }

    const useStyles = makeStyles(theme => ({
        apiKey: {
            marginLeft: 20,
            marginTop: 20
        },
        watson:{
            width: "20%",
            height: 130,
        },
        box: {
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
        },
    }));
    const classes = useStyles();

    return (
        <ViewportConstraint maxFullscreenSize={{width: 540, height: 630}}>
            <SetupWizard currentScreen={currentScreen} goToNextScreen={goToNextScreen}>
                <SetupWizard.Screen
                    key={SetupScreenKeys.intro}
                    buttonText="Create a Watson Discovery API Key"
                    onButtonClick={() => {
                        goToNextScreen();
                        // viewport.enterFullscreenIfPossible();
                    }}
                >
                    <div class="box">
                      <h1>Startup Digest</h1>
                      <img src="https://i.pinimg.com/originals/e9/f4/ea/e9f4ea5b670fe8235dee75dbbf098737.png" width="200px" height="200px"/>
                    </div>
                </SetupWizard.Screen>

                <SetupWizard.Screen key={SetupScreenKeys.apiSetup} buttonText="Save API key and exit wizard" onButtonClick={onSaveApiKeyClick} >
                    <div>
                        <ol>
                          <li>
                            Follow some instructions!
                          </li>

                          <li>
                            Follow some more instructions!
                          </li>

                          <li>
                            <TextField size="small" className={classes.apiKey} label="Watson API Key" variant="outlined" width="320px" value={apiKey} onChange={e => setApiKey(e.target.value)} type="password"/>
                            {/* <Input type="text" onChange={(e) => setApiKey(e.target.value)} placeholder="Your API Key HERE" /> */}
                          </li>
                        </ol>
                    </div>
                </SetupWizard.Screen>
            </SetupWizard>
        </ViewportConstraint>
    );
}

export default WatsonSetupWizard;