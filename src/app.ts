import {
  Produto,
  Bebida,
  Lanche,
  Carrinho,
  Venda,
  Cardapio,
} from './models.js';

import { produtosIniciais } from './data/produtosIniciais.js';
import { StorageService, RegistroVenda } from './storageService.js';

const cardapio = new Cardapio();
const carrinho = new Carrinho();

let isAdminLogado = false;
let vendasPendentes: Venda[] = [];
let vendasFinalizadas: RegistroVenda[] = [];

// ======================================================
// CARREGAR PRODUTOS
// ======================================================

function carregarProdutos(): void {
  const dadosSalvos = StorageService.carregarProdutos();

  if (StorageService.temProdutosSalvos()) {
    const produtosCarregados = dadosSalvos.map((item: any) => {
      if (item.categoria === 'bebida') {
        return new Bebida(item.id, item.nome, item.precoBase, item.imagemUrl);
      }

      return new Lanche(item.id, item.nome, item.precoBase, item.imagemUrl);
    });

    cardapio.definirProdutos(produtosCarregados);
  } else {
    cardapio.definirProdutos([...produtosIniciais]);
    StorageService.salvarProdutos([...cardapio.listarProdutos]);
  }

  vendasFinalizadas = StorageService.carregarVendas();

  const faturamentoSalvo = vendasFinalizadas.reduce(
    (soma, venda) => soma + venda.total,
    0
  );

  Venda.carregarFaturamento(faturamentoSalvo);

  renderizarCardapio();
  renderizarVendasFinalizadas();
}

// ======================================================
// RENDERIZAR CARDÁPIO
// ======================================================

