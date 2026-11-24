

/* =================================
  CONFIGURAÇÃO DO WHATSAPP
================================= */


const numeroWhatsApp = "5581995026268";




/* =================================
  PREÇOS DOS PRODUTOS
================================= */


const precosProdutos = {


   "Brigadeiros": 1.50,
   "Bolo de Pote": 6.00,
   "Mini Bolo Vulcão": 35.00,
   "Tortas de Limão": 6.00,
   "Trufas": null,
   "Copo da Felicidade": 14.00,
   "Brownie": 8.00,
   "Cookies": 5.00,
   "Cupcake": 7.00,
   "Bolo Caseiro": 20.00,
   "Mini Pudim": 9.00,
   "Beijinhos": 1.50


};




/* =================================
  OPÇÕES DOS PRODUTOS
================================= */


const opcoesProdutos = {


   "Brigadeiros": [
       "Chocolate",
       "Beijinho",
       "Ninho",
       "Ninho com Nutella",
       "Brigadeiro gourmet"
   ],


   "Bolo de Pote": [
       "Chocolate",
       "Ninho",
       "Prestígio",
       "Morango",
       "Dois amores"
   ],


   "Mini Bolo Vulcão": [
       "Chocolate",
       "Ninho",
       "Cenoura com chocolate",
       "Prestígio"
   ],


   "Tortas de Limão": [
       "Torta de limão tradicional"
   ],


   "Trufas": [
       "Chocolate",
       "Morango",
       "Maracujá",
       "Ninho",
       "Brigadeiro"
   ],


   "Copo da Felicidade": [
       "Chocolate",
       "Ninho com Nutella",
       "Morango",
       "Oreo",
       "Dois amores"
   ],


   "Brownie": [
       "Tradicional"
   ],


   "Cookies": [
       "Chocolate",
       "Tradicional"
   ],


   "Cupcake": [
       "Chocolate",
       "Baunilha"
   ],


   "Bolo Caseiro": [
       "Tradicional"
   ],


   "Mini Pudim": [
       "Tradicional"
   ],


   "Beijinhos": [
       "Tradicional"
   ]


};




/* =================================
  VARIÁVEIS
================================= */


let carrinho = [];
let produtoAtual = "";
let temporizadorAviso;




/* =================================
  FORMATAÇÃO DE PREÇO
================================= */


function formatarDinheiro(valor) {


   return Number(valor).toLocaleString("pt-BR", {
       style: "currency",
       currency: "BRL"
   });


}




/* =================================
  PROTEÇÃO DE TEXTO
================================= */


function escaparHTML(texto) {


   return String(texto).replace(/[&<>"']/g, function(caractere) {


       return {
           "&": "&amp;",
           "<": "&lt;",
           ">": "&gt;",
           '"': "&quot;",
           "'": "&#039;"
       }[caractere];


   });


}




/* =================================
  NOTIFICAÇÃO PERSONALIZADA
================================= */


function mostrarAvisoCarrinho() {


   let aviso = document.getElementById("avisoCarrinho");


   if (!aviso) {


       aviso = document.createElement("div");


       aviso.id = "avisoCarrinho";
       aviso.className = "aviso-carrinho";


       aviso.innerHTML = `
           <span class="icone-aviso">✓</span>


           <div class="texto-aviso">
               <strong>Produto adicionado!</strong>
               <small>Seu doce foi colocado no carrinho.</small>
           </div>
       `;


       document.body.appendChild(aviso);


   }


   aviso.classList.remove("visivel");


   clearTimeout(temporizadorAviso);


   requestAnimationFrame(function() {


       aviso.classList.add("visivel");


   });


   temporizadorAviso = setTimeout(function() {


       aviso.classList.remove("visivel");


   }, 2500);


}




/* =================================
  VALIDAR WHATSAPP
================================= */


function validarWhatsApp() {


   const numero = numeroWhatsApp.replace(/\D/g, "");


   if (!numero || numero.length < 12 || numero.length > 13) {


       alert("Verifique o número do WhatsApp no arquivo script.js.");


       return null;


   }


   return numero;


}




/* =================================
  ABRIR PERSONALIZAÇÃO
================================= */


