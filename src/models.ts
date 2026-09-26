export interface ProdutoRenderizavel {
  readonly id: number;
  nome: string;
  calcularPrecoFinal(): number;
  gerarHTML(): string;
}

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

export abstract class Produto implements ProdutoRenderizavel {
  readonly id: number;
  nome: string;
  precoBase: number;
  imagemUrl: string;

  constructor(
    id: number,
    nome: string,
    precoBase: number,
    imagemUrl: string = ''
  ) {
    this.id = id;
    this.nome = nome;
    this.precoBase = precoBase;
    this.imagemUrl = imagemUrl || 'https://via.placeholder.com/150';
  }

  abstract calcularPrecoFinal(): number;
  abstract gerarHTML(): string;
}

export class Bebida extends Produto {
  private comGelo: boolean;

  constructor(
    id: number,
    nome: string,
    precoBase: number,
    imagemUrl: string,
    comGelo: boolean = false
  ) {
    super(id, nome, precoBase, imagemUrl);
    this.comGelo = comGelo;
  }

  calcularPrecoFinal(): number {
    return this.comGelo ? this.precoBase + 1 : this.precoBase;
  }

  gerarHTML(): string {
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

  get temGelo(): boolean {
    return this.comGelo;
  }
}

export class Lanche extends Produto {
  private tamanho: 'P' | 'M' | 'G';

  constructor(
    id: number,
    nome: string,
    precoBase: number,
    imagemUrl: string,
    tamanho: 'P' | 'M' | 'G' = 'M'
  ) {
    super(id, nome, precoBase, imagemUrl);
    this.tamanho = tamanho;
  }

  calcularPrecoFinal(): number {
    if (this.tamanho === 'G') return this.precoBase + 5;
    if (this.tamanho === 'P') return Math.max(0, this.precoBase - 2);
    return this.precoBase;
  }

  gerarHTML(): string {
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

  get obterTamanho(): 'P' | 'M' | 'G' {
    return this.tamanho;
  }
}

export class Cardapio {
  private produtos: Produto[] = [];

  definirProdutos(produtos: Produto[]): void {
    this.produtos = [...produtos];
  }

  adicionar(produto: Produto): void {
    this.produtos.push(produto);
  }

  remover(id: number): void {
    this.produtos = this.produtos.filter((produto) => produto.id !== id);
  }

  buscarPorId(id: number): Produto | undefined {
    return this.produtos.find((produto) => produto.id === id);
  }

  get listarProdutos(): readonly Produto[] {
    return [...this.produtos];
  }

  get quantidade(): number {
    return this.produtos.length;
  }
}

export class Carrinho {
  private readonly itens: ItemCarrinho[] = [];

  adicionarItem(produto: Produto): void {
    const itemExistente = this.itens.find(
      (item) =>
        item.produto.id === produto.id &&
        item.produto.calcularPrecoFinal() === produto.calcularPrecoFinal()
    );

    if (itemExistente) {
      itemExistente.quantidade += 1;
    } else {
      this.itens.push({ produto, quantidade: 1 });
    }
  }

  alterarQuantidade(indice: number, delta: number): void {
    const item = this.itens[indice];

    if (item) {
      item.quantidade += delta;

      if (item.quantidade <= 0) {
        this.removerItem(indice);
      }
    }
  }

  removerItem(indice: number): void {
    if (indice >= 0 && indice < this.itens.length) {
      this.itens.splice(indice, 1);
    }
  }

  get total(): number {
    return this.itens.reduce(
      (soma, item) =>
        soma + item.produto.calcularPrecoFinal() * item.quantidade,
      0
    );
  }

  get totalItens(): number {
    return this.itens.reduce((soma, item) => soma + item.quantidade, 0);
  }

  get obterItens(): readonly ItemCarrinho[] {
    return [...this.itens];
  }

  limpar(): void {
    this.itens.length = 0;
  }
}

export class Venda {
  private readonly produtos: Produto[] = [];
  private fechada: boolean = false;
  private static faturamentoTotal: number = 0;

  adicionar(produto: Produto): void {
    if (this.fechada) {
      throw new Error(
        'Não é possível adicionar produtos a uma venda finalizada.'
      );
    }

    this.produtos.push(produto);
  }

  get total(): number {
    return this.produtos.reduce(
      (soma, produto) => soma + produto.calcularPrecoFinal(),
      0
    );
  }

  get obterProdutos(): readonly Produto[] {
    return [...this.produtos];
  }

  finalizar(): void {
    if (this.fechada) {
      throw new Error('Esta venda já foi finalizada.');
    }

    Venda.faturamentoTotal += this.total;
    this.fechada = true;
  }

  static get faturamento(): number {
    return Venda.faturamentoTotal;
  }

  static carregarFaturamento(valor: number): void {
    Venda.faturamentoTotal = valor;
  }
}
