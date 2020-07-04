import React, { useRef, useState, useEffect } from 'react';
import {cursor, settingsButton} from '@airtable/blocks';
import { initializeBlock, useBase, useLoadable, useGlobalConfig, useWatchable, useRecords, Heading, Text, ProgressBar, Link, Box } from '@airtable/blocks/ui';
import axios from 'axios';
import { makeStyles, createMuiTheme } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import Chip from '@material-ui/core/Chip';
import { ThemeProvider } from '@material-ui/styles';
import qs from 'qs';
import WatsonSetupWizard from './watsonSetupWizard.js';

function query(apiToken, term, count) {
    var baseUrl = 'https://api.us-south.discovery.watson.cloud.ibm.com/instances/490aeba8-9ab8-4dbd-929c-f426233156ab/v1/environments/system/collections/news-en/query?version=2019-04-30';
    var config = {
        method: 'get',
        url: baseUrl + '&count=' + count + '&query=' + term,
        headers: {
            'Host': 'api.us-south.discovery.watson.cloud.ibm.com', 
            'Authorization': 'Bearer ' + apiToken
        }
    };
    return axios(config);
}

function getApiToken(key) {
    var data = {
        apikey: key,
        grant_type : "urn:ibm:params:oauth:grant-type:apikey"
    };
    var config = {
        method: 'post',
        url: 'https://cors-anywhere.herokuapp.com/https://iam.cloud.ibm.com/oidc/token',
        headers: { 
            'Accept': ' application/json', 
            'Content-Type': 'application/x-www-form-urlencoded', 
            'Cookie': 'sessioncookie=db1d81ee77c52e668f450df0f2da927d'
        },
        data : qs.stringify(data)
    };
    return axios(config);
}

const Pages = {
    SETUP_WIZARD: 'setupWizard',
    MAIN: 'main',
};

