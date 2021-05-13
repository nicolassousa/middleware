const jasminAux = require('./../controllers/jasmin.aux.controller');
const req = require('request');
const url_jasmin = 'https://my.jasminsoftware.com/api/253706/253706-0001/';
const hubspot = require('./../controllers/hubspot.controller');
const hubspotController = require('./../controllers/hubspot.controller');

function registarCompra(request, response) {
    const email = request.body.email;
    const IdProduto = request.body.idProduto;

    jasminAux.getTypeInvoice((res) => {
        if (res.invoiceType) {
            const invoiceType = res.invoiceType;
            const access_token = res.access_token;

            jasminAux.getProducts(access_token, (res) => {
                if (res.products) {

                    let product;
                    let productSold = [];

                    for (let j = 0; j < res.products.length; j++) {
                        if (res.products[j].itemKey == IdProduto) {
                            product = res.products[j];
                            break;
                        }
                    }

                    if(product){
                        productSold.push({
                            'salesItem': product.itemKey,
                            'description': product.description,
                            'quantity': 1,
                            'unitPrice': product.priceListLines[0].priceAmount,
                            'unit': product.priceListLines[0].unit,
                            'itemTaxSchema': product.itemTaxSchema,
                            'deliveryDate': new Date().toISOString()
                        })
                    }

                    jasminAux.checkUser(email, access_token, (res) => {
                        if (res.statusCode == 200) {
                            if (res.body.length == 0) {

                                jasminAux.insertClient(email, access_token, (res) => {
                                    if (res.statusCode == 200) {
                                        const user = res.body;

                                        if(productSold.length != 0){
                                            let json = {
                                                'documentType': 'FR',  //Tipo de Documento - Fatura Recibo
                                                'serie': invoiceType.serie, //Serie a que a fatura pertence - ex: 2021 (faturas do ano 2021)
                                                'seriesNumber': invoiceType.currentNumber, //Chave da série
                                                'company': 'RUM', //Empresa 
                                                'paymentTerm': '00', //Pronto Pagamento
                                                'paymentMethod': 'MB', //Método Pagamento MB
                                                'currency': 'EUR', //Moeda
                                                'documentDate': new Date().toISOString(), //Data em que o documento foi instanciado
                                                'postingDate': new Date().toISOString(), // Data em que o documento foi criado
                                                'buyerCustomerParty': user.partyKey, //ID do cliente que realiza a compra
                                                'buyerCustomerPartyName': user.name, //Nome do Cliente
                                                'buyerCustomerPartyTaxId': user.companyTaxID, //NIF do cliente
                                                'exchangeRate': 1,
                                                'discount': 0, //Percentagem de desconto
                                                'loadingCountry': 'PT', //País de venda
                                                'unloadingCountry': 'PT', //País de Compra
                                                'financialAccount': '01', //Conta 01 (Empresa RUM)
                                                'isExternal': false,
                                                'isManual': false,
                                                'isSimpleInvoice': false,
                                                'isWsCommunicable': false,
                                                'deliveryTerm': 'NA', //Termo de entrega - Nao Aplicavel
                                                'documentLines': productSold,
                                                'WTaxTotal': { //Pagamento de Taxas
                                                    'amount': 0,
                                                    'baseAmount': 0,
                                                    'reportingAmount': 0,
                                                    'fractionDigits': 2,
                                                    'symbol': '€'
                                                },
                                                'TotalLiability': { //Preco Liquido
                                                    'baseAmount': 0,
                                                    'reportingAmount': 0,
                                                    'fractionDigits': 2,
                                                    'symbol': '€'
                                                }
                                            }

                                            let options = {
                                                headers: {
                                                    'Authorization': `Bearer ${access_token}`,
                                                    'Content-Type': 'application/json; charset=utf-8',
                                                    'Content-Length': JSON.stringify(json).length
                                                },
                                                url: `${url_jasmin}billing/invoices`,
                                                body: JSON.stringify(json)
                                            }
                    
                                            req.post(options, (err, res) => {
                                                const idFatura = res.body;
                                                if (!err && res.statusCode == 201) {
                                                    let numeroSenhas;
                                                    if(IdProduto == 'PACKSENHAS'){
                                                        numeroSenhas = 10;
                                                    } else{
                                                        numeroSenhas = 1;
                                                    }

                                                    jasminAux.acertoStock(IdProduto, access_token, (res) => {
                                                        if(res.statusCode == 201){
                                                            hubspot.updateClient(email, numeroSenhas, (res) => {
                                                                if(res.statusCode == 200){
                                                                    jasminAux.getPDFDocument(access_token, idFatura,(res) => {
                                                                        if(res.statusCode == 200){
                                                                            const pdf = res.body;
                                                                            jasminAux.sendPDF(email, pdf);
                                                                            return response.status(200).json({
                                                                                message: 'success',
                                                                            });
                                                                        }
                                                                        else{
                                                                            return response.status(400).json({
                                                                                message: res.body
                                                                            });
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        }else{
                                                            return response.status(400).json({
                                                                message: res.body
                                                            });
                                                        }
                                                    })
                                                } else {
                                                    return response.status(400).json({
                                                        message: res.body
                                                    });
                                                }
                                            })
                                        }
                                    }
                                    else {
                                        return response.status(400).json({
                                            message: res.body
                                        });
                                    }
                                })
                            } else {
                                const user = res.body[0];

                                if(productSold.length != 0){
                                    let json = {
                                        'documentType': 'FR',  //Tipo de Documento - Fatura Recibo
                                        'serie': invoiceType.serie, //Serie a que a fatura pertence - ex: 2021 (faturas do ano 2021)
                                        'seriesNumber': invoiceType.currentNumber, //Chave da série
                                        'company': 'RUM', //Empresa 
                                        'paymentTerm': '00', //Pronto Pagamento
                                        'paymentMethod': 'MB', //Método Pagamento MB
                                        'currency': 'EUR', //Moeda
                                        'documentDate': new Date().toISOString(), //Data em que o documento foi instanciado
                                        'postingDate': new Date().toISOString(), // Data em que o documento foi criado
                                        'buyerCustomerParty': user.partyKey, //ID do cliente que realiza a compra
                                        'buyerCustomerPartyName': user.name, //Nome do Cliente
                                        'buyerCustomerPartyTaxId': user.companyTaxID, //NIF do cliente
                                        'exchangeRate': 1,
                                        'discount': 0, //Percentagem de desconto
                                        'loadingCountry': 'PT', //País de venda
                                        'unloadingCountry': 'PT', //País de Compra
                                        'financialAccount': '01', //Conta 01 (Empresa RUM)
                                        'isExternal': false,
                                        'isManual': false,
                                        'isSimpleInvoice': false,
                                        'isWsCommunicable': false,
                                        'deliveryTerm': 'NA', //Termo de entrega - Nao Aplicavel
                                        'documentLines': productSold,
                                        'WTaxTotal': { //Pagamento de Taxas
                                            'amount': 0,
                                            'baseAmount': 0,
                                            'reportingAmount': 0,
                                            'fractionDigits': 2,
                                            'symbol': '€'
                                        },
                                        'TotalLiability': { //Preco Liquido
                                            'baseAmount': 0,
                                            'reportingAmount': 0,
                                            'fractionDigits': 2,
                                            'symbol': '€'
                                        }
                                    }

                                    let options = {
                                        headers: {
                                            'Authorization': `Bearer ${access_token}`,
                                            'Content-Type': 'application/json; charset=utf-8',
                                            'Content-Length': JSON.stringify(json).length
                                        },
                                        url: `${url_jasmin}billing/invoices`,
                                        body: JSON.stringify(json)
                                    }
            
                                    req.post(options, (err, res) => {
                                        if (!err && res.statusCode == 201) {
                                            const idFatura = res.body;
                                            let numeroSenhas;
                                            if (IdProduto == 'PACKSENHAS') {
                                                numeroSenhas = 10;
                                            } else {
                                                numeroSenhas = 1;
                                            }
                                            
                                            jasminAux.acertoStock(IdProduto, access_token, (res) => {
                                                if(res.statusCode == 201){
                                                    hubspot.updateClient(email, numeroSenhas, (res) => {
                                                        if(res.statusCode == 200){
                                                            jasminAux.getPDFDocument(access_token, idFatura,(res) => {
                                                                if(res.statusCode == 200){
                                                                    const pdf = res.body;
                                                                    jasminAux.sendPDF(email, pdf);
                                                                    return response.status(200).json({
                                                                        message: 'success',
                                                                    });
                                                                }
                                                                else{
                                                                    return response.status(400).json({
                                                                        message: res.body
                                                                    });
                                                                }
                                                            })
                                                        }
                                                        else{
                                                            return response.status(400).json({
                                                                message: res.body
                                                            });
                                                        }
                                                    })
                                                }else{
                                                    return response.status(400).json({
                                                        message: res.body
                                                    });
                                                }
                                            })
                                        } else {
                                            return response.status(400).json({
                                                message: res.body
                                            });
                                        }
                                    })
                                }
                            }
                        }
                        else {
                            return response.status(400).json({
                                message: res.body
                            });
                        }

                    })
                } else {
                    return response.status(400).json({
                        message: res.body
                    })
                }
            })
        } else {
            return response.status(400).json({
                message: res.body
            })
        }
    })
}

function consumirSenha(request, response){
    var path = require('path');
    const email = request.params.email;

    hubspotController.gastarSenha(email , (res) => {
        if(res.statusCode == 204){
            jasminAux.getToken((res) => {
                if (res.access_token) {
                    const access_token = res.access_token;
                
                    jasminAux.registarConsumo(access_token, (res) => {
                        if (res.statusCode == 201) {
                            return response.sendFile(path.resolve('Success_Page.html'));
                        } else {
                            return response.sendFile(path.resolve('Unsuccess_Page.html'));
                        }
                    })
                }
            })
        }
    })
}

module.exports = {
    registarCompra: registarCompra,
    enviarPDFEmail: enviarPDFEmail,
    consumirSenha: consumirSenha
}