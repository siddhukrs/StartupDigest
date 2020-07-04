import {ViewportConstraint, Input, useViewport, useGlobalConfig, Box, Text } from '@airtable/blocks/ui';
import React, {useState} from 'react';
import { makeStyles, createMuiTheme } from "@material-ui/core/styles";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { ThemeProvider } from '@material-ui/styles';

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

    const theme = createMuiTheme({
        palette: {
          primary: {
            light: '#9752e0',
            main: '#9752e0',
            dark: '#9752e0',
            contrastText: '#fff',
          },
          secondary: {
            light: '#c6a0ee',
            main: '#c6a0ee',
            dark: '#c6a0ee',
            contrastText: '#000',
          },
        },
      });

    const useStyles = makeStyles(theme => ({
        setupText: {
            marginTop: 25,
            maxWidth: 450,
            margin: "0 auto"
        },
        image: {
            width: 300,
            height: 300,
            maxWidth: 450,
            marginTop: 20,
            margin: "0 auto"
        },
        watson: {
            width: 30,
            height: 30,
            maxWidth: 100,
            float: "left",
            marginRight: 20
        },
        heading: {
            float: "right"
        },
        box: {
            marginTop: 25,
            width: 400,
            margin: "0 auto"
        },
        homeBox: {
            marginTop: 500,
            width: 400,
            margin: "0 auto",
        },
    }));
    const classes = useStyles();

    return (
        <ThemeProvider theme={theme}>
            <ViewportConstraint maxFullscreenSize={{width: 540, height: 630}}>
                <SetupWizard currentScreen={currentScreen} goToNextScreen={goToNextScreen}>
                    <SetupWizard.Screen
                        className={classes.homeBox}
                        key={SetupScreenKeys.intro}
                        buttonText="Get Started"
                        onButtonClick={() => {
                            goToNextScreen();
                            // viewport.enterFullscreenIfPossible();
                        }}
                    >
                        <CardMedia className={classes.image} image="https://cdn-items.s3.amazonaws.com/StartupDigest4.png" />
                    </SetupWizard.Screen>

                    <SetupWizard.Screen key={SetupScreenKeys.apiSetup} buttonText="Save" onButtonClick={onSaveApiKeyClick} className={classes.box} >
                        <div className={classes.setupText}>
                            <CardMedia className={classes.watson} image="https://i.pinimg.com/originals/e9/f4/ea/e9f4ea5b670fe8235dee75dbbf098737.png" />
                            <Typography variant="h5" color="primary">
                                Create a Watson Discovery API Key
                            </Typography>
                            <Typography variant="subtitle2">
                                To use this block, you need to create an IBM Cloud Discovery service. If you’ve setup the discover block before, you can reuse the same API key.
                            </Typography>
                            <Typography variant="h6">
                                <ol>
                                    <li>
                                        <Typography variant="h6" color="primary">
                                            Create a IBM Cloud Account
                                        </Typography>
                                        <Typography variant="body2">
                                            Go to the <Link href="https://cloud.ibm.com/registration">IBM Cloud Console</Link> and create a new account. You may also use an existing account of your own.
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="h6" color="primary">
                                            Create a discover services on IBM Cloud 
                                        </Typography>
                                        <Typography variant="body2">
                                            Create an instance of <Link href="https://cloud.ibm.com/catalog/services/discovery">Watson Discovery Service</Link> based on your plan requirements. 
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography variant="h6" color="primary">
                                            Get the created Watson Discovery API key 
                                        </Typography>
                                        <Typography variant="body2">
                                            Inside your Discovery instance,  manage page displays your API key. Copy the API key and paste it below
                                        </Typography>
                                    </li>
                                    <li>
                                        <Input type="text" onChange={(e) => setApiKey(e.target.value)} placeholder="Watson API Key" />
                                    </li>
                                </ol>
                            </Typography>
                        </div>
                    </SetupWizard.Screen>
                </SetupWizard>
            </ViewportConstraint>
        </ThemeProvider>
    );
}

export default WatsonSetupWizard;