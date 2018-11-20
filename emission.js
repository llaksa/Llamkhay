const path = require('path');
const mime = require('mime-types');
const fs = require('fs');
const zlib = require('zlib');
const Excel = require('exceljs');
const getTime = require('date-fns/get_time');
const ROOT_URL = 'http://emisores.facturactiva.com';
const xlsx2json = require('xlsx2json');
const { exec } = require('child_process')

/**
 * 
 * @param {string} file
 */
const createStreamFile = (file) => {
  return new Promise((resolve, reject) => {
    let currentTime = getTime(new Date());
    let readStream = fs.createReadStream(file);

    let outputPath = path.join(__dirname, '..', 'public', 'zip', `FA-${currentTime}.gz`);
    console.log(outputPath);
    // writable stream 
    let writeStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

    // set encoding to utf-8 instead of buffer
    readStream.setEncoding('utf8');
    readStream
      .on('error', (err) => { reject(err) })
      .on('data', () => console.log('data read correctly...'))
      .pipe(zlib.createGzip())
      .pipe(writeStream)
      .on('finish', () => {
        console.log('Done write strem file');
        resolve(outputPath);
      });
  });
};

// irvin start ========================================================================
/**
 * 
 * @param {string} file 
 */
const createStreamExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    let currentTime = getTime(new Date());
    let readStream = fs.createReadStream(file);

    let outputPath = path.join(__dirname, '..', 'public', 'zip', `FA-${currentTime}.gz`);
    console.log(outputPath);
    // writable stream 
    let writeStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

    // set encoding to utf-8 instead of buffer
    readStream.setEncoding('utf8');
    readStream
      .on('error', (err) => { reject(err) })
      .on('data', () => console.log('data read correctly...'))
      .pipe(zlib.createGzip())
      .pipe(writeStream)
      .on('finish', () => {
        console.log('Done write strem file');
        resolve(outputPath);
      });
  });
};

/**
 * 
 * @param {string} outputFile 
 * @param {object} res 
 */
const returnStreamExcelFile = (outputFile, res) => {
  return new Promise((resolve, reject) => {
    // check if file exists
    if (!fs.existsSync(outputFile)) {
      reject('No se pudo exportar el archivo correctamente');
    }

    let readableStream2 = fs.createReadStream(outputFile);
    // set encoding to utf-8 instead of buffer
    //readableStream2.setEncoding('utf8');

    // get file name and mime ype
    let filename = path.basename(outputFile);
    let mimetype = mime.lookup(outputFile);

    // set headers
    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    //res.setHeader('content-encoding', 'gzip');
    res.setHeader('Content-type', mimetype);

    // send stream
    readableStream2
      .on('error', (err2) => { reject(err2) })
      .on('data', () => console.log('data read correctly...'))
      .pipe(zlib.createGunzip())
      .pipe(zlib.createGzip())
      .pipe(res)
      .on('finish', () => console.log('done read stream file'));
  });
};
//irvin end ==============================================================================

/**
 * 
 * @param {string} outputFile 
 * @param {object} res 
 */
const returnStreamFile = (outputFile, res) => {
  return new Promise((resolve, reject) => {
    // check if file exists
    if (!fs.existsSync(outputFile)) {
      reject('No se pudo exportar el archivo correctamente');
    }

    let readableStream2 = fs.createReadStream(outputFile);
    // set encoding to utf-8 instead of buffer
    //readableStream2.setEncoding('utf8');

    // get file name and mime ype
    let filename = path.basename(outputFile);
    let mimetype = mime.lookup(outputFile);

    // set headers
    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    //res.setHeader('content-encoding', 'gzip');
    res.setHeader('Content-type', mimetype);

    // send stream
    readableStream2
      .on('error', (err2) => { reject(err2) })
      .on('data', () => console.log('data read correctly...'))
      .pipe(zlib.createGunzip())
      .pipe(zlib.createGzip())
      .pipe(res)
      .on('finish', () => console.log('done read stream file'));
  });
};

/**
 * 
 * @param {object} req 
 * @param {object} res 
 */
const exportZipFile = async (req, res) => {
  try {
    // let's export all documents for this user
    if (req.params.idElectronico && (typeof req.params.idElectronico !== 'undefined')) {
      let file = path.join(__dirname, '..', 'public', 'images', 'observado.xml');

      let outputFile = await createStreamFile(file).catch((createStreamError) => {
        throw new Error(createStreamError);
      });

      let rs = await returnStreamFile(outputFile, res).catch((readStreamFile) => {
        throw new Error(readStreamFile);
      });
    } else {
      res.send(`bienvenido ${req.params.idElectronico} `);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message
    });
  }
}


