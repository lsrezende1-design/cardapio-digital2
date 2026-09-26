import { Produto, Bebida, Lanche } from './models.js';

export interface RegistroVenda {
  id: number;
  data: string;
  itens: {
    nome: string;
    detalhe: string;
    preco: number;
  }[];
  total: number;
}

export class StorageService {
  private static readonly CHAVE_PRODUTOS = 'cardapioProdutos';
  private static readonly CHAVE_VENDAS = 'vendasFinalizadas';

  static salvarProdutos(produtos: Produto[]): void {
    const produtosParaSalvar = produtos.map((produto) => {
      if (produto instanceof Bebida) {
        return {
          id: produto.id,
          nome: produto.nome,
          precoBase: produto.precoBase,
          imagemUrl: produto.imagemUrl,
          categoria: 'bebida'
        };
      }

      if (produto instanceof Lanche) {
        return {
          id: produto.id,
          nome: produto.nome,
          precoBase: produto.precoBase,
          imagemUrl: produto.imagemUrl,
          categoria: 'lanche'
        };
      }

      return {
        id: produto.id,
        nome: produto.nome,
        precoBase: produto.precoBase,
        imagemUrl: produto.imagemUrl
      };
    });

    localStorage.setItem(
      StorageService.CHAVE_PRODUTOS,
      JSON.stringify(produtosParaSalvar)
    );
  }

  static carregarProdutos(): any[] {
    const dados = localStorage.getItem(
      StorageService.CHAVE_PRODUTOS
    );

    if (!dados) return [];

    try {
      return JSON.parse(dados);
    } catch (erro) {
      console.error(
        'Erro ao carregar produtos do localStorage:',
        erro
      );

      return [];
    }
  }

  static temProdutosSalvos(): boolean {
    return (
      localStorage.getItem(StorageService.CHAVE_PRODUTOS) !== null
    );
  }

  static salvarVendas(vendas: RegistroVenda[]): void {
    localStorage.setItem(
      StorageService.CHAVE_VENDAS,
      JSON.stringify(vendas)
    );
  }

  static carregarVendas(): RegistroVenda[] {
    const dados = localStorage.getItem(
      StorageService.CHAVE_VENDAS
    );

    if (!dados) return [];

    try {
      return JSON.parse(dados);
    } catch (erro) {
      console.error(
        'Erro ao carregar vendas do localStorage:',
        erro
      );

      return [];
    }
  }
}
