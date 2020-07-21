class Moeda {
    constructor(
        id,
        simbolo,
        moeda,
        dataCompra,
        valorNaCompra,
        porcentagemHoje,
        valorHoje
    ) {
        this.id = id;
        this.simbolo = simbolo;
        this.moeda = moeda;
        this.dataCompra = dataCompra;
        this.valorNaCompra = valorNaCompra;
        this.porcentagemHoje = porcentagemHoje;
        this.valorHoje = valorHoje;
    }
}

function preencherDropDown() {
    let objs = [
        {
            text: "USD",
            value: "USD",
        },
        {
            text: "EUR",
            value: "EUR",
        },
        {
            text: "JPY",
            value: "JPY",
        },
        {
            text: "CNY",
            value: "CNY",
        },
        {
            text: "GBP",
            value: "GBP",
        },
    ];
    let $select = document.querySelector("#moeda");
    objs.forEach((moedas) => {
        let $op = document.createElement("option");
        $op.innerText = moedas.text;
        $op.value = moedas.value;
        $select.append($op);
    });
}

async function valorHoje() {
    let $cambio = document.querySelector("#moeda");
    let $qtd = document.querySelector("#qtd");
    let origem = $cambio.options[$cambio.selectedIndex].value;
    let urlhoje = `https://api.exchangeratesapi.io/latest?base=${origem}&symbols=BRL`;
    let valor = await fetch(urlhoje)
        .then(function (data) {
            return data.json();
        })
        .then(function (data) {
            dadosHoje = data.rates.BRL;
            let result = $qtd.value * dadosHoje;
            return result;
        });
    return valor;
}

async function valorMesDeCompra() {
    let $cambio = document.querySelector("#moeda");
    let origem = $cambio.options[$cambio.selectedIndex].value;
    let $data = document.querySelector("#data").value;
    let converterData = moment(JSON.stringify($data)).format("YYYY-MM-DD");
    let mesCompra = `https://api.exchangeratesapi.io/${converterData}?base=${origem}&symbols=BRL`;
    let valorDoMesComprado = await fetch(mesCompra)
        .then(function (data) {
            return data.json();
        })
        .then(function (data) {
            let compra = data.rates.BRL;
            return compra;
        });
    return valorDoMesComprado;
}

async function porcentagemHoje() {
    let $cambio = document.querySelector("#moeda");
    let origem = $cambio.options[$cambio.selectedIndex].value;
    let $data = document.querySelector("#data").value;

    let converterData = moment(JSON.stringify($data)).format("YYYY-MM-DD");
    let url_mes_passado = `https://api.exchangeratesapi.io/${converterData}?base=${origem}&symbols=BRL`;
    let urlhoje = `https://api.exchangeratesapi.io/latest?base=${origem}&symbols=BRL`;

    let mesPassado = await fetch(url_mes_passado)
        .then(function (data) {
            return data.json();
        })
        .then(function (data) {
            let mes = data.rates.BRL;
            return mes;
        });
    let hoje = await fetch(urlhoje)
        .then(function (data) {
            return data.json();
        })
        .then(function (data) {
            let dadosHoje = data.rates.BRL;
            return dadosHoje;
        });

    return (hoje / mesPassado) * 100;
}

function localStorageValue() {
    let localStorageData = localStorage.getItem("moeda");

    if (localStorageData === null || localStorageData.length === 0) {
        return null;
    }

    return JSON.parse(localStorageData);
}

async function montarObjeto() {
    let localStorageData = localStorageValue();
    let obj;
    let id = 0;
    if (localStorageData !== null) {
        let localStorageJson = localStorageData;
        const data = await localStorageJson.pop();
        id = data.id + 1;
    }
    let $qtd = document.getElementById("qtd");
    let $cambio = document.getElementById("moeda");
    let origem = $cambio.options[$cambio.selectedIndex].value;
    let $data = document.getElementById("data").value;
    let valorHojeResponse = await valorHoje();
    let porcentagemHojeResponse = await porcentagemHoje();
    let valorDoMesDeCompraResponse = await valorMesDeCompra();
    obj = new Moeda(
        id,
        $qtd.value,
        origem,
        formatarData($data),
        formatarValor(valorDoMesDeCompraResponse),
        formatarCampoEAdiconarPorcentagem(porcentagemHojeResponse),
        formatarValor(valorHojeResponse)
    );

    $qtd.value = "";
    $cambio.selectedIndex = 0;
    document.getElementById("data").value = "";
    return obj;
}