// irvin - start ============================================================================
const exportExcelFile = async (req, res) => {
  try {
    // let's export all documents for this user
    const theFile = req.params.idElectronico

    if (theFile && (typeof theFile !== 'undefined')) {

      await exec(`cd public && zip zip/oneDir.zip -r excel/${theFile}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          return;
        }
        console.log(`stdout: ${stdout}`)
        console.log(`stderr: ${stderr}`)

        let file = path.join(__dirname, '..', 'public', 'zip', 'oneDir.zip')
        res.download(file, 'oneDir.zip')
      })



    } else {

      //res.send(`bienvenido ${theFile} `)
      await exec('cd public && zip zip/manyDir.zip -r excel', (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          return;
        }
        console.log(`stdout: ${stdout}`)
        console.log(`stderr: ${stderr}`)

        let files = path.join(__dirname, '..', 'public', 'zip', 'manyDir.zip')
        res.download(files, 'manyDir.zip')
      })

    }

  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message
    })
  }
}
// irvin - end =============================================================================

const normalizePathToLogo = (basePath, logoPath) => {
  var normalizedPath;

  normalizedPath = path.relative(basePath, logoPath);

  // si detectamos un path invalido no enviamos ruta a imagen
  if (normalizedPath.indexOf('..') === 0) {
    normalizedPath = undefined;
  } else {
    normalizedPath = ROOT_URL + '/' + normalizedPath.replace(/\\/g, '/');
  }

  return normalizedPat
  
  h;
};


const sendEmail = async (req, res) => {
  try {
    let workbook = new Excel.Workbook();
    for(let i= 1; i<=11; i++) {
      let filename = path.join(__dirname, '..', 'public', 'excel', `data${i}.xlsx`);
      let filename2 = path.join(__dirname, '..', 'public', 'excel',`datos${i}.json`);
      let data = await xlsx2json(filename, {
        dataStartingRow: 2,
        mapping: {
          'serie': 'A',
          'correlativo': 'B',
          'tipoDocumento': 'C',
          'tipoDocEmisor': 'D',
          'numDocEmisor': 'E',
          'codEnvio': 'F',
          'correoNotificacionReceptor': 'G'
        }
      }).then((jsonresult) => {
        return jsonresult[0];
      });
  
      if (Array.isArray(data) && data.length > 0) {
        fs.writeFile(filename2, JSON.stringify(data), function (err) {
          if (err) {
            return console.log(err);
          }
          console.log("The file was saved!");
        });
      }
    }
    

    debugger;

    res.send('ok');
    return;

    let currentCompany = req.user.currentCompany,
      currentCompanyLogo,
      currentCompanyName,
      rutaLogo = path.join(__dirname, '..', 'public', 'images', 'easy-taxi.png').
        company = req.user.currentCompany.idEmpresa,
      dbDocumentoElectronicoDescarga = db.emision.DocumentoElectronicoDescarga,
      dbConstanciaRecepcion = db.emision.ConstanciaRecepcion,
      documents = req.body.arraydoc,
      issuerName = '',
      mail = req.body.mail,
      multipleIssuers = (req.body.multipleIssuers) != null ? true : false,
      getIssuerNameAsync;

    currentCompanyName = currentCompany.nombre;

    if (rutaLogo) {
      currentCompanyLogo = normalizePathToLogo(ADMIN_PUBLIC_DIR_PATH, rutaLogo);
    }


    debugger;
    res.send('ok');
    return;



    if (!Array.isArray(documents)) {
      res.status(HttpStatus.NO_CONTENT).send('No se encontraron archivos para los Comprobantes seleccionados.');
    } else {
      if (documents.length === 1 || multipleIssuers === false) {
        getIssuerNameAsync = db.general.Persona.findPerson({
          tipoDocPrincipal: documents[0].tipoDocEmisor,
          numDocPrincipal: documents[0].numDocEmisor
        });
      } else {
        getIssuerNameAsync = Promises.resolve();
      }

      getIssuerNameAsync.then(function (issuerPersonInfo) {
        if (issuerPersonInfo != null) {
          issuerName = issuerPersonInfo.nombre;
        }

        return Promises.map(documents, function (file) {
          let result = file.numDoc.split('-'),
            serie = result[0],
            correlativo = result[1];

          let descargas = dbDocumentoElectronicoDescarga.findAll({
            where: {
              idEmisor: company,
              serie: serie,
              correlativo: correlativo,
              tipoDocumento: file.codDoc,
              tipoDocEmisor: file.tipoDocEmisor,
              numDocEmisor: file.numDocEmisor,
              tipoDescarga: {
                $in: [DOCUMENT_DOWNLOAD_TYPES.xml, DOCUMENT_DOWNLOAD_TYPES.pdf]
              }
            },
            attributes: ['ruta']
          });

          let constancia = dbConstanciaRecepcion.findOne({
            attributes: ['rutaCdr'],
            where: {
              codCdr: (file.cdr).split('.')[0],
              codEnvio: (file.cdr).split('.')[1],
              tipoCdr: '01',
              tipoDocEmisor: file.tipoDocEmisor,
              esOriginal: true,
              numDocEmisor: file.numDocEmisor,
              idEmisor: company
            }
          });

          return Promises.join(descargas, constancia, function (resultDescargas, resultCdr) {
            resultDescargas.push(resultCdr);
            return resultDescargas;
          });
        }).then(function (result) {
          if (!result || !result.length) {
            logger.error('Ruta no encontrada');
            res.status(HttpStatus.NO_CONTENT).send('No se encontraron archivos para los Comprobantes seleccionados.');
          } else {
            let attachDocs = [];
            let newZip = new zip.ZipFile();

            let CURRENT_INDEX_PROCESSING = 0;
            let COUNT_SUCCESS = 0;

            let getAddFile = function (data) {
              if (data && data.length > 0) {
                return new Promises(function (resolve, reject) {
                  let pathXML = !data[0] ? null : data[0].ruta,
                    pathPDF = !data[1] ? null : data[1].ruta,
                    pathCDR = !data[2] ? null : data[2].rutaCdr,
                    foldername = !pathXML ? path.basename(pathPDF, '.pdf') : path.basename(pathXML, '.xml');

                  var asyncXml = new Promises(function (resolve, reject) {
                    if (pathXML) {
                      fs.stat(pathXML, function (err, stats) {
                        if (err) {
                          if (err.code === 'ENOENT') {
                            logger.error('Archivo no encontrado: ' + path.basename(pathXML) + ' => ' + err.toString());
                          } else {
                            logger.error('XML: Error interno: => ' + err.toString());
                          }
                          resolve(false);
                        } else {
                          resolve(pathXML);
                        }
                      });
                    } else {
                      resolve(pathXML);
                    }
                  });

                  var asyncPdf = new Promises(function (resolve, reject) {
                    if (pathPDF) {
                      fs.stat(pathPDF, function (err, stats) {
                        if (err) {
                          if (err.code === 'ENOENT') {
                            logger.error('Archivo no encontrado: ' + path.basename(pathPDF) + ' => ' + err.toString());
                          } else {
                            logger.error('PDF: Error interno: => ' + err.toString());
                          }
                          resolve(false);
                        } else {
                          resolve(pathPDF);
                        }
                      });
                    } else {
                      resolve(pathPDF);
                    }
                  });

                  var asyncCdr = new Promises(function (resolve, reject) {
                    if (pathCDR) {
                      fs.stat(pathCDR, function (err, stats) {
                        if (err) {
                          logger.error('Archivo CDR no encontrado: ' + path.basename(pathCDR) + '=>' + err.toString());
                          resolve(false);
                        } else {
                          resolve(pathCDR);
                        }
                      });
                    } else {
                      resolve(pathCDR);
                    }
                  });

                  return Promises.all([asyncXml, asyncPdf, asyncCdr]).then(function (paths) {
                    if (paths && paths.length) {
                      if (paths[0]) {
                        if (result.length > 1) {
                          newZip.addFile(paths[0], foldername + '/' + path.basename(paths[0]));
                        } else {
                          attachDocs.push({
                            filename: path.basename(paths[0]),
                            path: paths[0]
                          });
                        }
                        COUNT_SUCCESS++;
                      }

                      if (paths[1]) {
                        if (result.length > 1) {
                          newZip.addFile(paths[1], foldername + '/' + path.basename(paths[1]));
                        } else {
                          attachDocs.push({
                            filename: path.basename(paths[1]),
                            path: paths[1]
                          });
                        }
                        COUNT_SUCCESS++;
                      }

                      if (paths[2]) {
                        if (result.length > 1) {
                          newZip.addFile(paths[2], foldername + '/' + path.basename(paths[2]));
                        } else {
                          attachDocs.push({
                            filename: path.basename(paths[2]),
                            path: paths[2]
                          });
                        }
                        COUNT_SUCCESS++;
                      }

                      resolve('Success addFile()');
                    } else {
                      reject(new Error('Error addFile()'))
                    }
                  });
                }).catch(function (err) {
                  logger.error(err.toString());
                });
              } else {
                return Promises.reject(new Error('Ruta en blanco'));
              }
            }

            let getNextAddFile = function () {
              if (CURRENT_INDEX_PROCESSING === result.length) {
                return Promises.resolve();
              }

              let data = result[CURRENT_INDEX_PROCESSING];

              return getAddFile(data).then(function () {
                CURRENT_INDEX_PROCESSING++;
                return getNextAddFile();
              }).catch(function (err) {
                if (err) {
                  logger.error('Archivo no encontrado: ' + err.toString());
                }
                CURRENT_INDEX_PROCESSING++;
                return getNextAddFile();
              });
            }

            return new Promises(function (resolve, reject) {
              getNextAddFile().then(function () {
                if (COUNT_SUCCESS > 0) {
                  if (result.length > 1) {
                    newZip.outputStream
                      .on('error', function (err) {
                        reject(new Error(err.toString()));
                      })

                    newZip.end();
                  }

                  let emailSubject = 'Envío de Comprobante Electrónico';
                  let descDocumentType = '';
                  let emailMsgOpts = null;

                  if (documents.length === 1) {
                    if (documents[0].codDoc === DOCUMENT_TYPES.invoice) {
                      descDocumentType = 'Factura';
                    } else if (documents[0].codDoc === DOCUMENT_TYPES.saleTicket) {
                      descDocumentType = 'Boleta de Venta';
                    } else if (documents[0].codDoc === DOCUMENT_TYPES.creditNote) {
                      descDocumentType = 'Nota de crédito';
                    } else if (documents[0].codDoc === DOCUMENT_TYPES.debitNote) {
                      descDocumentType = 'Nota de débito';
                    }

                    emailMsgOpts = {
                      issuerName: issuerName,
                      descDocumentType: descDocumentType,
                      documentId: documents[0].numDoc
                    };

                    emailSubject = 'Envío - Comprobante electrónico emitido por ' + issuerName + ' - ' + descDocumentType + ' - ' + documents[0].numDoc;
                  } else if (documents.length > 1 && multipleIssuers === false) {
                    emailMsgOpts = {
                      issuerName: issuerName,
                      multipleIssuers: false
                    };

                    emailSubject = 'Envío - Comprobantes Electrónicos emitidos por ' + issuerName;
                  } else if (multipleIssuers === true) {
                    emailMsgOpts = {
                      multipleIssuers: true
                    };

                    emailSubject = 'Envío - Comprobantes Electrónicos emitidos por multiples emisores';
                  }

                  emailMsgOpts['companyLogo'] = currentCompanyLogo;

                  let mailOptions = {
                    from: currentCompanyName + ' <' + MAIL_MSG_CONFIG.from.emailAddress + '>',
                    to: mail.direc.length ? mail.direc : '',
                    cc: mail.copyDirec.length ? mail.copyDirec : '',
                    subject: emailSubject,
                    html: customizeMail.mailcreateWithFile(emailMsgOpts),
                    attachments: attachDocs.length ? attachDocs : [{
                      filename: req.user.currentCompany.numDocPrincipal + '-EMISION-COMPROBANTES.zip',
                      content: newZip.outputStream
                    }]
                  };

                  smtpTransport.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      logger.error(error);
                    } else {
                      logger.debug('Message sent: ' + info.response);
                    }
                  });

                  res.status(HttpStatus.OK).json({});
                } else {
                  reject(new Error('No se pudo enviar el correo porque no existen los archivos seleccionados.'));
                }
              });
            }).catch(function (err) {
              logger.error('No se pudo exportar a zip: ' + err.toString());
              res.status(HttpStatus.NO_CONTENT).send('No se encontraron archivos para los Comprobantes seleccionados.');
            });
          }
        });
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message
    });
  }
}

exports.sendEmail = sendEmail;
exports.exportExcelFile = exportExcelFile;
exports.exportZipFile = exportZipFile;