function renderizarCardapio(): void {
  const container = document.getElementById('cardapio-container');

  if (!container) return;

  container.innerHTML = cardapio.listarProdutos
    .map((produto) => {
      let htmlCard = produto.gerarHTML();

      if (isAdminLogado) {
        const botaoExcluir = `
          <button
            class="btn-remover-admin"
            onclick="removerDoCardapio(${produto.id})"
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
// CLIENTE ESCOLHE AS OPÇÕES
// ======================================================

(window as any).adicionarBebidaAoCarrinho = (id: number) => {
  const produtoBase = cardapio.buscarPorId(id);

  if (!(produtoBase instanceof Bebida)) return;

  const campoGelo = document.getElementById(`gelo-${id}`) as HTMLSelectElement;

  const comGelo = campoGelo.value === 'true';

  const bebidaEscolhida = new Bebida(
    produtoBase.id,
    produtoBase.nome,
    produtoBase.precoBase,
    produtoBase.imagemUrl,
    comGelo
  );

  carrinho.adicionarItem(bebidaEscolhida);
  atualizarCarrinhoHTML();
};

(window as any).adicionarLancheAoCarrinho = (id: number) => {
  const produtoBase = cardapio.buscarPorId(id);

  if (!(produtoBase instanceof Lanche)) return;

  const campoTamanho = document.getElementById(
    `tamanho-${id}`
  ) as HTMLSelectElement;

  const tamanho = campoTamanho.value as 'P' | 'M' | 'G';

  const lancheEscolhido = new Lanche(
    produtoBase.id,
    produtoBase.nome,
    produtoBase.precoBase,
    produtoBase.imagemUrl,
    tamanho
  );

  carrinho.adicionarItem(lancheEscolhido);
  atualizarCarrinhoHTML();
};

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

  if (!containerItens) return;

  if (carrinho.obterItens.length === 0) {
    containerItens.innerHTML = '<p>Seu carrinho está vazio.</p>';

    return;
  }

  containerItens.innerHTML = carrinho.obterItens
    .map((item, index) => {
      let detalhe = '';

      if (item.produto instanceof Lanche) {
        detalhe = `Tamanho ${item.produto.obterTamanho}`;
      }

      if (item.produto instanceof Bebida) {
        detalhe = item.produto.temGelo ? 'Com gelo' : 'Sem gelo';
      }

      return `
        <div class="item-carrinho">
          <div>
            <strong>${item.produto.nome}</strong>
            <br>
            <small>${detalhe}</small>
            <br>
            <small>
              R$ ${item.produto.calcularPrecoFinal().toFixed(2)} un.
            </small>
          </div>

          <div class="controles">
            <button onclick="alterarQtd(${index}, -1)">
              -
            </button>

            <span>${item.quantidade}</span>

            <button onclick="alterarQtd(${index}, 1)">
              +
            </button>

            <button
              class="btn-remover"
              onclick="removerItemCarrinho(${index})"
            >
              x
            </button>
          </div>
        </div>
      `;
    })
    .join('');
}

// ======================================================
// FUNÇÕES DO CARRINHO
// ======================================================

(window as any).alterarQtd = (indice: number, delta: number) => {
  carrinho.alterarQuantidade(indice, delta);
  atualizarCarrinhoHTML();
};

(window as any).removerItemCarrinho = (indice: number) => {
  carrinho.removerItem(indice);
  atualizarCarrinhoHTML();
};

// ======================================================
// REMOVER PRODUTO DO CARDÁPIO
// ======================================================

(window as any).removerDoCardapio = (id: number) => {
  cardapio.remover(id);

  StorageService.salvarProdutos([...cardapio.listarProdutos]);
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

      btnAbrirLogin.innerText = 'Área do Gestor / Login';

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
      renderizarVendasFinalizadas();
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

    const mensagem = document.getElementById(
      'mensagem-produto'
    ) as HTMLParagraphElement;

    try {
      mensagem.innerText = '';

      const nome = (
        document.getElementById('novo-nome') as HTMLInputElement
      ).value.trim();

      const campoPreco = document.getElementById(
        'novo-preco'
      ) as HTMLInputElement;

      const preco = parseFloat(campoPreco.value.replace(',', '.'));

      if (!nome) {
        throw new Error('Digite o nome do produto.');
      }

      if (isNaN(preco) || preco <= 0) {
        throw new Error('Digite um preço válido. Exemplo: 18,50');
      }

      const tipo = (document.getElementById('novo-tipo') as HTMLSelectElement)
        .value;

      const imagem = (
        document.getElementById('novo-imagem') as HTMLInputElement
      ).value;

      const novoId =
        cardapio.quantidade > 0
          ? Math.max(...cardapio.listarProdutos.map((produto) => produto.id)) +
            1
          : 1;

      let novoProduto: Produto;

      if (tipo === 'bebida') {
        novoProduto = new Bebida(novoId, nome, preco, imagem);
      } else {
        novoProduto = new Lanche(novoId, nome, preco, imagem);
      }

      cardapio.adicionar(novoProduto);

      StorageService.salvarProdutos([...cardapio.listarProdutos]);
      renderizarCardapio();

      formNovoProduto.reset();

      mensagem.innerText = 'Produto cadastrado com sucesso!';
    } catch (erro) {
      if (erro instanceof Error) {
        mensagem.innerText = erro.message;
      }
    }
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

    const venda = new Venda();

    carrinho.obterItens.forEach((item) => {
      for (let i = 0; i < item.quantidade; i++) {
        venda.adicionar(item.produto);
      }
    });

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
      const itensHTML = venda.obterProdutos
        .map((produto) => {
          let detalhe = '';

          if (produto instanceof Lanche) {
            detalhe = ` - Tamanho ${produto.obterTamanho}`;
          }

          if (produto instanceof Bebida) {
            detalhe = produto.temGelo ? ' - Com gelo' : ' - Sem gelo';
          }

          return `
            <p>
              ${produto.nome}${detalhe}
              -
              R$ ${produto.calcularPrecoFinal().toFixed(2)}
            </p>
          `;
        })
        .join('');

      return `
        <div class="venda-pendente">
          <h4>Pedido ${index + 1}</h4>

          ${itensHTML}

          <p>
            <strong>
              Total:
              R$ ${venda.total.toFixed(2)}
            </strong>
          </p>

          <button onclick="finalizarVenda(${index})">
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
  if (!isAdminLogado) {
    alert('Apenas o administrador pode finalizar uma venda.');

    return;
  }

  const venda = vendasPendentes[index];

  if (!venda) return;

  venda.finalizar();

  const itensVenda = venda.obterProdutos.map((produto) => {
    let detalhe = '';

    if (produto instanceof Lanche) {
      detalhe = `Tamanho ${produto.obterTamanho}`;
    }

    if (produto instanceof Bebida) {
      detalhe = produto.temGelo ? 'Com gelo' : 'Sem gelo';
    }

    return {
      nome: produto.nome,
      detalhe,
      preco: produto.calcularPrecoFinal(),
    };
  });

  const novoRegistro: RegistroVenda = {
    id:
      vendasFinalizadas.length > 0
        ? Math.max(...vendasFinalizadas.map((registro) => registro.id)) + 1
        : 1,
    data: new Date().toLocaleString('pt-BR'),
    itens: itensVenda,
    total: venda.total,
  };

  vendasFinalizadas.push(novoRegistro);

  StorageService.salvarVendas(vendasFinalizadas);

  vendasPendentes.splice(index, 1);

  atualizarFaturamento();
  renderizarVendasPendentes();
  renderizarVendasFinalizadas();

  alert('Venda finalizada com sucesso!');
};

// ======================================================
// RENDERIZAR VENDAS FINALIZADAS
// ======================================================

function renderizarVendasFinalizadas(): void {
  const container = document.getElementById('vendas-finalizadas');

  if (!container) return;

  if (vendasFinalizadas.length === 0) {
    container.innerHTML = '<p>Nenhuma venda finalizada.</p>';

    return;
  }

  container.innerHTML = vendasFinalizadas
    .map((venda) => {
      const itensHTML = venda.itens
        .map(
          (item) => `
            <p>
              ${item.nome}
              ${item.detalhe ? ` - ${item.detalhe}` : ''}
              -
              R$ ${item.preco.toFixed(2)}
            </p>
          `
        )
        .join('');

      return `
        <div class="venda-pendente">
          <h4>Venda ${venda.id}</h4>
          <small>${venda.data}</small>

          ${itensHTML}

          <p>
            <strong>
              Total:
              R$ ${venda.total.toFixed(2)}
            </strong>
          </p>
        </div>
      `;
    })
    .join('');
}

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
