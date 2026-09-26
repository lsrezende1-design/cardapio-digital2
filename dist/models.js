// ======================================================
// 1. INTERFACES
// ======================================================
// ======================================================
// 2. CLASSE BASE ABSTRATA
// ======================================================
export class Produto {
    constructor(id, nome, precoBase, imagemUrl = '') {
        this.id = id;
        this.nome = nome;
        this.precoBase = precoBase;
        this.imagemUrl = imagemUrl || 'https://via.placeholder.com/150';
    }
}
// ======================================================
// 3. ESPECIALIZAÇÃO: BEBIDA
// ======================================================
export class Bebida extends Produto {
    constructor(id, nome, precoBase, imagemUrl, gelada = true) {
        super(id, nome, precoBase, imagemUrl);
        this.gelada = gelada;
    }
    calcularPrecoFinal() {
        return this.gelada ? this.precoBase * 1.1 : this.precoBase;
    }
    gerarHTML() {
        const tempInfo = this.gelada ? '🧊 Gelada' : '☕ Quente/Ambiente';
        return `
      <div class="card-produto bebida">

        <img
          src="${this.imagemUrl}"
          alt="${this.nome}"
          class="img-produto"
        />

        <h3>
          🥤 ${this.nome}
        </h3>

        <p>
          <small>
            ${tempInfo}
          </small>
        </p>

        <p class="preco">
          R$ ${this.calcularPrecoFinal().toFixed(2)}
        </p>

        <button
          onclick="adicionarAoCarrinho(${this.id})"
        >
          Adicionar ao Carrinho
        </button>

      </div>
    `;
    }
    // Permite consultar se a bebida está gelada
    // sem tornar o atributo gelada público.
    get estaGelada() {
        return this.gelada;
    }
}
// ======================================================
// 4. ESPECIALIZAÇÃO: LANCHE
// ======================================================
export class Lanche extends Produto {
    constructor(id, nome, precoBase, imagemUrl, tamanho = 'M') {
        super(id, nome, precoBase, imagemUrl);
        this.tamanho = tamanho;
    }
    calcularPrecoFinal() {
        if (this.tamanho === 'G') {
            return this.precoBase + 5.0;
        }
        if (this.tamanho === 'P') {
            return Math.max(0, this.precoBase - 2.0);
        }
        return this.precoBase;
    }
    gerarHTML() {
        return `
      <div class="card-produto lanche">

        <img
          src="${this.imagemUrl}"
          alt="${this.nome}"
          class="img-produto"
        />

        <h3>
          🍔 ${this.nome} (${this.tamanho})
        </h3>

        <p class="preco">
          R$ ${this.calcularPrecoFinal().toFixed(2)}
        </p>

        <button
          onclick="adicionarAoCarrinho(${this.id})"
        >
          Adicionar ao Carrinho
        </button>

      </div>
    `;
    }
    // Permite consultar o tamanho
    // mantendo tamanho como private.
    get obterTamanho() {
        return this.tamanho;
    }
}
// ======================================================
// 5. CARRINHO
// ======================================================
export class Carrinho {
    constructor() {
        this.itens = [];
    }
    adicionarItem(produto) {
        const itemExistente = this.itens.find((i) => i.produto.id === produto.id);
        if (itemExistente) {
            itemExistente.quantidade += 1;
        }
        else {
            this.itens.push({
                produto,
                quantidade: 1,
            });
        }
    }
    alterarQuantidade(idProduto, delta) {
        const item = this.itens.find((i) => i.produto.id === idProduto);
        if (item) {
            item.quantidade += delta;
            if (item.quantidade <= 0) {
                this.removerItem(idProduto);
            }
        }
    }
    removerItem(idProduto) {
        const index = this.itens.findIndex((i) => i.produto.id === idProduto);
        if (index !== -1) {
            this.itens.splice(index, 1);
        }
    }
    get total() {
        return this.itens.reduce((acc, item) => acc + item.produto.calcularPrecoFinal() * item.quantidade, 0);
    }
    get totalItens() {
        return this.itens.reduce((acc, item) => acc + item.quantidade, 0);
    }
    // Retorna uma cópia da lista
    // para proteger o array original.
    get obterItens() {
        return [...this.itens];
    }
    limpar() {
        this.itens.length = 0;
    }
}
// ======================================================
// 6. VENDA
// ======================================================
export class Venda {
    constructor() {
        // Produtos pertencentes à venda.
        // O array não pode ser acessado diretamente de fora.
        this.produtos = [];
        // Controla se a venda já foi finalizada.
        this.fechada = false;
    }
    // ====================================================
    // ADICIONAR PRODUTO
    // ====================================================
    adicionar(produto) {
        if (this.fechada) {
            throw new Error('Não é possível adicionar produtos a uma venda finalizada.');
        }
        this.produtos.push(produto);
    }
    // ====================================================
    // TOTAL DA VENDA
    // ====================================================
    get total() {
        return this.produtos.reduce((soma, produto) => soma + produto.calcularPrecoFinal(), 0);
    }
    // ====================================================
    // CONSULTAR PRODUTOS
    // ====================================================
    get obterProdutos() {
        // Retornamos uma cópia.
        // O array privado original continua protegido.
        return [...this.produtos];
    }
    // ====================================================
    // FINALIZAR VENDA
    // ====================================================
    finalizar() {
        if (this.fechada) {
            throw new Error('Esta venda já foi finalizada.');
        }
        // Somente aqui o faturamento aumenta.
        Venda.faturamentoTotal += this.total;
        this.fechada = true;
    }
    // ====================================================
    // FATURAMENTO ACUMULADO
    // ====================================================
    static get faturamento() {
        return Venda.faturamentoTotal;
    }
}
// Compartilhado por todas as vendas.
// Só aumenta quando finalizar() for executado.
Venda.faturamentoTotal = 0;
