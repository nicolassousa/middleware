const req = require('request');
const moloniauxcontroller = require('./../controllers/moloni.aux.controller');
const querystring = require('querystring');

function registarEncomenda(request, response){
    const email = request.body.email;
    const nif = request.body.nif;
    const idBar = request.body.idBar;
    const items = request.body.items;
    const dataEncomenda = request.body.dataEncomenda;

    moloniauxcontroller.getToken((res)=>{
        const access_token = res.access_token;


        let productsSold = [];

        moloniauxcontroller.getProdutos(access_token, (res)=>{

            if(res.produtos){

                for (let i = 0; i < items.length; i++) {
    
                    for (let j = 0; j < res.produtos.length; j++) {
                        if (res.produtos[j].reference == items[i].idItem) {
                            productsSold.push({
                                'product_id': res.produtos[j].product_id,
                                'name': res.produtos[j].name,
                                'qty': items[i].quantidade,
                                'price': res.produtos[j].price,
                                'taxes': [{
                                    'tax_id': res.produtos[j].taxes[0].tax_id,
                                    'value': res.produtos[j].taxes[0].value,
                                    'order': res.produtos[j].taxes[0].order,
                                    'cumulative': res.produtos[j].taxes[0].cumulative
                                }]
                            })
                            break;
            
                        }
                    }
                }

                moloniauxcontroller.getDocumentSetID(access_token, (res) =>{
                    if(res.documentSets){
                        let documentSetID;
        
                        for (let j = 0; j < res.documentSets.length; j++) {
                            if (res.documentSets[j].name == idBar) {
                                documentSetID = res.documentSets[j].document_set_id;
                                break;
                            }
                        }
        
                        if(documentSetID){
                            moloniauxcontroller.getClientByNumber(nif, access_token, (res) =>{
                                if(res.client != 0){
                                    const client = res.client[0];

                                    let json = {
                                        'company_id': '180584',
                                        'date': new Date().toISOString(),
                                        'expiration_date': dataEncomenda,
                                        'document_set_id': documentSetID,
                                        'customer_id': client.customer_id,
                                        'status': 1,
                                        'products': productsSold
                                    };
                                    console.log(json);

                                    let options = {
                                        headers: {
                                            'Content-Type': 'application/json; charset=utf-8'
                                        },
                                        url: `https://api.moloni.pt/v1/purchaseOrder/insert/?access_token=${access_token}&json=true`,
                                        body: JSON.stringify(json)
                                    }
                                    req.post(options, (err, res) => {
                                        if (!err && res.statusCode == 200) {
                                            const document_id = JSON.parse(res.body).document_id;

                                            moloniauxcontroller.getPDFLink(document_id, access_token, (res) =>{
                                                if(res.url){
                                                    moloniauxcontroller.sendPDF(email, res.url);
                                                    return response.status(200).json({
                                                        message: 'success'
                                                    });
                                                }else{
                                                    return response.status(400).json({
                                                        message: res
                                                    });
                                                }
                                            })

                                        } else {
                                            return response.status(400).json({
                                                message: res
                                            });
                                        }
                                    })
        
                                } else {
                                    moloniauxcontroller.insertClient(email, access_token, (res) => {
                                        if(res.customer_id){
                                            moloniauxcontroller.getClientByID(res.customer_id, access_token, (res)=>{
                                                if(res.client){
                                                    const client = res.client;
                                                    
                                                    let json = {
                                                        'company_id': '180584',
                                                        'date': new Date().toISOString(),
                                                        'expiration_date': dataEncomenda,
                                                        'document_set_id': documentSetID,
                                                        'customer_id': client.customer_id,
                                                        'status': 1,
                                                        'products': productsSold
                                                    };
                                                    console.log(json);
                
                                                    let options = {
                                                        headers: {
                                                            'Content-Type': 'application/json; charset=utf-8'
                                                        },
                                                        url: `https://api.moloni.pt/v1/purchaseOrder/insert/?access_token=${access_token}&json=true`,
                                                        body: JSON.stringify(json)
                                                    }
                                                    req.post(options, (err, res) => {
                                                        if (!err && res.statusCode == 200) {
                                                            const document_id = JSON.parse(res.body).document_id;
                
                                                            moloniauxcontroller.getPDFLink(document_id, access_token, (res) =>{
                                                                if(res.url){
                                                                    moloniauxcontroller.sendPDF(email, res.url);
                                                                    return response.status(200).json({
                                                                        message: 'success'
                                                                    });
                                                                }else{
                                                                    return response.status(400).json({
                                                                        message: res
                                                                    });
                                                                }
                                                            })
                
                                                        } else {
                                                            return response.status(400).json({
                                                                message: res
                                                            });
                                                        }
                                                    })
        
                                                }  else{
                                                    return response.status(400).json({
                                                        message: res.body
                                                    })
                                                }
                                            })
                                        } else{
                                            return response.status(400).json({
                                                message: res.body
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    }else{
                        return response.status(400).json({
                            message: res.body
                        })
                    }
                })
            }           
        })
    })
}

module.exports = {
    registarEncomenda: registarEncomenda
}