function carregarObjeto() {
    let localStorageData = localStorageValue();
    let tbody = document.querySelector("tbody");
    if (localStorageData !== null) {
        for (let data of localStorageData) {
            let numeroLinhas = tbody.rows.length;
            let linha = tbody.insertRow(numeroLinhas);

            linha.setAttribute("id", data.id);
            linha.setAttribute("class", "line");

            let celula1 = linha.insertCell(0);
            let celula2 = linha.insertCell(1);
            let celula3 = linha.insertCell(2);
            let celula4 = linha.insertCell(3);
            let celula5 = linha.insertCell(4);
            let celula6 = linha.insertCell(5);
            let celula7 = linha.insertCell(6);

            celula1.innerText = data.simbolo;
            celula2.innerText = data.moeda;
            celula3.innerText = data.dataCompra;
            celula4.innerText = data.valorNaCompra;
            celula5.innerText = data.porcentagemHoje;
            celula6.innerText = data.valorHoje;
            celula7.innerHTML =
                "<button class=\"btn btn-danger\" onclick='removerLinha(this)'>Remover</button>";
        }

        preencherRelatorio();
    }
}

async function preencher() {
    let dic = [];
    let obj = await montarObjeto();
    let tbody = document.querySelector("tbody");
    let numeroLinhas = tbody.rows.length;
    let linha = tbody.insertRow(numeroLinhas);

    linha.setAttribute("id", obj.id);
    linha.setAttribute("class", "line");

    let celula1 = linha.insertCell(0);
    let celula2 = linha.insertCell(1);
    let celula3 = linha.insertCell(2);
    let celula4 = linha.insertCell(3);
    let celula5 = linha.insertCell(4);
    let celula6 = linha.insertCell(5);
    let celula7 = linha.insertCell(6);

    celula1.innerText = obj.simbolo;
    celula2.innerText = obj.moeda;
    celula3.innerText = obj.dataCompra;
    celula4.innerText = obj.valorNaCompra;
    celula5.innerText = obj.porcentagemHoje;
    celula6.innerText = obj.valorHoje;
    celula7.innerHTML =
        "<button class=\"btn btn-danger\" onclick='removerLinha(this)'>Remover</button>";
    dic.push(obj);

    salvarNoLocalStorage(dic);
    preencherRelatorio();
    preencherCarteira();
}

function salvarNoLocalStorage(obj) {
    let list = [];
    let localStorageData = localStorageValue();

    if (localStorageData !== null) {
        list = localStorageData;
    }
    list.push(obj[0]);
    let jsonList = JSON.stringify(list);

    window.localStorage.setItem("moeda", jsonList);
}

function removerLinha(linha) {
    let localStorageData = localStorageValue();

    const localStorageUpdate = localStorageData.filter((item) => {
        return item.id.toString() !== linha.parentNode.parentNode.id;
    });

    localStorage.clear();

    if (localStorageUpdate.length > 0) {
        let jsonList = JSON.stringify(localStorageUpdate);
        localStorage.setItem("moeda", jsonList);
    }

    let i = linha.parentNode.parentNode.rowIndex;
    document.getElementById("tabela").deleteRow(i);
    preencherCarteira();
    preencherRelatorio();
}

function formatarValor(valor) {
    return valor.toFixed(2);
}

function formatarData(data) {
    return moment(data).format("DD/MM/YYYY");
}

function formatarCampoEAdiconarPorcentagem(valor) {
    return `${valor.toFixed(2)}%`;
}

function preencherCarteira() {
    let objJson = localStorageValue();
    let cat = document.querySelector("#carteira");
    if (objJson !== null) {
        let valor = 0;
        for (let o of objJson) {
            const valorFormatado = o.valorHoje.replace(",", ".");
            valor += parseFloat(valorFormatado);
        }

        return (cat.children[0].innerText = `R$${
            valor.toFixed(2)} reais`);
    }

    return (cat.children[0].innerText = `R$ 0.00 reais`);
}

