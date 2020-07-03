import React, { useRef, useState, useEffect } from 'react';
import {cursor} from '@airtable/blocks';
import { initializeBlock, useBase, useLoadable, useWatchable, useRecords, Heading, Text, ProgressBar, Link } from '@airtable/blocks/ui';
import axios from 'axios';
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import Chip from '@material-ui/core/Chip';
import { TextField } from '@material-ui/core';

function query(term, count, ) {
    var baseUrl = 'https://api.us-south.discovery.watson.cloud.ibm.com/instances/7aefdf7f-47e9-4f3a-bbfd-777424685850/v1/environments/system/collections/news-en/query?version=2019-04-30';
    var config = {
        method: 'get',
        url: baseUrl + '&count=' + count + '&query=' + term,
        headers: {
            'Host': 'api.us-south.discovery.watson.cloud.ibm.com', 
            'Authorization': 'Bearer eyJraWQiOiIyMDIwMDYyNDE4MzAiLCJhbGciOiJSUzI1NiJ9.eyJpYW1faWQiOiJpYW0tU2VydmljZUlkLTQ0M2RiOWQzLWQ3YmItNGMyNS05ODY5LTE4N2YzMzI4ZjM2NCIsImlkIjoiaWFtLVNlcnZpY2VJZC00NDNkYjlkMy1kN2JiLTRjMjUtOTg2OS0xODdmMzMyOGYzNjQiLCJyZWFsbWlkIjoiaWFtIiwiaWRlbnRpZmllciI6IlNlcnZpY2VJZC00NDNkYjlkMy1kN2JiLTRjMjUtOTg2OS0xODdmMzMyOGYzNjQiLCJuYW1lIjoiQXV0by1nZW5lcmF0ZWQgc2VydmljZSBjcmVkZW50aWFscyIsInN1YiI6IlNlcnZpY2VJZC00NDNkYjlkMy1kN2JiLTRjMjUtOTg2OS0xODdmMzMyOGYzNjQiLCJzdWJfdHlwZSI6IlNlcnZpY2VJZCIsInVuaXF1ZV9pbnN0YW5jZV9jcm5zIjpbImNybjp2MTpibHVlbWl4OnB1YmxpYzpkaXNjb3Zlcnk6dXMtc291dGg6YS9kMjhjN2Q5ZDc5ZDM0YjE2YjFiYzgzYzc3NWMyNTM3Mjo3YWVmZGY3Zi00N2U5LTRmM2EtYmJmZC03Nzc0MjQ2ODU4NTA6OiJdLCJhY2NvdW50Ijp7InZhbGlkIjp0cnVlLCJic3MiOiJkMjhjN2Q5ZDc5ZDM0YjE2YjFiYzgzYzc3NWMyNTM3MiJ9LCJpYXQiOjE1OTM3NDkyNzMsImV4cCI6MTU5Mzc1Mjg3MywiaXNzIjoiaHR0cHM6Ly9pYW0uY2xvdWQuaWJtLmNvbS9pZGVudGl0eSIsImdyYW50X3R5cGUiOiJ1cm46aWJtOnBhcmFtczpvYXV0aDpncmFudC10eXBlOmFwaWtleSIsInNjb3BlIjoiaWJtIG9wZW5pZCIsImNsaWVudF9pZCI6ImJ4IiwiYWNyIjoxLCJhbXIiOlsicHdkIl19.MNRq9mEx5jisSS371vp6RS1nBMx8Geo3vbhCMeeZaFUEl4zBYvEPgO0-LfCWa3SQ2clS9vZKSnY9lW3FXDYZzP7FtZzBUHxmFts95OQMwPFX1lOdDhvWPjEAT6hOG9nlH9iVBlzjv_-khY6i5QCueFY2ildfAAHnInnzbHQIXxRdJduMw6RPN8DwehtxdCIMKHSDcLcbVzKooyJ3CVMB86YoNw5mcVKqx2y_cvPi7nndF3UFwBRliUiS8pvNOcXJlJUMZfcZ1Wgyo454HIuoG5OrjztvDjqOBgISAZBbztWi8gIwIIHLtJUrkE0XSDGijA6G1zC2qDWKdLxzENH1Sg'
        }
    };
    return axios(config);
}

function App() {
    const [apiKey, setApiKey] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [json, setJson] = useState({});

    useEffect(() => {
        if (companyName != "") {
            // query(companyName, 5)
            // .then(resJson => {
            //     setJson(resJson);
            // })
            // .catch(error => alert(error));
            setJson(require("./sample.json"));
        };
    }, [companyName, apiKey]);

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
            }
        }
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
            marginTop: 20,
            marginLeft: 20,
            color: '#52af77',
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
            color: "#4c34eb"
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
        box: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "500px",
            height: "500px"
        },
    }));
    const classes = useStyles();

    if (apiKey != "" && companyName != "" && Object.keys(json).length != 0) {
        var cards = [];
        json["data"]["results"].forEach(element => {
            var chips;
            if (element.enriched_text.concepts.length >= 3) {
                chips = <div className={classes.chipCollection}><Chip size="small" color="secondary" className = {classes.chip} label={element.enriched_text.concepts[0].text} />
                        <Chip size="small" color="secondary" className = {classes.chip} label={element.enriched_text.concepts[1].text} />
                        <Chip size="small" color="secondary" className = {classes.chip} label={element.enriched_text.concepts[2].text} /></div>
            }
            cards.push (
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
                            <Slider className={classes.bar}
                                defaultValue={Math.floor(element.enriched_text.sentiment.document.score*100)}
                                valueLabelDisplay="auto"
                            />
                        </CardContent>
                        {chips}
                        <CardActions className={classes.button}>
                            <Button size="small" color="primary">
                            Save
                            </Button>
                        </CardActions>
                    </div>
                    <CardMedia className={classes.cover} image={element.main_image_url}/>
                    {/* <ProgressBar className={classes.bar} progress={element.enriched_text.sentiment.document.score} barColor='#378938' /> */}
                </Card>
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
    } else {
        return (
            <div class="box">
                <CardMedia className={classes.watson} image="https://i.pinimg.com/originals/e9/f4/ea/e9f4ea5b670fe8235dee75dbbf098737.png"/>
                <TextField className={classes.apiKey} label="Watson API Key" variant="outlined" width="320px" value={apiKey} onChange={e => setApiKey(e.target.value)} type="password"/>
            </div>
        );
    }
}
    
initializeBlock(() => <App/>);