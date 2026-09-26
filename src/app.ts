import { Produto, Bebida, Lanche, Carrinho, Venda } from './models.js';
import { produtosIniciais } from './data/produtosIniciais.js';
import { StorageService } from './storageService.js';

let cardapio: Produto[] = [];
const carrinho = new Carrinho();

let isAdminLogado = false;

// Guarda as vendas que ainda precisam ser aprovadas pelo administrador
let vendasPendentes: Venda[] = [];

// ======================================================
// CARREGAR PRODUTOS
// ======================================================

function carregarProdutos(): void {
  const dadosSalvos = StorageService.carregarProdutos();

  if (dadosSalvos.length > 0) {
    cardapio = dadosSalvos.map((item: any) => {
      if (item.categoria === 'bebida') {
        return new Bebida(
          item.id,
          item.nome,
          item.precoBase,
          item.imagemUrl,
          item.gelada
        );
      }

      return new Lanche(
        item.id,
        item.nome,
        item.precoBase,
        item.imagemUrl,
        item.tamanho
      );
    });
  } else {
    cardapio = [...produtosIniciais];

    StorageService.salvarProdutos(cardapio);
  }

  renderizarCardapio();
}

// ======================================================
// RENDERIZAR CARDÁPIO
// ======================================================

function renderizarCardapio(): void {
  const container = document.getElementById('cardapio-container');

  if (!container) return;

  container.innerHTML = cardapio
    .map((p) => {
      let htmlCard = p.gerarHTML();

      if (isAdminLogado) {
        const botaoExcluir = `
          <button
            class="btn-remover-admin"
            onclick="removerDoCardapio(${p.id})"
          >
            🗑️ Excluir
          </button>
        `;

        htmlCard = htmlCard.replace('</div>', `${botaoExcluir}</div>`);
      }

      return htmlCard;
    })
    .join('');
}

// ======================================================
// ATUALIZAR CARRINHO
// ======================================================

function atualizarCarrinhoHTML(): void {
  const badge = document.getElementById('cart-badge');

  const containerItens = document.getElementById('itens-carrinho');

  const elemTotal = document.getElementById('total-carrinho');

  if (badge) {
    badge.innerText = carrinho.totalItens.toString();
  }

  if (elemTotal) {
    elemTotal.innerText = `R$ ${carrinho.total.toFixed(2)}`;
  }

  if (containerItens) {
    if (carrinho.obterItens.length === 0) {
      containerItens.innerHTML = '<p>Seu carrinho está vazio.</p>';
    } else {
      containerItens.innerHTML = carrinho.obterItens
        .map(
          (item) => `

              <div class="item-carrinho">

                <div>

                  <strong>
                    ${item.produto.nome}
                  </strong>

                  <br>

                  <small>
                    R$ ${item.produto.calcularPrecoFinal().toFixed(2)} un.
                  </small>

                </div>

                <div class="controles">

                  <button
                    onclick="alterarQtd(${item.produto.id}, -1)"
                  >
                    -
                  </button>

                  <span>
                    ${item.quantidade}
                  </span>

                  <button
                    onclick="alterarQtd(${item.produto.id}, 1)"
                  >
                    +
                  </button>

                  <button
                    class="btn-remover"
                    onclick="removerItemCarrinho(${item.produto.id})"
                  >
                    x
                  </button>

                </div>

              </div>

            `
        )
        .join('');
    }
  }
}

// ======================================================
// FUNÇÕES DO CARRINHO
// ======================================================

(window as any).adicionarAoCarrinho = (id: number) => {
  const produto = cardapio.find((p) => p.id === id);

  if (produto) {
    carrinho.adicionarItem(produto);

    atualizarCarrinhoHTML();
  }
};

(window as any).alterarQtd = (id: number, delta: number) => {
  carrinho.alterarQuantidade(id, delta);

  atualizarCarrinhoHTML();
};

(window as any).removerItemCarrinho = (id: number) => {
  carrinho.removerItem(id);

  atualizarCarrinhoHTML();
};

// ======================================================
// REMOVER PRODUTO DO CARDÁPIO
// ======================================================

(window as any).removerDoCardapio = (id: number) => {
  cardapio = cardapio.filter((p) => p.id !== id);

  StorageService.salvarProdutos(cardapio);

  renderizarCardapio();
};

// ======================================================
// LOGIN E PAINEL ADMINISTRATIVO
// ======================================================

