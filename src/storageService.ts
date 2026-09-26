import { Produto, Bebida, Lanche } from './models.js';

export class StorageService {
  private static readonly CHAVE_PRODUTOS = 'cardapioProdutos';

  // Salva os produtos no localStorage
  static salvarProdutos(produtos: Produto[]): void {
    const produtosParaSalvar = produtos.map((produto) => {
      // Se o produto for uma Bebida
      if (produto instanceof Bebida) {
        return {
          id: produto.id,
          nome: produto.nome,
          precoBase: produto.precoBase,
          imagemUrl: produto.imagemUrl,
          categoria: 'bebida',
          gelada: produto.estaGelada,
        };
      }

      // Se o produto for um Lanche
      if (produto instanceof Lanche) {
        return {
          id: produto.id,
          nome: produto.nome,
          precoBase: produto.precoBase,
          imagemUrl: produto.imagemUrl,
          categoria: 'lanche',
          tamanho: produto.obterTamanho,
        };
      }

      // Segurança caso exista outro tipo de Produto
      return {
        id: produto.id,
        nome: produto.nome,
        precoBase: produto.precoBase,
        imagemUrl: produto.imagemUrl,
      };
    });

    localStorage.setItem(
      StorageService.CHAVE_PRODUTOS,
      JSON.stringify(produtosParaSalvar)
    );
  }

  // Carrega os dados salvos no localStorage
  static carregarProdutos(): any[] {
    const dados = localStorage.getItem(StorageService.CHAVE_PRODUTOS);

    // Se ainda não existe nada salvo,
    // retorna um array vazio.
    if (!dados) {
      return [];
    }

    try {
      return JSON.parse(dados);
    } catch (erro) {
      console.error('Erro ao carregar produtos do localStorage:', erro);

      return [];
    }
  }

  // Verifica se já existem produtos salvos
  static temProdutosSalvos(): boolean {
    return localStorage.getItem(StorageService.CHAVE_PRODUTOS) !== null;
  }
}
