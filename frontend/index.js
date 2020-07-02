import React, { useRef, useState, useEffect } from 'react';
import {cursor} from '@airtable/blocks';
import { initializeBlock, useBase, useLoadable, useWatchable, Input, useRecords } from '@airtable/blocks/ui';
import axios from 'axios';


function query(term, count, success, err) {
    var config = {
        method: 'get',
        url: 'https://api.us-south.discovery.watson.cloud.ibm.com/instances/7aefdf7f-47e9-4f3a-bbfd-777424685850/v1/environments/system/collections/news-en/query?version=2019-04-30&count=' + count + '&query=' + term,
        headers: { 
            'Host': 'api.us-south.discovery.watson.cloud.ibm.com', 
            'Authorization': 'Bearer eyJraWQiOiIyMDIwMDYyNDE4MzAiLCJhbGciOiJSUzI1NiJ9.eyJpYW1faWQiOiJpYW0tU2VydmljZUlkLTQ0M2RiOWQzLWQ3YmItNGMyNS05ODY5LTE4N2YzMzI4ZjM2NCIsImlkIjoiaWFtLVNlcnZpY2VJZC00NDNkYjlkMy1kN2JiLTRjMjUtOTg2OS0xODdmMzMyOGYzNjQiLCJyZWFsbWlkIjoiaWFtIiwiaWRlbnRpZmllciI6IlNlcnZpY2VJZC00NDNkYjlkMy1kN2JiLTRjMjUtOTg2OS0xODdmMzMyOGYzNjQiLCJuYW1lIjoiQXV0by1nZW5lcmF0ZWQgc2VydmljZSBjcmVkZW50aWFscyIsInN1YiI6IlNlcnZpY2VJZC00NDNkYjlkMy1kN2JiLTRjMjUtOTg2OS0xODdmMzMyOGYzNjQiLCJzdWJfdHlwZSI6IlNlcnZpY2VJZCIsInVuaXF1ZV9pbnN0YW5jZV9jcm5zIjpbImNybjp2MTpibHVlbWl4OnB1YmxpYzpkaXNjb3Zlcnk6dXMtc291dGg6YS9kMjhjN2Q5ZDc5ZDM0YjE2YjFiYzgzYzc3NWMyNTM3Mjo3YWVmZGY3Zi00N2U5LTRmM2EtYmJmZC03Nzc0MjQ2ODU4NTA6OiJdLCJhY2NvdW50Ijp7InZhbGlkIjp0cnVlLCJic3MiOiJkMjhjN2Q5ZDc5ZDM0YjE2YjFiYzgzYzc3NWMyNTM3MiJ9LCJpYXQiOjE1OTM2NzAyMzMsImV4cCI6MTU5MzY3MzgzMywiaXNzIjoiaHR0cHM6Ly9pYW0uY2xvdWQuaWJtLmNvbS9pZGVudGl0eSIsImdyYW50X3R5cGUiOiJ1cm46aWJtOnBhcmFtczpvYXV0aDpncmFudC10eXBlOmFwaWtleSIsInNjb3BlIjoiaWJtIG9wZW5pZCIsImNsaWVudF9pZCI6ImJ4IiwiYWNyIjoxLCJhbXIiOlsicHdkIl19.DBBWOUeFM52ZVLavmCbq_ErCVpmO8KCxettKE9ELPF5FcgLGomlzJVTlCcCWPpgbb1etd32zg51SB5L-ke_PcSWS0tDP_YFPHNU9J8fY1uU7t9Nilkq18GAqUkOTCPlL8L80vJeG3U1IVCq-HIrLRdazXXYFX13lWqIIpg9Ql5rpdoccv7K0bXnA0pRlBhdppxHxMp6uNEA078ZuzYYiv8ebvR4P2PKSbHLME-oIocJFyAcXSoAIgYq2uVRdje33aVdL170QXLYrgBRNwaqbP6SgK54XK_S9NLv4bRF0TKtJD5_5y3C4J93WM1Y7GyEOTOQXbW8RcWw-xWHuKAu_dg'
        }
    };
    axios(config)
    .then(response => {
        success(response.data);
    })
    .catch(error => {
        err(error);
    });
}

query("atlassian", 3, body => alert(JSON.stringify(body)), err => alert(err));

function App() {
    const [apiKey, setApiKey] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [plotData, setPlotData] = useState({});

    useEffect(() => {
        fetch(`https://www.reddit.com/r/aww.json?name=`+ {companyName} + "&key=" + {apiKey})
        .then(res => res.json())
        .then(res => {
            setPlotData({});
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
                <Input value={companyName} placeholder="Company Name" width="320px"/>
                <Input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Watson Discovery API Key" width="320px" type="password"/>
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
    
initializeBlock(() => <App/>);