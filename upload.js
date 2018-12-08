const csvFilePath='data/source/GDS.csv'
var algoliasearch = require('algoliasearch');
const csv=require('csvtojson')

// Async / await usage
async function start() {
    const jsonArray=await csv().fromFile(csvFilePath);

    var client = algoliasearch('90F7LI9KGM', '57f2bad9d160a2254d32e050613c798b');
    var index = client.initIndex('dev_ORGANIZATIONS');
    
    var orgs = []

    jsonArray.forEach(function(row, index){
        var org = {}
        
        org["name"] = row["機關名稱"]
        org["phone"] = row["電話"]
        org["address"] = row["地址"]
        org["phone"] = row["電話"]
        org["dn_raw"] = row["DN"]

        var dnRow = row["DN"]

        dnRow.split(',').forEach(function(kv){
            var kvS = kv.split('=')
            var k = kvS[0]
            var v = kvS[1]

            switch (k) {
                case 'c':
                    org["country"] = v
                    break;
                case 'l':
                    org["legislative_area"] = v
                    break;
                case 'o':
                    org["organization"] = v
                    break;
                case 'ou':
                    typeof org["organization_unit"] !== 'undefined' ? org["organization_unit"] += `, ${v}` : org["organization_unit"] = v
                    break;
                default:
                    console.log(`unknown key: ${k} with value ${v}`)
                    break;
            }
        })

        if (typeof org["organization_unit"] !== 'undefined') {
            org["organization_unit"] = org["organization_unit"].split(', ').reverse()
            var tempOU = ""
            org["organization_unit"].forEach(function(v){
                tempOU !== "" ? tempOU += `, ${v}` : tempOU = v
            })
            org["organization_unit"] = tempOU
        }

        orgs.push(org)
    })

    // console.log(orgs)

    index.addObjects(orgs, function(err, content) {
        if (err) {
            console.log(err)
            console.log(content)
        } else {
            console.log(`upload successful`)
        }
    });
      
}

start();