function configurarModalLogin(): void {
  const btnAbrirLogin = document.getElementById('btn-abrir-login');

  const modalLogin = document.getElementById('modal-login');

  const btnFechar = document.getElementById('fechar-login');

  const formLogin = document.getElementById('form-login') as HTMLFormElement;

  btnAbrirLogin?.addEventListener('click', () => {
    if (isAdminLogado) {
      isAdminLogado = false;

      document.getElementById('painel-admin')?.classList.add('oculto');

      btnAbrirLogin.innerText = 'Área do Cliente / Login';

      renderizarCardapio();

      alert('Você saiu do modo administrador.');
    } else {
      modalLogin?.classList.add('ativo');
    }
  });

  btnFechar?.addEventListener('click', () => {
    modalLogin?.classList.remove('ativo');
  });

  formLogin?.addEventListener('submit', (e) => {
    e.preventDefault();

    const usuario = (
      document.getElementById('login-usuario') as HTMLInputElement
    ).value;

    const senha = (document.getElementById('login-senha') as HTMLInputElement)
      .value;

    if (usuario === 'admin' && senha === 'admin') {
      isAdminLogado = true;

      modalLogin?.classList.remove('ativo');

      document.getElementById('painel-admin')?.classList.remove('oculto');

      if (btnAbrirLogin) {
        btnAbrirLogin.innerText = 'Sair do Modo Admin';
      }

      renderizarCardapio();

      renderizarVendasPendentes();

      atualizarFaturamento();

      alert('Login realizado com sucesso!');
    } else {
      alert('Usuário ou senha incorretos.');
    }
  });

  // ====================================================
  // CADASTRO DE NOVO PRODUTO
  // ====================================================

  const formNovoProduto = document.getElementById(
    'form-novo-produto'
  ) as HTMLFormElement;

  formNovoProduto?.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = (document.getElementById('novo-nome') as HTMLInputElement)
      .value;

    const preco = parseFloat(
      (document.getElementById('novo-preco') as HTMLInputElement).value
    );

    const tipo = (document.getElementById('novo-tipo') as HTMLSelectElement)
      .value;

    const imagem = (document.getElementById('novo-imagem') as HTMLInputElement)
      .value;

    const novoId =
      cardapio.length > 0 ? Math.max(...cardapio.map((p) => p.id)) + 1 : 1;

    let novoProduto: Produto;

    if (tipo === 'bebida') {
      novoProduto = new Bebida(novoId, nome, preco, imagem, true);
    } else {
      novoProduto = new Lanche(novoId, nome, preco, imagem, 'M');
    }

    cardapio.push(novoProduto);

    StorageService.salvarProdutos(cardapio);

    renderizarCardapio();

    formNovoProduto.reset();
  });
}

// ======================================================
// ENVIAR PEDIDO PARA APROVAÇÃO
// ======================================================

function configurarEnvioPedido(): void {
  const btnEnviar = document.getElementById('btn-encerrar-pedido');

  btnEnviar?.addEventListener('click', () => {
    if (carrinho.obterItens.length === 0) {
      alert('Adicione pelo menos um item ao carrinho!');

      return;
    }

    // Cria uma nova venda
    const venda = new Venda();

    // Transfere os produtos do carrinho
    // para a venda.
    carrinho.obterItens.forEach((item) => {
      for (let i = 0; i < item.quantidade; i++) {
        venda.adicionar(item.produto);
      }
    });

    // A venda ainda NÃO é finalizada.
    // Ela fica aguardando o administrador.
    vendasPendentes.push(venda);

    carrinho.limpar();

    atualizarCarrinhoHTML();

    renderizarVendasPendentes();

    document.getElementById('modal-carrinho')?.classList.remove('ativo');

    alert('Pedido enviado com sucesso! Aguardando aprovação.');
  });
}

// ======================================================
// RENDERIZAR VENDAS PENDENTES
// ======================================================

function renderizarVendasPendentes(): void {
  const container = document.getElementById('vendas-pendentes');

  if (!container) return;

  if (vendasPendentes.length === 0) {
    container.innerHTML = '<p>Nenhum pedido pendente.</p>';

    return;
  }

  container.innerHTML = vendasPendentes
    .map((venda, index) => {
      // Agrupa produtos iguais
      const quantidades = new Map<
        number,
        {
          produto: Produto;
          quantidade: number;
        }
      >();

      venda.obterProdutos.forEach((produto) => {
        const existente = quantidades.get(produto.id);

        if (existente) {
          existente.quantidade++;
        } else {
          quantidades.set(produto.id, {
            produto,
            quantidade: 1,
          });
        }
      });

      const itensHTML = Array.from(quantidades.values())
        .map(
          (item) => `

                  <p>
                    ${item.quantidade}x
                    ${item.produto.nome}
                    -
                    R$ ${(
                      item.produto.calcularPrecoFinal() * item.quantidade
                    ).toFixed(2)}
                  </p>

                `
        )
        .join('');

      return `

            <div class="venda-pendente">

              <h4>
                Pedido ${index + 1}
              </h4>

              ${itensHTML}

              <p>
                <strong>
                  Total:
                  R$ ${venda.total.toFixed(2)}
                </strong>
              </p>

              <button
                onclick="finalizarVenda(${index})"
              >
                Finalizar Venda
              </button>

            </div>

          `;
    })
    .join('');
}

// ======================================================
// FINALIZAR VENDA PELO ADMINISTRADOR
// ======================================================

(window as any).finalizarVenda = (index: number) => {
  // Segurança:
  // somente o administrador pode finalizar.
  if (!isAdminLogado) {
    alert('Apenas o administrador pode finalizar uma venda.');

    return;
  }

  const venda = vendasPendentes[index];

  if (!venda) return;

  // Agora sim a venda é finalizada.
  venda.finalizar();

  // Remove a venda da lista de pendentes.
  vendasPendentes.splice(index, 1);

  atualizarFaturamento();

  renderizarVendasPendentes();

  alert('Venda finalizada com sucesso!');
};

// ======================================================
// ATUALIZAR FATURAMENTO
// ======================================================

function atualizarFaturamento(): void {
  const elemFaturamento = document.getElementById('faturamento-acumulado');

  if (elemFaturamento) {
    elemFaturamento.innerText = `R$ ${Venda.faturamento.toFixed(2)}`;
  }
}

// ======================================================
// INICIALIZAÇÃO
// ======================================================

document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();

  configurarModalLogin();

  configurarEnvioPedido();

  const btnCarrinho = document.getElementById('btn-acompanhar-carrinho');

  const modalCarrinho = document.getElementById('modal-carrinho');

  const fecharCarrinho = document.getElementById('fechar-carrinho');

  btnCarrinho?.addEventListener('click', () => {
    atualizarCarrinhoHTML();

    modalCarrinho?.classList.add('ativo');
  });

  fecharCarrinho?.addEventListener('click', () => {
    modalCarrinho?.classList.remove('ativo');
  });

  atualizarFaturamento();
});
