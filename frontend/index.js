import React, { useRef, useState, useEffect } from 'react';
import {XYPlot, LineSeries, VerticalGridLines, HorizontalGridLines, XAxis, YAxis, VerticalBarSeries} from 'react-vis';
import {cursor} from '@airtable/blocks';
import {
    colors,
    initializeBlock,
    useBase,
    useLoadable,
    useWatchable,
    Box,
    Dialog,
    Heading,
    Input,
    Link,
    Text,
    TextButton,
    useRecords,
} from '@airtable/blocks/ui';

function random() {
    return Math.floor(Math.random() * 10);
}

function randomPlotArray() {
    return [
        {x: 0, y: random()},
        {x: 1, y: random()},
        {x: 2, y: random()},
        {x: 3, y: random()},
        {x: 4, y: random()},
        {x: 5, y: random()},
        {x: 6, y: random()},
        {x: 7, y: random()},
        {x: 8, y: random()},
        {x: 9, y: random()}
    ];
}

function App() {
    const [apiKey, setApiKey] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [plotData, setPlotData] = useState(randomPlotArray());

    useEffect(() => {
        fetch(`https://www.reddit.com/r/aww.json?name=`+ {companyName} + "&key=" + {apiKey})
        .then(res => res.json())
        .then(res => {
            setPlotData(randomPlotArray());
        })
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

    if (companyName != "") {
        return (
            <div>
                <Input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Atlassian API Key" width="320px" type="password"/>
                <Input value={companyName} placeholder="Company Name" width="320px" />
                <XYPlot height={300} width = {300}>
                    <VerticalGridLines />
                    <HorizontalGridLines />
                    <XAxis />
                    <YAxis />
                    <VerticalBarSeries data={plotData} />
                </XYPlot>
            </div>
        );
    } else {
        return (
            <div>
                <Input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Atlassian API Key" width="320px" type="password" required="true"/>
            </div>
        );
    }
}
    
initializeBlock(() => <App
    title="Firehose Weekend"
    description="Learn to code a web app built with HTML, CSS, and ruby in hackathon style weekend."
    lastPlayed="A minute ago"
/>);
    
// Fac7y3FkaL6ErxeaFyWV2949