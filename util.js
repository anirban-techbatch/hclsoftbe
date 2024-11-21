
export const modifyData=(data)=>{
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

export const parseCSV=(data)=>{

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

 export    const getDataFromServer=(filter)=>{
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

export     const calculateAggrigate=async (type,data)=>{
        const criticalityList=['Critical','Important','Moderate','Unspecified','Low','Medium']   
        let aggrigate=[]
        if(type=='criticality'){
            console.log("inside criticality")
            criticalityList.forEach((crt)=>{
              
                let count=data.filter((dt)=>dt.Criticality==crt).length
             
                aggrigate.push([crt,count])
            })
    
        }
        if(type=='monthly'){
           
            let sorted=data.sort(function(a,b){
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return new Date(b.SourceReleaseDate) - new Date(a.SourceReleaseDate);
              });
              let endDate=new Date(sorted[0].SourceReleaseDate)
              let startDate=new Date(sorted[sorted.length-1].SourceReleaseDate)
             
              let datearr=[]
              while(startDate<=endDate){
                let yr=startDate.getFullYear()
                let month=startDate.toLocaleString('default', { month: 'long' });
                datearr.push(`${yr} ${month}`)
                startDate.setMonth(startDate.getMonth()+ 1)
              }
          datearr.forEach((dta)=>{
               let count=data.filter((dt)=>(new Date(dt.SourceReleaseDate).getFullYear())==dta.split(' ')[0] && (new Date(dt.SourceReleaseDate).toLocaleString('default', { month: 'long' }))==dta.split(' ')[1]).length
               
               aggrigate.push([`${dta.split(' ')[0]} ${dta.split(' ')[1].substring(0,3)}`,count])
            })
        }
        return aggrigate
    }


 
