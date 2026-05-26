const botoesAdicionar = document.querySelectorAll(".btn-adicionar");
const divCarrinho = document.querySelector(".itens-carrinho");
const totalCarrinho = document.getElementById("total-carrinho");
const pesquisaProduto = document.getElementById("pesquisaProduto");
const produtos = document.querySelectorAll(".produto");
const filtroCategoria = document.getElementById("filtroCategoria");
const paypalContainer = document.getElementById("paypal-button-container");

let carrinho = [];

/* =========================
   CALCULAR TOTAL
========================= */

function calcularTotal() {
    let total = 0;

    carrinho.forEach(item => {
        total += item.preco * item.quantidade;
    });

    return total;
}

/* =========================
   ATUALIZAR CARRINHO
========================= */

function atualizarCarrinho() {

    let total = calcularTotal();

    divCarrinho.innerHTML = "";

    if (carrinho.length === 0) {
        divCarrinho.innerHTML = `<p>Seu carrinho está vazio.</p>`;
    } else {

        carrinho.forEach((item, index) => {

            divCarrinho.innerHTML += `
                <div class="item-carrinho mb-3">
                    <h6>${item.nome}</h6>
                    <p>R$ ${item.preco.toFixed(2)}</p>

                    <div class="d-flex align-items-center gap-2">

                        <button class="btn btn-sm btn-secondary"
                            onclick="diminuirQuantidade(${index})">-</button>

                        <span>${item.quantidade}</span>

                        <button class="btn btn-sm btn-secondary"
                            onclick="aumentarQuantidade(${index})">+</button>

                        <button class="btn btn-sm btn-danger"
                            onclick="removerProduto(${index})">Remover</button>

                    </div>
                </div>
                <hr>
            `;
        });
    }

    totalCarrinho.innerHTML = `Total: R$ ${total.toFixed(2)}`;
    atualizarPayPalUI();
}

/* =========================
   ADICIONAR PRODUTOS
========================= */

botoesAdicionar.forEach(botao => {

    botao.addEventListener("click", () => {

        const nome = botao.dataset.nome;
        const preco = parseFloat(botao.dataset.preco);

        const produtoExistente = carrinho.find(item => item.nome === nome);

        if (produtoExistente) {
            produtoExistente.quantidade++;
        } else {
            carrinho.push({
                nome,
                preco,
                quantidade: 1
            });
        }

        atualizarCarrinho();
    });
});

/* =========================
   CONTROLES
========================= */

function removerProduto(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

function aumentarQuantidade(index) {
    carrinho[index].quantidade++;
    atualizarCarrinho();
}

function diminuirQuantidade(index) {
    if (carrinho[index].quantidade > 1) {
        carrinho[index].quantidade--;
    } else {
        carrinho.splice(index, 1);
    }
    atualizarCarrinho();
}

/* =========================
   BUSCA
========================= */

function removerAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

pesquisaProduto.addEventListener("keyup", () => {

    let texto = removerAcentos(
        pesquisaProduto.value.toLowerCase().trim()
    );

    produtos.forEach(produto => {

        let nome = removerAcentos(produto.innerText.toLowerCase());

        produto.style.display = nome.includes(texto)
            ? "block"
            : "none";
    });
});

/* =========================
   FILTRO
========================= */

filtroCategoria.addEventListener("change", () => {

    const categoria = filtroCategoria.value.toLowerCase();

    produtos.forEach(produto => {

        if (categoria === "todas as categorias") {
            produto.style.display = "block";
        } else {
            produto.style.display = produto.classList.contains(categoria)
                ? "block"
                : "none";
        }
    });
});

/* =========================
   PAYPAL (RENDER ÚNICO)
========================= */

paypal.Buttons({

    createOrder: function (data, actions) {

        const total = calcularTotal();

        if (total <= 0) {
            alert("Adicione produtos ao carrinho.");
            return;
        }

        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: total.toFixed(2)
                }
            }]
        });
    },

    onApprove: function (data, actions) {

        return actions.order.capture().then(function (details) {

            alert("Pagamento realizado com sucesso por " + details.payer.name.given_name);

            carrinho = [];
            atualizarCarrinho();
        });
    },

    onCancel: function () {
        alert("Pagamento cancelado.");
    },

    onError: function () {
        alert("Ocorreu um erro no pagamento.");
    }

}).render("#paypal-button-container");

function atualizarPayPalUI() {

    const total = calcularTotal();

    if (total <= 0) {

        paypalContainer.innerHTML = ""; // remove cartão + botão
        return;
    }

    paypalContainer.innerHTML = "";

    paypal.Buttons({

        createOrder: function (data, actions) {

            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: total.toFixed(2)
                    }
                }]
            });
        },

        onApprove: function (data, actions) {

            return actions.order.capture().then(function (details) {

                alert("Pagamento realizado com sucesso por " + details.payer.name.given_name);

                carrinho = [];
                atualizarCarrinho();
                atualizarPayPalUI(); // 🔥 limpa cartão também
            });
        },

        onCancel: function () {
            alert("Pagamento cancelado.");
        },

        onError: function () {
            alert("Ocorreu um erro no pagamento.");
        }

    }).render("#paypal-button-container");
}
