import React, { useState, useEffect } from 'react';
import {cursor, globalConfig} from '@airtable/blocks';
import { initializeBlock, useBase, useLoadable, useGlobalConfig, useWatchable, useRecords, Heading, Text, ProgressBar, Link, useViewport } from '@airtable/blocks/ui';
import axios from 'axios';
import { makeStyles, createMuiTheme, withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TabPanel from "@material-ui/lab/TabPanel";
import TabContext from "@material-ui/lab/TabContext";
import { ThemeProvider } from '@material-ui/styles';
import qs from 'qs';
import WatsonSetupWizard from './watsonSetupWizard.js';
import { Typography } from '@material-ui/core';
import { PieChart, Pie, Cell, Sector } from 'recharts';
import TagCloud from 'react-tag-cloud';

const AntTabs = withStyles({
    root: {
      borderBottom: "1px solid #e8e8e8"
    },
    indicator: {
      backgroundColor: "#9752e0"
    },
  })(Tabs);
  
  const AntTab = withStyles(theme => ({
    root: {
      textTransform: "none",
      minWidth: 40,
      fontWeight: theme.typography.fontWeightRegular,
      marginRight: theme.spacing(8),
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"'
      ].join(","),
      "&:hover": {
        color: "#424242",
        opacity: 1
      },
      "&$selected": {
        color: "#424242",
        fontWeight: theme.typography.fontWeightBold
      },
      "&:focus": {
        color: "#424242"
      },
    },
    selected: {}
  }))(props => <Tab disableRipple {...props} />);

function query(apiToken, term, count) {
    var baseUrl = globalConfig.get('apiUrl') + '/v1/environments/system/collections/news-en/query?version=2019-04-30';
    var config = {
        method: 'get',
        url: baseUrl + '&count=' + count + '&query=' + term + "&aggregation=term(enriched_text.sentiment.document.label)",
        headers: {
            'Host': 'api.us-south.discovery.watson.cloud.ibm.com', 
            'Authorization': 'Bearer ' + apiToken
        }
    };
    return axios(config);
}