function App() {
    const globalConfig = useGlobalConfig();

    const [currentBlockState, setCurrentBlockState] = useState(() => {
        const initialPage = !globalConfig.get('apiKey') ? Pages.SETUP_WIZARD : Pages.MAIN;
        return {currentPage: initialPage};
    });

    const [apiToken, setApiToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [currentRecordId, setCurrentRecordId] = useState("");
    const [json, setJson] = useState({});

    useEffect(() => {
        if (companyName != "") {
            // query(apiToken, companyName, 5)
            // .then(resJson => {
            //     setJson(resJson);
            // })
            // .catch(error => alert(error));
            setJson(require("./sample.json"));
        };
    }, [apiToken, companyName]);

    const base = useBase();
    useLoadable(cursor);
    useRecords(base.getTableByIdIfExists(cursor.activeTableId));
    useWatchable(cursor, ['selectedFieldIds','selectedRecordIds'], () => {
        var activeTable = base.getTableByIdIfExists(cursor.activeTableId);
        if (cursor.selectedRecordIds[0] != null && cursor.selectedRecordIds[0] != undefined) {
            var record = activeTable.selectRecords().getRecordByIdIfExists(cursor.selectedRecordIds[0]);
            var value = record.getCellValueAsString("Name");
            if (value != "()" && value != null && value != undefined) {
                setCompanyName(value);
                setCurrentRecordId(cursor.selectedRecordIds[0]);
            }
        }
    });
    var onSave = function(element) {
        var articleSentiment = "";
        if(element.enriched_text.sentiment.document.score > 0) {
            if (element.enriched_text.sentiment.document.score > 0.5) {
                articleSentiment = "Highly positive";
            }
            else {
                articleSentiment = "Somewhat positive";
            }
        }
        else if(element.enriched_text.sentiment.document.score < 0) {
            if (element.enriched_text.sentiment.document.score < -0.5) {
                articleSentiment = "Somewhat negative";
            }
            else {
                articleSentiment = "Highly negative";
            }
        }
        else if(element.enriched_text.sentiment.document.score = 0){
            articleSentiment = "Neutral";
        }
            
        const pressTable = base.getTableByName('Press mentions');
        pressTable.createRecordAsync( { 'Article title': element.title,
        'Companies mentioned': [{id: currentRecordId}],
        'URL': element.url,
        'How positive?': {name: articleSentiment},
        "Notes": element.text
        });
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
        root: {
            width: 800,
            maxWidth: 800,
            "-webkit-box-shadow": "0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)",
            marginLeft: 20,
            marginTop: 20,
            fontFamily: 'Roboto',
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
        },
        details: {
            width: 600,
            maxWidth: 600,
            display: "flex",
            flexDirection: "column",
            float:"left"
        },
        content: {
            flex: "1 0 auto"
        },
        cover: {
            width: "20%",
            height: 130,
            float: "right",
            marginLeft: 20,
            marginTop: 20,
            marginRight: 20,
        },
        button: {
            float: "left"
        },
        bar: {
            color: '#9752e0',
            marginTop: 42,
            marginLeft: 70,
            height: 6,
            width: 150,
        },
        slider: {
            color: '#9752e0',
            marginTop: 20,
            marginLeft: 20,
            height: 8,
            width: 300,
        },
        barLabel: {
            marginTop: 27,
            marginLeft: 10, 
            float: "left"
        },
        heading: {
            marginLeft: 20,
            marginTop: 20,
            color: "#9752e0"
        },
        subheading: {
            marginLeft: 20,
            marginTop: 20,
        },
        chip: {
            margin: theme.spacing(0.5),
            float: "left"
        },
        chipCollection: {
            marginLeft: 10,
        },
        apiKey: {
            marginLeft: 20,
            marginTop: 20
        },
        watson:{
            width: "20%",
            height: 130,
        },
    }));
    const classes = useStyles();

    switch (currentBlockState.currentPage) {
        case Pages.SETUP_WIZARD: {
            return (
                <WatsonSetupWizard
                    onSetupComplete={() => {
                        getApiToken(globalConfig.get('apiKey'))
                        .then(data =>{
                            setApiToken(data.data.access_token);
                            setRefreshToken(data.data.refresh_token);
                            setCurrentBlockState({
                                currentPage: Pages.MAIN,
                            });
                        })
                        .catch(
                            error => alert(error)
                        );
                    }}
                />
            );
        }
        case Pages.MAIN: {
            var cards = [];
            if (companyName != "" && Object.keys(json).length != 0) {
                json["data"]["results"].forEach(element => {
                    var chips = [];
                    if (element.enriched_text.concepts.length >= 3) {
                        chips = <div className={classes.chipCollection}>
                                    <Chip size="small" color="secondary" className = {classes.chip} label={element.enriched_text.concepts[0].text} />
                                    <Chip size="small" color="secondary" className = {classes.chip} label={element.enriched_text.concepts[1].text} />
                                    <Chip size="small" color="secondary" className = {classes.chip} label={element.enriched_text.concepts[2].text} />
                                </div>
                    }
                    cards.push (
                        <ThemeProvider theme={theme}>
                            <Card className={classes.root}>
                                <div className={classes.details}>
                                    <CardContent className={classes.content}>
                                        <Link href={element.url}>
                                            <Heading size="small">
                                                {element.title}
                                            </Heading>
                                        </Link>
                                        <Text size="small">
                                            {element.host}
                                        </Text>
                                        <Text size="small" textColor="light" marginTop={2}>
                                            {new Date(element.publication_date).toDateString()}
                                        </Text>
                                        <Text variant="paragraph" size="small" marginTop={2}>
                                            {element.text}
                                        </Text>
                                        <Text size="small" textColor="light" marginTop={2} marginLef={2} className={classes.barLabel}>
                                            Sentiment
                                        </Text>
                                        {/* <Slider className={classes.bar}
                                            defaultValue={Math.floor(element.enriched_text.sentiment.document.score*100)}
                                            valueLabelDisplay="auto"
                                        /> */}
                                        <ProgressBar className={classes.bar} progress={element.enriched_text.sentiment.document.score} barColor={theme.palette.secondary.light} />
                                    </CardContent>
                                    {chips}
                                    <CardActions className={classes.button}>
                                        <Button size="small" color="primary" onClick={e => onSave(element)}>
                                        Save
                                        </Button>
                                    </CardActions>
                                </div>
                                <CardMedia className={classes.cover} image={element.main_image_url}/>
                            </Card>
                        </ThemeProvider>
                    );
                });
                return (
                    <div>
                        <Heading size="xxlarge" className={classes.heading}> {companyName.toUpperCase()} </Heading>
                        <Heading textColor="light" size="small" className={classes.subheading} > News reports </Heading>
                        {cards}
                        <Heading textColor="light" size="small" className={classes.subheading} > Overall sentiment </Heading>
                    </div>
                );
            }
            return <div>{cards}</div>
        }
    }
}
    
initializeBlock(() => <App/>);