async function preencherRelatorio() {
    let objJson = localStorageValue();
    if (objJson !== null) {
        let moedaUSD = objJson.filter((usd) => {
            return usd.moeda === "USD";
        });
        let moedaEUR = objJson.filter((eur) => {
            return eur.moeda === "EUR";
        });
        let moedaJPY = objJson.filter((jpy) => {
            return jpy.moeda === "JPY";
        });
        let moedaCNY = objJson.filter((cny) => {
            return cny.moeda === "CNY";
        });
        let moedaGBP = objJson.filter((gbp) => {
            return gbp.moeda === "GBP";
        });

        const valorTotalGBP = calcularValorTotal(moedaGBP);
        const valorTotalCNY = calcularValorTotal(moedaCNY);
        const valorTotalJPY = calcularValorTotal(moedaJPY);
        const valorTotalEUR = calcularValorTotal(moedaEUR);
        const valorTotalUSD = calcularValorTotal(moedaUSD);

        let usd = [];
        let cambioUSD;
        if (moedaUSD.length > 0) {
            cambioUSD = await getData(moedaUSD[0].moeda);
            usd = [
                "USD",
                formatarValor(cambioUSD.rates.BRL).toLocaleString('pt-BR').toString(),
                formatarValor(valorTotalUSD).toLocaleString('pt-BR').toString(),
            ];
            preencherBox(usd);
        } else {
            let boxRelatorio = document.querySelector(".USD");
            boxRelatorio.children[0].innerText = "";
            boxRelatorio.children[1].innerText = "";
            boxRelatorio.children[2].innerText = "";
        }

        let eur = [];
        let cambioEUR;
        if (moedaEUR.length > 0) {
            cambioEUR = await getData(moedaEUR[0].moeda);
            eur = [
                "EUR",
                formatarValor(cambioEUR.rates.BRL),
                formatarValor(valorTotalEUR),
            ];
            preencherBox(eur);
        } else {
            let boxRelatorio = document.querySelector(".EUR");
            boxRelatorio.children[0].innerText = "";
            boxRelatorio.children[1].innerText = "";
            boxRelatorio.children[2].innerText = "";
        }

        let jpy = [];
        let cambioJPY;
        if (moedaJPY.length > 0) {
            cambioJPY = await getData(moedaJPY[0].moeda);
            jpy = [
                "JPY",
                formatarValor(cambioJPY.rates.BRL),
                valorTotalJPY.toString(),
            ];
            preencherBox(jpy);
        } else {
            let boxRelatorio = document.querySelector(".JPY");
            boxRelatorio.children[0].innerText = "";
            boxRelatorio.children[1].innerText = "";
            boxRelatorio.children[2].innerText = "";
        }

        let cny = [];
        let cambioCNY;
        if (moedaCNY.length > 0) {
            cambioCNY = await getData(moedaCNY[0].moeda);
            cny = [
                "CNY",
                formatarValor(cambioCNY.rates.BRL),
                valorTotalCNY.toString(),
            ];
            preencherBox(cny);
        } else {
            let boxRelatorio = document.querySelector(".CNY");
            boxRelatorio.children[0].innerText = "";
            boxRelatorio.children[1].innerText = "";
            boxRelatorio.children[2].innerText = "";
        }

        let gbp = [];
        let cambioGBP;
        if (moedaGBP.length > 0) {
            cambioGBP = await getData(moedaGBP[0].moeda);
            gbp = [
                "GBP",
                formatarValor(cambioGBP.rates.BRL),
                valorTotalGBP.toString(),
            ];
            preencherBox(gbp);
        } else {
            let boxRelatorio = document.querySelector(".GBP");
            boxRelatorio.children[0].innerText = "";
            boxRelatorio.children[1].innerText = "";
            boxRelatorio.children[2].innerText = "";
        }
    } else {
        let boxRelatorioUSD = document.querySelector(".USD");
        boxRelatorioUSD.children[0].innerText = "";
        boxRelatorioUSD.children[1].innerText = "";
        boxRelatorioUSD.children[2].innerText = "";

        let boxRelatorioEUR = document.querySelector(".EUR");
        boxRelatorioEUR.children[0].innerText = "";
        boxRelatorioEUR.children[1].innerText = "";
        boxRelatorioEUR.children[2].innerText = "";

        let boxRelatorioJPY = document.querySelector(".JPY");
        boxRelatorioJPY.children[0].innerText = "";
        boxRelatorioJPY.children[1].innerText = "";
        boxRelatorioJPY.children[2].innerText = "";

        let boxRelatorioCNY = document.querySelector(".CNY");
        boxRelatorioCNY.children[0].innerText = "";
        boxRelatorioCNY.children[1].innerText = "";
        boxRelatorioCNY.children[2].innerText = "";

        let boxRelatorioGBP = document.querySelector(".GBP");
        boxRelatorioGBP.children[0].innerText = "";
        boxRelatorioGBP.children[1].innerText = "";
        boxRelatorioGBP.children[2].innerText = "";
    }
}
function preencherBox(vetorMoeda) {
    let boxRelatorio = document.querySelector(`.${vetorMoeda[0]}`);
    for (let i = 0; i < boxRelatorio.children.length; i++) {
        boxRelatorio.children[i].innerText = vetorMoeda[i];
    }
}

function calcularValorTotal(moeda) {
    let valor = 0;
    for (let o of moeda) {
        const valorFormato = o.valorHoje.replace(",", ".");
        valor += parseFloat(valorFormato);
    }
    return valor;
}

async function getData(moeda) {
    const url = `https://api.exchangeratesapi.io/latest?base=${moeda}&symbols=BRL`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        return { error: true, response: error };
    }
}

function excluirTudo() {
    const tbody = document.querySelector("tbody");

    for (let i = tbody.children.length - 1; i >= 0; i--) {
        tbody.deleteRow(i);

    }

    localStorage.clear();
    preencherRelatorio()
    preencherCarteira()
}

preencherDropDown();
preencherCarteira();
preencherRelatorio();