function abrirPersonalizacao(produto) {


   const modal = document.getElementById("modalPedido");


   const titulo = document.getElementById("nomeProduto");


   const select = document.getElementById("saborProduto");


   produtoAtual = produto;


   titulo.innerText = produto;


   select.innerHTML = `
       <option value="">Selecione um sabor</option>
   `;


   const sabores = opcoesProdutos[produto] || ["Tradicional"];


   sabores.forEach(function(sabor) {


       const opcao = document.createElement("option");


       opcao.value = sabor;
       opcao.textContent = sabor;


       select.appendChild(opcao);


   });


   document.getElementById("quantidadeProduto").value = 1;


   document.getElementById("observacoes").value = "";


   modal.classList.add("ativo");


   modal.setAttribute("aria-hidden", "false");


   document.body.style.overflow = "hidden";


}




/* =================================
  FECHAR PERSONALIZAÇÃO
================================= */


function fecharPersonalizacao() {


   const modal = document.getElementById("modalPedido");


   modal.classList.remove("ativo");


   modal.setAttribute("aria-hidden", "true");


   document.body.style.overflow = "";


}




/* =================================
  ADICIONAR PRODUTO AO CARRINHO
================================= */


document.getElementById("formPedido").addEventListener("submit", function(event) {


   event.preventDefault();


   const produto = produtoAtual;


   const sabor = document.getElementById("saborProduto").value;


   const quantidade = Number(
       document.getElementById("quantidadeProduto").value
   );


   const observacoes = document.getElementById("observacoes").value.trim();


   const preco = precosProdutos[produto];


   if (!sabor || !Number.isInteger(quantidade) || quantidade < 1) {


       alert("Selecione um sabor e informe uma quantidade válida.");


       return;


   }


   if (preco === null || preco === undefined) {


       alert("O preço deste produto ainda precisa ser configurado. Entre em contato pelo WhatsApp.");


       return;


   }


   carrinho.push({


       produto: produto,
       sabor: sabor,
       quantidade: quantidade,
       observacoes: observacoes,
       preco: preco


   });


   atualizarCarrinho();


   fecharPersonalizacao();


   mostrarAvisoCarrinho();


});




/* =================================
  ATUALIZAR CARRINHO
================================= */


function atualizarCarrinho() {


   const lista = document.getElementById("listaCarrinho");


   const contador = document.getElementById("contadorCarrinho");


   const totalElemento = document.getElementById("totalCarrinho");


   const quantidadeTotal = carrinho.reduce(function(total, item) {


       return total + item.quantidade;


   }, 0);


   const valorTotal = carrinho.reduce(function(total, item) {


       return total + item.preco * item.quantidade;


   }, 0);


   contador.textContent = quantidadeTotal;


   totalElemento.textContent = formatarDinheiro(valorTotal);


   if (carrinho.length === 0) {


       lista.innerHTML = `
           <div class="carrinho-vazio">
               Seu carrinho está vazio.
               Escolha seus doces favoritos! ❤️
           </div>
       `;


       return;


   }


   lista.innerHTML = carrinho.map(function(item, indice) {


       return `
           <div class="item-carrinho">


               <div class="item-carrinho-info">


                   <h3>${escaparHTML(item.produto)}</h3>


                   <p>Sabor: ${escaparHTML(item.sabor)}</p>


                   <p>Quantidade: ${item.quantidade}</p>


                   <p>Valor unitário: ${formatarDinheiro(item.preco)}</p>


                   ${
                       item.observacoes
                       ? `<p>Observações: ${escaparHTML(item.observacoes)}</p>`
                       : ""
                   }


                   <strong>
                       ${formatarDinheiro(item.preco * item.quantidade)}
                   </strong>


                   <div class="item-carrinho-acoes">


                       <button
                           type="button"
                           onclick="alterarQuantidade(${indice}, -1)">
                           −
                       </button>


                       <span>${item.quantidade}</span>


                       <button
                           type="button"
                           onclick="alterarQuantidade(${indice}, 1)">
                           +
                       </button>


                       <button
                           type="button"
                           class="remover-item"
                           onclick="removerItem(${indice})">
                           Remover
                       </button>


                   </div>


               </div>


           </div>
       `;


   }).join("");


}




/* =================================
  ALTERAR QUANTIDADE
================================= */


function alterarQuantidade(indice, alteracao) {


   if (!carrinho[indice]) return;


   carrinho[indice].quantidade += alteracao;


   if (carrinho[indice].quantidade <= 0) {


       carrinho.splice(indice, 1);


   }


   atualizarCarrinho();


}




