import fs from 'fs'
import http from 'http'
import querystring from 'querystring'
import url from 'url'

import { modifyData,parseCSV,getDataFromServer,calculateAggrigate } from './util.js'

http.createServer(async (req,res)=>{


let path=req.url.split('?')[0]
    switch(path){
        case '/':
            {
            res.write('Welcome to server ');
            res.end();
            break;
            }
        case '/fixlets':
            {
                try{
            let data= fs.readFileSync('fixlets.csv','utf-8')
            let jsondata= parseCSV(data)
            console.log(jsondata)
            res.end(JSON.stringify(jsondata));
        }catch(err){
            console.log(err)
            res.end(JSON.stringify({'status':"Server error"}));
        }
            break;
            }
        case '/fixletsfromserver':
            {
            try{
            const parsed = url.parse(req.url);
            const query  = querystring.parse(parsed.query);
            let jsondata= await getDataFromServer(query.criticality)
            console.log(jsondata)
            res.end(JSON.stringify(modifyData(jsondata)));
        }catch(err){
            console.log(err)
            res.end(JSON.stringify({'status':"Server error"}));
        }
            break;
            }
     
       case '/fixletstats':
                 {
                    try{
                        let data=await getDataFromServer()
                    let json={
                        'CriticalityAggregate':await calculateAggrigate('criticality',data),
                        'MonthAggregate':await calculateAggrigate('monthly',data)
                    }

                    res.end(JSON.stringify(json));
                    }catch(err){
                        console.log(err)
                        res.end(JSON.stringify({'status':"Server error"}));
                    }

                    

                    
                    break;
                    }


    }
    

}).listen(8181)


