import {ViewportConstraint, Input, useViewport, useGlobalConfig, Box, Text } from '@airtable/blocks/ui';
import React, {useState} from 'react';
import { TextField } from '@material-ui/core';
import { makeStyles, createMuiTheme } from "@material-ui/core/styles";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

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
            width: 120,
            height: 130,
        },
        box: {
            marginTop: 25,
            marginLeft: "33%",
        },
        setupText: {
            marginTop: 25,
            marginLeft: "25%",
            maxWidth: 450
        },
        image: {
            width: 250,
            height: 250,
            marginTop: 20,
            marginLeft: "30%",
        },
    }));
    const classes = useStyles();

    return (
        <ViewportConstraint maxFullscreenSize={{width: 540, height: 630}}>
            <SetupWizard currentScreen={currentScreen} goToNextScreen={goToNextScreen}>
                <SetupWizard.Screen
                    key={SetupScreenKeys.intro}
                    buttonText="Get Started"
                    onButtonClick={() => {
                        goToNextScreen();
                        // viewport.enterFullscreenIfPossible();
                    }}
                >
                        <Typography className={classes.box} variant="h4" gutterBottom>
                            Startup Digest
                        </Typography>
                        <CardMedia className={classes.image} image="https://i.pinimg.com/originals/e9/f4/ea/e9f4ea5b670fe8235dee75dbbf098737.png" />
                    </SetupWizard.Screen>

                <SetupWizard.Screen key={SetupScreenKeys.apiSetup} buttonText="Save and exit" onButtonClick={onSaveApiKeyClick} >
                    <div className={classes.setupText}>
                    <Typography variant="h5" gutterBottom>
                        Create a Watson Discovery API Key
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                    To use this block, you need to create an IBM Cloud Discovery service. If you’ve setup the discover block before, you can reuse the same API key.
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        <ol>
                          <li>
                                <Typography variant="h6" gutterBottom>
                                Create a IBM Cloud Account
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                Go to the <Link href="https://cloud.ibm.com/registration">IBM Cloud Console</Link> and create a new account. You may also use an existing account of your own.
                                </Typography>
                          </li>

                          <li>
                                <Typography variant="h6" gutterBottom>
                                    Create a discover services on IBM Cloud 
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    Create an instance of <Link href="https://cloud.ibm.com/catalog/services/discovery">Watson Discovery Service</Link> based on your plan requirements. 
                                </Typography>
                          </li>
                          <li>
                                <Typography variant="h6" gutterBottom>
                                    Get the created Discovery API key 
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    Inside your Discovery instance,  manage page displays your API key. Copy the API key and paste it below
                                </Typography>
                          </li>

                          <li>
                            {/* <TextField size="small" className={classes.apiKey} label="Watson API Key" variant="outlined" width="320px" value={apiKey} onChange={e => setApiKey(e.target.value)} type="password"/> */}
                            <Input type="text" onChange={(e) => setApiKey(e.target.value)} placeholder="Your API Key HERE" />
                          </li>
                        </ol>
                        </Typography>
                    </div>
                </SetupWizard.Screen>
            </SetupWizard>
        </ViewportConstraint>
    );
}

export default WatsonSetupWizard;