function getApiToken(key) {
    var ec2Proxy = "https://54.84.0.154:8000/"; // cors-anywhere server that redirect authentication requests
    var data = {
        apikey: key,
        grant_type : "urn:ibm:params:oauth:grant-type:apikey"
    };
    var config = {
        method: 'post',
        url: ec2Proxy + 'https://iam.cloud.ibm.com/oidc/token',
        headers: { 
            'Accept': ' application/json', 
            'Content-Type': 'application/x-www-form-urlencoded', 
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
    const [tabValue, setTabValue] = useState("1");
    const [activePieIndex, setActivePieIndex] = useState("1");

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    useEffect(() => {
        if (companyName != "") {
            query(apiToken, companyName, 5)
            .then(resJson => {
                setJson(resJson);
            })
            .catch(error => alert(error));
            // setJson(require("./sample.json"));
        };
    }, [apiToken, companyName]);

    var tableName = "Portfolio companies";
    const base = useBase();
    useLoadable(cursor);
    useRecords(base.getTableByName(tableName));
    useWatchable(cursor, ['selectedFieldIds','selectedRecordIds'], () => {
        var activeTable = base.getTableByName(tableName);
        if (cursor.selectedRecordIds[0] != null && cursor.selectedRecordIds[0] != undefined) {
            var record = activeTable.selectRecords().getRecordByIdIfExists(cursor.selectedRecordIds[0]);
            if (record != null) {
                var value = record.getCellValueAsString("Name");
                if (value != "()" && value != null && value != undefined) {
                    setCompanyName(value);
                    setCurrentRecordId(cursor.selectedRecordIds[0]);
                }
            }
        }
    });
    const viewport = useViewport();

    var onLogout = function(){
        globalConfig.setAsync('apiKey', "");
        setCurrentBlockState({
            currentPage: Pages.SETUP_WIZARD,
        });
    }

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
        newsCardRoot: {
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
        vizCardRoot: {
            width: 450,
            maxWidth: 600,
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
        logoutButton: {
            float: "right",
            marginRight: 10,
        },
        logoutButtonEmptyPage: {
            float: "right",
            marginRight: 10,
        },
        bar: {
            marginTop: 42,
            marginLeft: 70,
            height: 6,
            width: 150,
        },
        barLabel: {
            marginTop: 27,
            marginLeft: 10, 
            float: "left"
        },
        heading: {
            marginLeft: 20,
            marginTop: 20,
        },
        subheading: {
            marginLeft: 20,
            marginTop: 20,
        },
        chip: {
            margin: theme.spacing(0.5),
            float: "left",
            color:"#FFFFFF"
        },
        chipCollection: {
            marginLeft: 10,
        },
        clickOnARowMessage: {
            marginTop: "30%",
            maxWidth: 300,
            marginLeft: "30%",
            float: "left"
        },
        tagCloud : {
            fontFamily: "Roboto, sans-serif",
            color: "#9752e0",
            padding: 7,
            width:400,
            height: 200,
        },
        tagContainer: {
            marginRight: 20,
            maxWidth: 400,
            marginLeft: 10
        },
        largeTag: {
            fontSize: 30,
            fontWeight: 'bold'
        },
        smallTag: {
            opacity: 0.7,
            fontSize: 16
        },
        leftFloat: {
            float: "left",
        },
        tabRoot: {
            flexGrow: 1,
            marginLeft: 20
          },
        tabDemo1: {
            backgroundColor: theme.palette.background.paper
          },
        tabDemo2: {
            backgroundColor: "#2e1534"
          }
    }));
    const classes = useStyles();

    var refreshApiToken = function() {
        getApiToken(globalConfig.get('apiKey'))
        .then(data =>{
            setApiToken(data.data.access_token);
            setRefreshToken(data.data.refresh_token);
            setCurrentBlockState({
                currentPage: Pages.MAIN,
            });
            viewport.exitFullscreen();
        })
        .catch(error => {
                alert("Invalid API Key");
                globalConfig.setAsync('apiKey', "");
        });
    };

    const renderActiveShape = (props) => {
        const RADIAN = Math.PI / 180;
        const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
          fill, payload, percent, value } = props;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + 30) * cos;
        const my = cy + (outerRadius + 30) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';
      
        return (
          <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{payload.name}</text>
            <Sector
              cx={cx}
              cy={cy}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              startAngle={startAngle}
              endAngle={endAngle}
              fill={fill}
            />
            <Sector
              cx={cx}
              cy={cy}
              startAngle={startAngle}
              endAngle={endAngle}
              innerRadius={outerRadius + 6}
              outerRadius={outerRadius + 10}
              fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none"/>
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none"/>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{value.toLocaleString('en')}</text>
          </g>
        );
      };

    var onPieEnter = function(data, index) {
        setActivePieIndex(index);
    };

    switch (currentBlockState.currentPage) {
        case Pages.SETUP_WIZARD: {
            return (
                <WatsonSetupWizard
                    onSetupComplete={() => {
                        refreshApiToken();
                        setInterval(() => {
                            refreshApiToken();
                        }, 600000);
                    }}
                />
            );
        }
        case Pages.MAIN: {
            var cards = [];
            var sentimentData= [];
            const colors = {
                positive: '#80e27e', 
                negative: '#f44336', 
                neutral: '#63ccff'
            };
            const pieChartColors = {
                positive: '#9752e0', 
                negative: '#c6a0ee', 
                neutral: '#63ccff'
            };
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
                    var sentimentScore = element.enriched_text.sentiment.document.score > 0 ? element.enriched_text.sentiment.document.score : -1*element.enriched_text.sentiment.document.score;
                    var sentimentColor = element.enriched_text.sentiment.document.score > 0 ? colors.positive : colors.negative; 
                    cards.push (
                        <ThemeProvider theme={theme}>
                            <Card className={classes.newsCardRoot}>
                                <div className={classes.details}>
                                    <CardContent className={classes.content}>
                                        <Link rel="noopener noreferrer" target="_blank" href={element.url}>
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
                                        <ProgressBar className={classes.bar} progress={sentimentScore} barColor={sentimentColor} />
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
                
                var totalCount = 0;
                var sentimentResults = json["data"]["aggregations"][0]["results"];
                sentimentResults.forEach(ele => {	
                    totalCount += ele.matching_results;	
                });
                sentimentResults.forEach(ele => {
                    sentimentData.push({name: ele.key, value: Math.round(ele.matching_results*100/totalCount)});
                });

                var companyNames = new Set();
                var companies = new Set();
                var personNames = new Set();
                var persons = new Set();
                json["data"]["results"].forEach(result => {
                    result["enriched_text"]["entities"].forEach(entity => {
                        if(entity.type == "Person" && entity.relevance > 0 && !personNames.has(entity.text)) {
                            persons.add({name: entity.text, value: entity.relevance});
                            personNames.add(entity.text);
                        }
                        if (entity.type == "Company" && entity.relevance > 0 && !companyNames.has(entity.text) && !entity.text.includes(companyName) && Number.isNaN(parseInt(entity.text))) {
                            companies.add({name: entity.text, value: entity.relevance});
                            companyNames.add(entity.text);
                        }
                    });
                });

                return (
                    <ThemeProvider theme={theme}>
                        <div>
                            <Button size="small" color="primary" onClick={e => onLogout()} className={classes.logoutButton}>Revoke API Key</Button>
                            <Typography variant="h4" color="primary" className={classes.heading}> {companyName.toUpperCase()} </Typography>
                            <TabContext value={tabValue}>
                                <div className={classes.tabRoot}>
                                    <div className={classes.tabDemo1}>
                                        <AntTabs value={tabValue} onChange={handleTabChange} aria-label="ant example">
                                            <AntTab label="Top Stories" value="1"/>
                                            <AntTab label="News Analysis" value="2"/>
                                        </AntTabs>
                                        <Typography className={classes.tabPadding} />
                                    </div>
                                </div>
                                <TabPanel value="1">
                                    <div className={classes.leftFloat}>
                                        {cards}
                                    </div>
                                </TabPanel>
                                <TabPanel value="2">
                                    <div className={classes.leftFloat}>
                                        <Heading textColor="light" size="small" className={classes.subheading} > Overall Sentiment </Heading>
                                        <Card className={classes.vizCardRoot}>
                                            <div className={classes.details}>
                                                <CardContent className={classes.content}>
                                                    <PieChart width={400} height={250} className={classes.pieChart}>
                                                        <Pie startAngle={360} endAngle={0} data={sentimentData} innerRadius={60} outerRadius={80} onMouseEnter={onPieEnter} activeIndex={activePieIndex} activeShape={renderActiveShape} >
                                                            {
                                                                sentimentData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={pieChartColors[entry.name]}/>
                                                                ))
                                                            }
                                                        </Pie>
                                                    </PieChart>
                                                </CardContent>
                                            </div>
                                        </Card>
                                        <Heading textColor="light" size="small" className={classes.subheading} > Top People Mentions </Heading>
                                        <Card className={classes.vizCardRoot}>
                                            <div className={classes.details}>
                                                <CardContent className={classes.content}>
                                                    <div className={classes.tagContainer}>
                                                        <TagCloud className={classes.tagCloud}>
                                                            {
                                                                Array.from(persons).map((ele, index) => (
                                                                    <div className={ele.value>0.2?classes.largeTag:classes.smallTag}>{ele.name}</div>
                                                                ))
                                                            }
                                                        </TagCloud>
                                                    </div>
                                                </CardContent>
                                            </div>
                                        </Card>
                                        <Heading textColor="light" size="small" className={classes.subheading} > Top Company Mentions </Heading>
                                        <Card className={classes.vizCardRoot}>
                                            <div className={classes.details}>
                                                <CardContent className={classes.content}>
                                                    <div className={classes.tagContainer}>
                                                        <TagCloud className={classes.tagCloud}>
                                                            {
                                                                Array.from(companies).map((ele, index) => (
                                                                    <div className={ele.value>0.2?classes.largeTag:classes.smallTag}>{ele.name}</div>
                                                                ))
                                                            }
                                                        </TagCloud>
                                                    </div>
                                                </CardContent>
                                            </div>
                                        </Card>
                                    </div>
                                </TabPanel>
                            </TabContext>
                        </div>
                    </ThemeProvider>
                );
            }
            return (
                <ThemeProvider theme={theme}>
                    <div className={classes.logoutButtonEmptyPage}>
                        <Button size="small" color="primary" onClick={e => onLogout()}>Revoke API Key</Button>
                    </div>
                    <div className={classes.clickOnARowMessage}>
                        <Typography color="secondary">Select a row to generate your digest.</Typography>
                    </div>
                </ThemeProvider>
            )
        }
    }
}
    
initializeBlock(() => <App/>);