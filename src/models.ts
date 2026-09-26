// ======================================================
// 1. INTERFACES
// ======================================================

export interface ProdutoRenderizavel {
  readonly id: number;
  nome: string;

  calcularPrecoFinal(): number;
  gerarHTML(): string;
}

// Interface auxiliar para os itens do carrinho
export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

// ======================================================
// 2. CLASSE BASE ABSTRATA
// ======================================================

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

// ======================================================
// 3. ESPECIALIZAÇÃO: BEBIDA
// ======================================================

export class Bebida extends Produto {
  private gelada: boolean;

  constructor(
    id: number,
    nome: string,
    precoBase: number,
    imagemUrl: string,
    gelada: boolean = true
  ) {
    super(id, nome, precoBase, imagemUrl);

    this.gelada = gelada;
  }

  calcularPrecoFinal(): number {
    return this.gelada ? this.precoBase * 1.1 : this.precoBase;
  }

  gerarHTML(): string {
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
  get estaGelada(): boolean {
    return this.gelada;
  }
}

// ======================================================
// 4. ESPECIALIZAÇÃO: LANCHE
// ======================================================

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
    if (this.tamanho === 'G') {
      return this.precoBase + 5.0;
    }

    if (this.tamanho === 'P') {
      return Math.max(0, this.precoBase - 2.0);
    }

    return this.precoBase;
  }

  gerarHTML(): string {
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
  get obterTamanho(): 'P' | 'M' | 'G' {
    return this.tamanho;
  }
}

// ======================================================
// 5. CARRINHO
// ======================================================

export class Carrinho {
  private readonly itens: ItemCarrinho[] = [];

  adicionarItem(produto: Produto): void {
    const itemExistente = this.itens.find((i) => i.produto.id === produto.id);

    if (itemExistente) {
      itemExistente.quantidade += 1;
    } else {
      this.itens.push({
        produto,
        quantidade: 1,
      });
    }
  }

  alterarQuantidade(idProduto: number, delta: number): void {
    const item = this.itens.find((i) => i.produto.id === idProduto);

    if (item) {
      item.quantidade += delta;

      if (item.quantidade <= 0) {
        this.removerItem(idProduto);
      }
    }
  }

  removerItem(idProduto: number): void {
    const index = this.itens.findIndex((i) => i.produto.id === idProduto);

    if (index !== -1) {
      this.itens.splice(index, 1);
    }
  }

  get total(): number {
    return this.itens.reduce(
      (acc, item) => acc + item.produto.calcularPrecoFinal() * item.quantidade,

      0
    );
  }

  get totalItens(): number {
    return this.itens.reduce(
      (acc, item) => acc + item.quantidade,

      0
    );
  }

  // Retorna uma cópia da lista
  // para proteger o array original.
  get obterItens(): readonly ItemCarrinho[] {
    return [...this.itens];
  }

  limpar(): void {
    this.itens.length = 0;
  }
}

// ======================================================
// 6. VENDA
// ======================================================

export class Venda {
  // Produtos pertencentes à venda.
  // O array não pode ser acessado diretamente de fora.
  private readonly produtos: Produto[] = [];

  // Controla se a venda já foi finalizada.
  private fechada: boolean = false;

  // Compartilhado por todas as vendas.
  // Só aumenta quando finalizar() for executado.
  private static faturamentoTotal: number = 0;

  // ====================================================
  // ADICIONAR PRODUTO
  // ====================================================

  adicionar(produto: Produto): void {
    if (this.fechada) {
      throw new Error(
        'Não é possível adicionar produtos a uma venda finalizada.'
      );
    }

    this.produtos.push(produto);
  }

  // ====================================================
  // TOTAL DA VENDA
  // ====================================================

  get total(): number {
    return this.produtos.reduce(
      (soma, produto) => soma + produto.calcularPrecoFinal(),

      0
    );
  }

  // ====================================================
  // CONSULTAR PRODUTOS
  // ====================================================

  get obterProdutos(): readonly Produto[] {
    // Retornamos uma cópia.
    // O array privado original continua protegido.
    return [...this.produtos];
  }

  // ====================================================
  // FINALIZAR VENDA
  // ====================================================

  finalizar(): void {
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

  static get faturamento(): number {
    return Venda.faturamentoTotal;
  }
}
