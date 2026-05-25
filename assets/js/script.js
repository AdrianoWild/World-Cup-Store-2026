const botoesAdicionar =
document.querySelectorAll(".btn-adicionar")

const divCarrinho =
document.querySelector(".itens-carrinho")

const totalCarrinho =
document.getElementById("total-carrinho")

const pesquisaProduto =
document.getElementById("pesquisaProduto")

const produtos =
document.querySelectorAll(".produto")

const filtroCategoria =
document.getElementById("filtroCategoria")

let carrinho = []


botoesAdicionar.forEach(botao => {

    botao.addEventListener("click", () => {

        const nome =
        botao.dataset.nome

        const preco =
        parseFloat(botao.dataset.preco)

        const produtoExistente =
        carrinho.find(item => item.nome === nome)

        if(produtoExistente){

            produtoExistente.quantidade++

        }else{

            carrinho.push({

                nome,
                preco,
                quantidade: 1

            })
        }

        atualizarCarrinho()

    })

})


function atualizarCarrinho(){

    divCarrinho.innerHTML = ""

    let total = 0

    carrinho.forEach((item, index) => {

        total += item.preco * item.quantidade

        divCarrinho.innerHTML += `

            <div class="item-carrinho mb-3">

                <h6>
                    ${item.nome}
                </h6>

                <p>
                    R$ ${item.preco.toFixed(2)}
                </p>

                <div class="d-flex align-items-center gap-2">

                    <button
                    class="btn btn-sm btn-secondary"
                    onclick="diminuirQuantidade(${index})">

                        -

                    </button>

                    <span>

                        ${item.quantidade}

                    </span>

                    <button
                    class="btn btn-sm btn-secondary"
                    onclick="aumentarQuantidade(${index})">

                        +

                    </button>

                    <button
                    class="btn btn-sm btn-danger"
                    onclick="removerProduto(${index})">

                        Remover

                    </button>

                </div>

            </div>

            <hr>

        `
    })

    if(carrinho.length === 0){

        divCarrinho.innerHTML = `

            <p>
                Seu carrinho está vazio.
            </p>

        `
    }

    totalCarrinho.innerHTML =

    `Total: R$ ${total.toFixed(2)}`

}


function removerProduto(index){

    carrinho.splice(index, 1)

    atualizarCarrinho()

}


function aumentarQuantidade(index){

    carrinho[index].quantidade++

    atualizarCarrinho()

}


function diminuirQuantidade(index){

    if(carrinho[index].quantidade > 1){

        carrinho[index].quantidade--

    }else{

        removerProduto(index)
    }

    atualizarCarrinho()

}


function removerAcentos(texto){

    return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

}


pesquisaProduto.addEventListener("keyup", () => {

    let textoPesquisa =

    pesquisaProduto.value
    .toLowerCase()
    .trim()


    textoPesquisa = textoPesquisa
    .replace("camisas", "camisa")
    .replace("bonés", "bone")
    .replace("bones", "bone")
    .replace("chuteiras", "chuteira")
    .replace("acessórios", "acessorio")
    .replace("acessorios", "acessorio")


    textoPesquisa =
    removerAcentos(textoPesquisa)

    produtos.forEach(produto => {

        const nomeProduto =

        removerAcentos(

            produto.innerText
            .toLowerCase()

        )

        if(nomeProduto.includes(textoPesquisa)){

            produto.style.display = "block"

        }else{

            produto.style.display = "none"
        }

    })

})


filtroCategoria.addEventListener("change", () => {

    const categoriaSelecionada =

    filtroCategoria.value
    .toLowerCase()

    produtos.forEach(produto => {

        if(categoriaSelecionada ===
        "todas as categorias"){

            produto.style.display = "block"

        }else if(

            produto.classList.contains(
            categoriaSelecionada)

        ){

            produto.style.display = "block"

        }else{

            produto.style.display = "none"
        }

    })

})


paypal.Buttons({

    createOrder: function(data, actions){

        let total = 0

        carrinho.forEach(item => {

            total += item.preco * item.quantidade

        })

        if(total <= 0){

    alert(
        "Adicione produtos ao carrinho."
    )

    return
}

return actions.order.create({

    purchase_units: [{

        amount: {

            value: total.toFixed(2)

        }

    }]

})

    },

    onApprove: function(data, actions){

        return actions.order.capture().then(function(details){

            alert(

    "Pagamento realizado com sucesso por " +

    details.payer.name.given_name

)

carrinho = []

atualizarCarrinho()

        })

    },

    onCancel: function(){

        alert(
            "Pagamento cancelado."
        )

    },

    onError: function(){

        alert(
            "Ocorreu um erro no pagamento."
        )

    }

}).render("#paypal-button-container")