/* =================================
  REMOVER PRODUTO
================================= */


function removerItem(indice) {


   if (!carrinho[indice]) return;


   carrinho.splice(indice, 1);


   atualizarCarrinho();


}




/* =================================
  ABRIR CARRINHO
================================= */


function abrirCarrinho() {


   atualizarCarrinho();


   const modal = document.getElementById("modalCarrinho");


   modal.classList.add("ativo");


   modal.setAttribute("aria-hidden", "false");


   document.body.style.overflow = "hidden";


}




/* =================================
  FECHAR CARRINHO
================================= */


function fecharCarrinho() {


   const modal = document.getElementById("modalCarrinho");


   modal.classList.remove("ativo");


   modal.setAttribute("aria-hidden", "true");


   document.body.style.overflow = "";


}




/* =================================
  FINALIZAR PEDIDO PELO WHATSAPP
================================= */


document.getElementById("formFinalizar").addEventListener("submit", function(event) {


   event.preventDefault();


   if (carrinho.length === 0) {


       alert("Adicione pelo menos um produto ao carrinho.");


       return;


   }


   const nome = document.getElementById("nomeFinalizacao").value.trim();


   const pagamento = document.getElementById("pagamentoFinalizacao").value;


   const numero = validarWhatsApp();


   if (!nome || !pagamento || !numero) return;


   const total = carrinho.reduce(function(soma, item) {


       return soma + item.preco * item.quantidade;


   }, 0);


   let mensagem = ` *NOVO PEDIDO - AT DOCES E AFETO* 🩷\n\n`;


   mensagem += ` *Cliente:* ${nome}\n\n`;


   mensagem += ` *PRODUTOS DO PEDIDO:*\n\n`;


   carrinho.forEach(function(item, indice) {


       mensagem += `*${indice + 1}. ${item.produto}*\n`;


       mensagem += ` Sabor: ${item.sabor}\n`;


       mensagem += ` Quantidade: ${item.quantidade}\n`;


       mensagem += ` Valor unitário: ${formatarDinheiro(item.preco)}\n`;


       mensagem += `Subtotal: ${formatarDinheiro(item.preco * item.quantidade)}\n`;


       if (item.observacoes) {


           mensagem += ` Observações: ${item.observacoes}\n`;


       }


       mensagem += `\n`;


   });


   mensagem += `💵 *TOTAL: ${formatarDinheiro(total)}*\n`;


   mensagem += `💳 *Forma de pagamento:* ${pagamento}\n\n`;


   mensagem += `Aguardo a confirmação do pedido! `;


   const url =
       `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;


   window.open(url, "_blank");


   carrinho = [];


   atualizarCarrinho();


   fecharCarrinho();


   document.getElementById("formFinalizar").reset();


});




/* =================================
  FECHAR MODAIS CLICANDO FORA
================================= */


document.getElementById("modalPedido").addEventListener("click", function(event) {


   if (event.target === this) {


       fecharPersonalizacao();


   }


});




document.getElementById("modalCarrinho").addEventListener("click", function(event) {


   if (event.target === this) {


       fecharCarrinho();


   }


});




/* =================================
  FECHAR COM ESC
================================= */


document.addEventListener("keydown", function(event) {


   if (event.key === "Escape") {


       fecharPersonalizacao();


       fecharCarrinho();


   }


});




/* =================================
  BOTÃO GERAL DO WHATSAPP
================================= */


function pedirGeral() {


   const numero = validarWhatsApp();


   if (!numero) return;


   const mensagem =
       "Olá! Gostaria de fazer uma encomenda na AT Doces e Afeto.";


   const url =
       `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;


   window.open(url, "_blank");


}




/* =================================
  BOTÃO VER MAIS PRODUTOS
================================= */


function alternarProdutos() {


   const produtosExtras = document.querySelectorAll(".produto-extra");


   const botao = document.getElementById("btnVerMais");


   const vaiMostrar =
       botao.getAttribute("aria-expanded") !== "true";


   produtosExtras.forEach(function(produto) {


       produto.hidden = !vaiMostrar;


   });


   botao.setAttribute("aria-expanded", String(vaiMostrar));


   botao.textContent = vaiMostrar
       ? "Ver menos produtos"
       : "Ver mais produtos";


}




/* =================================
  INICIALIZAÇÃO
================================= */


atualizarCarrinho();



