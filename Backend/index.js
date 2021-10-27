var cors = require('cors')
var express = require('express')
var net = require('net')
var config = require('./config/config.js')
const app = express()
var portWEB = config.configWEB.port
app.set('views', "./src");

app.use(express.static('./src'));
app.set('view engine', 'ejs');

app.use(cors())
app.disable('x-powered-by')


app.get('/TerminaisLojas', function (req, res, next) {
  res.send({
    terminais: ListaLojas,
    hosts: hosts
  });
  next()
});

app.listen(process.env.PORT || portWEB, () => {
  console.log(`=> Informação: Aplicação WEB Iniciada na porta ${portWEB}.`);
})



var hosts = config.config.hostsDev
//var hosts = config.config.hosts
var index = config.config.indexDev
//var index = config.config.index
var port = config.config.port

var ListaLojas = []

for (var i = 0; i < hosts.length; i++) {
  node(i, index[i], hosts[i], port)
}

function node(id, name, host, port) {
  var list = [];
  var estado = false;
  var client = new net.Socket();

  client.connect({ host: host, port: port })

  client.id = id;
  client.name = name;
  client.json = { 'Index': name, 'Loja': host, 'Lista': list, 'Estado': estado }


  if (ListaLojas.length != hosts.length) {
    ListaLojas.push(client.json)
  }


  client.
    on('connect', function () {
      ListaLojas.forEach(item => {
        if (item.Index == client.json.Index) {
          item.Estado = true;
          item.Lista = list;
        }
      });
      console.log(`=> Sucesso: Conexão estabelecida com o servidor [ IP: ${host} | ID: ${client.id} ].`);
    })
    .on('close', async function () {
      console.log(`=> Falhou: Conexão perdida com o servidor [ IP: ${host} | ID: ${client.id} ].`)
      ListaLojas.forEach(item => {
        if (item.Index == client.json.Index) {
          item.Estado = false;
          item.Lista = [];
        }
      });
      client.destroy()
      await sleep(8000).then(() => {
        node(client.id, client.name, host, port)
      })

    }).on('error', (err) => {
    })
    .on('data', (data) => {
      verificarLinhas(data.toString(), list)
      client.end();
    })
}

function verificarLinhas(data, list) {
  var linha = data.substring(1).split("\r\n")[0];
  var novaLinha = data.trim().split('\n')
  novaLinha.forEach(novaLinha => {
    if (novaLinha != undefined
      && novaLinha.includes("Servidor TC") != true
      && novaLinha.includes("#live") != true
      && novaLinha.includes("127.0.0.1") != true
      && novaLinha.includes("192.168.65.195") != true) {
      novaLinha.charAt(0) == "+" ? list.push(linha) : false;
      novaLinha.charAt(0) == "-" ? list.splice(list.indexOf(linha), 1) : false;
      novaLinha.charAt(0) == "1" ? list.push(novaLinha) : false;
    }
  });
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}






