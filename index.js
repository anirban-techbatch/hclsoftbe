 


import fs from 'fs'
import http from 'http'
import querystring from 'querystring'
import url from 'url'

const modifyData=(data)=>{

    data.forEach((dt)=>{

            switch(dt.Criticality){

                case 'Critical':
                    dt.Criticality=1
                    break;
                case 'Important':
                    dt.Criticality=2
                    break;
                case 'Moderate':
                    dt.Criticality=3
                    break;
                case 'Medium':
                    dt.Criticality =4
                    break;
                case 'Low':
                    dt.Criticality=5
                    break;
                case 'Unspecified':
                    dt.Criticality=6
                    break;
                
                default:
                    dt.Criticality=0
                    break;


            }


    })

    return data
}


const parseCSV=(data)=>{

console.log(data)
let lines=data.split('\n')
console.log(lines)
 let results=[]
 const headers=lines.shift().split(',')
console.log(lines.length)
lines.forEach((ln)=>{
    let temp={}
    let row=ln.split(',')
    let index=0
    headers.forEach((hd)=>{
        temp[hd]=row[index]
        index++
    })
    results.push(temp)

})
return results
}

const getDataFromServer=(filter)=>{
    return new Promise((res,rej)=>{
        fetch('https://bigfix-server.sbx0228.play.hclsofy.dev/api/query', {
            method: 'POST',
            body:JSON.stringify({
                 "query": "select JSON_OBJECT('SiteID', siteID, 'FixletID', id, 'Name', Title, 'Criticality', severity, 'RelevantComputerCount', count_computers(Relevant), 'SourceReleaseDate', SourceReleaseDate) from FIXLETS where siteID = 2 and Title like 'MS24-%'"
              }),
                  headers: {
               'Authorization': 'Basic ' + Buffer.from('admin' + ':' + 'NcweJrthQZdx58r').toString('base64'),
               'content-type':'application/json+sql'
            } 
        })
            .then((response) => response.json())
            .then((json) =>{

                if(filter){
                    json=json.filter(dt=>dt.Criticality.toUpperCase()==filter.toUpperCase())
                }
              
                res(json)
            })
            .catch(error => {
                console.log(error)
                rej(error)
            })
    })
  


}

const calculateAggrigate=async (type)=>{
    const criticalityList=['Critical','Important','Moderate','Unspecified','Low','Medium']
    let data=await getDataFromServer()
    let aggrigate=[]
    if(type=='criticality'){
        console.log("inside criticality")
        criticalityList.forEach((crt)=>{
            console.log(crt)
            let count=data.filter((dt)=>dt.Criticality==crt).length
            console.log(count)
            aggrigate.push([crt,count])
        })



    }

    return aggrigate

}




http.createServer(async (req,res)=>{
    // const url = req.url;
    // console.log(url)
//     const parsed = url.parse(req.url);
// const query  = querystring.parse(parsed.query);
//     console.log(query)

let path=req.url.split('?')[0]
console.log(path)
    switch(path){
        case '/':
            {
            res.write('Welcome to server ');
            res.end();
            break;
            }
        case '/fixlets':
            {
            let data= fs.readFileSync('fixlets.csv','utf-8')
            let jsondata= parseCSV(data)
            console.log(jsondata)
            res.end(JSON.stringify(jsondata));
            break;
            }
        case '/fixletsfromserver':
            {
            
            const parsed = url.parse(req.url);
            const query  = querystring.parse(parsed.query);
            let jsondata= await getDataFromServer(query.criticality)
            console.log(jsondata)
            res.end(JSON.stringify(modifyData(jsondata)));
            break;
            }
        case '/fixletsfromserver':
                {
                let jsondata= await getDataFromServer(query.criticality)
                console.log(jsondata)
                res.end(JSON.stringify(jsondata));
                break;
                }
       case '/fixletstats':
                 {
                    let data={
                        'CriticalityAggregate':await calculateAggrigate('criticality')
                    }

                    res.end(JSON.stringify(data));
                    break;
                    }


    }

}).listen(8181)


