import { Bebida, Lanche } from './models.js';
export class StorageService {
    static salvarProdutos(produtos) {
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
        localStorage.setItem(StorageService.CHAVE_PRODUTOS, JSON.stringify(produtosParaSalvar));
    }
    static carregarProdutos() {
        const dados = localStorage.getItem(StorageService.CHAVE_PRODUTOS);
        if (!dados)
            return [];
        try {
            return JSON.parse(dados);
        }
        catch (erro) {
            console.error('Erro ao carregar produtos do localStorage:', erro);
            return [];
        }
    }
    static temProdutosSalvos() {
        return (localStorage.getItem(StorageService.CHAVE_PRODUTOS) !== null);
    }
    static salvarVendas(vendas) {
        localStorage.setItem(StorageService.CHAVE_VENDAS, JSON.stringify(vendas));
    }
    static carregarVendas() {
        const dados = localStorage.getItem(StorageService.CHAVE_VENDAS);
        if (!dados)
            return [];
        try {
            return JSON.parse(dados);
        }
        catch (erro) {
            console.error('Erro ao carregar vendas do localStorage:', erro);
            return [];
        }
    }
}
StorageService.CHAVE_PRODUTOS = 'cardapioProdutos';
StorageService.CHAVE_VENDAS = 'vendasFinalizadas';
