export class Produto {
    constructor(id, nome, precoBase, imagemUrl = '') {
        this.id = id;
        this.nome = nome;
        this.precoBase = precoBase;
        this.imagemUrl = imagemUrl || 'https://via.placeholder.com/150';
    }
}
export class Bebida extends Produto {
    constructor(id, nome, precoBase, imagemUrl, comGelo = false) {
        super(id, nome, precoBase, imagemUrl);
        this.comGelo = comGelo;
    }
    calcularPrecoFinal() {
        return this.comGelo ? this.precoBase + 1 : this.precoBase;
    }
    gerarHTML() {
        return `
      <div class="card-produto bebida">
        <img src="${this.imagemUrl}" alt="${this.nome}" class="img-produto" />
        <h3>🥤 ${this.nome}</h3>

        <p class="preco">A partir de R$ ${this.precoBase.toFixed(2)}</p>

        <label for="gelo-${this.id}">Gelo:</label>
        <select id="gelo-${this.id}" class="opcao-produto">
          <option value="false">Sem gelo</option>
          <option value="true">Com gelo (+ R$ 1,00)</option>
        </select>

        <button onclick="adicionarBebidaAoCarrinho(${this.id})">
          Adicionar ao Carrinho
        </button>
      </div>
    `;
    }
    get temGelo() {
        return this.comGelo;
    }
}
export class Lanche extends Produto {
    constructor(id, nome, precoBase, imagemUrl, tamanho = 'M') {
        super(id, nome, precoBase, imagemUrl);
        this.tamanho = tamanho;
    }
    calcularPrecoFinal() {
        if (this.tamanho === 'G')
            return this.precoBase + 5;
        if (this.tamanho === 'P')
            return Math.max(0, this.precoBase - 2);
        return this.precoBase;
    }
    gerarHTML() {
        return `
      <div class="card-produto lanche">
        <img src="${this.imagemUrl}" alt="${this.nome}" class="img-produto" />
        <h3>🍔 ${this.nome}</h3>

        <p class="preco">A partir de R$ ${Math.max(0, this.precoBase - 2).toFixed(2)}</p>

        <label for="tamanho-${this.id}">Tamanho:</label>
        <select id="tamanho-${this.id}" class="opcao-produto">
          <option value="P">P (- R$ 2,00)</option>
          <option value="M" selected>M (preço base)</option>
          <option value="G">G (+ R$ 5,00)</option>
        </select>

        <button onclick="adicionarLancheAoCarrinho(${this.id})">
          Adicionar ao Carrinho
        </button>
      </div>
    `;
    }
    get obterTamanho() {
        return this.tamanho;
    }
}
export class Cardapio {
    constructor() {
        this.produtos = [];
    }
    definirProdutos(produtos) {
        this.produtos = [...produtos];
    }
    adicionar(produto) {
        this.produtos.push(produto);
    }
    remover(id) {
        this.produtos = this.produtos.filter((produto) => produto.id !== id);
    }
    buscarPorId(id) {
        return this.produtos.find((produto) => produto.id === id);
    }
    get listarProdutos() {
        return [...this.produtos];
    }
    get quantidade() {
        return this.produtos.length;
    }
}
export class Carrinho {
    constructor() {
        this.itens = [];
    }
    adicionarItem(produto) {
        const itemExistente = this.itens.find((item) => item.produto.id === produto.id &&
            item.produto.calcularPrecoFinal() === produto.calcularPrecoFinal());
        if (itemExistente) {
            itemExistente.quantidade += 1;
        }
        else {
            this.itens.push({ produto, quantidade: 1 });
        }
    }
    alterarQuantidade(indice, delta) {
        const item = this.itens[indice];
        if (item) {
            item.quantidade += delta;
            if (item.quantidade <= 0) {
                this.removerItem(indice);
            }
        }
    }
    removerItem(indice) {
        if (indice >= 0 && indice < this.itens.length) {
            this.itens.splice(indice, 1);
        }
    }
    get total() {
        return this.itens.reduce((soma, item) => soma + item.produto.calcularPrecoFinal() * item.quantidade, 0);
    }
    get totalItens() {
        return this.itens.reduce((soma, item) => soma + item.quantidade, 0);
    }
    get obterItens() {
        return [...this.itens];
    }
    limpar() {
        this.itens.length = 0;
    }
}
export class Venda {
    constructor() {
        this.produtos = [];
        this.fechada = false;
    }
    adicionar(produto) {
        if (this.fechada) {
            throw new Error('Não é possível adicionar produtos a uma venda finalizada.');
        }
        this.produtos.push(produto);
    }
    get total() {
        return this.produtos.reduce((soma, produto) => soma + produto.calcularPrecoFinal(), 0);
    }
    get obterProdutos() {
        return [...this.produtos];
    }
    finalizar() {
        if (this.fechada) {
            throw new Error('Esta venda já foi finalizada.');
        }
        Venda.faturamentoTotal += this.total;
        this.fechada = true;
    }
    static get faturamento() {
        return Venda.faturamentoTotal;
    }
    static carregarFaturamento(valor) {
        Venda.faturamentoTotal = valor;
    }
}
Venda.faturamentoTotal = 0;
