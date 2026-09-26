# Cardápio Digital --- Sistema de Gestão de Vendas

Projeto desenvolvido em **TypeScript**, utilizando conceitos de
**Programação Orientada a Objetos (POO)**. O sistema mantém o cardápio
dinâmico da Sprint 1 e acrescenta, na Sprint 2, carrinho, vendas, painel
administrativo, encapsulamento, herança, polimorfismo, interfaces e
membros estáticos.

## Funcionalidades

O cliente pode visualizar os produtos do cardápio, escolher opções
específicas e adicioná-los ao carrinho. Para os lanches, é possível
escolher os tamanhos P, M ou G. Para as bebidas, é possível escolher sem
gelo ou com gelo.

O administrador pode entrar na área de gestão, cadastrar e excluir
produtos, visualizar pedidos pendentes e finalizar vendas. Quando uma
venda é finalizada, seu valor é acrescentado ao faturamento acumulado e
seu registro é salvo.

## Estrutura do projeto

```text
cardapio-digital2/
├── index.html
├── style.css
├── tsconfig.json
├── readme.md
├── src/
│   ├── app.ts
│   ├── models.ts
│   ├── storageService.ts
│   └── data/
│       └── produtosIniciais.ts
└── dist/
    ├── app.js
    ├── models.js
    ├── storageService.js
    └── data/
        └── produtosIniciais.js
```

Os arquivos `.ts` dentro de `src` são os arquivos-fonte do projeto. Os
arquivos `.js` de `dist` são gerados pela compilação do TypeScript.

## Organização das classes

### ProdutoRenderizavel

Interface que define o contrato básico dos produtos. Um produto
renderizável possui `id`, `nome` e os métodos `calcularPrecoFinal()` e
`gerarHTML()`.

### Produto

Classe abstrata que implementa `ProdutoRenderizavel` e reúne os dados
comuns aos produtos, como identificador, nome, preço-base e imagem. O
`id` é `readonly`.

Os métodos `calcularPrecoFinal()` e `gerarHTML()` são abstratos e devem
ser implementados pelas classes filhas.

### Bebida

Classe que herda de `Produto`.

A bebida pode ser escolhida:

- sem gelo: mantém o preço-base;
- com gelo: acrescenta **R\$ 1,00** ao preço-base.

A própria classe implementa `calcularPrecoFinal()` e `gerarHTML()`.

### Lanche

Classe que herda de `Produto`.

O preço depende do tamanho escolhido:

- P: preço-base menos **R\$ 2,00**;
- M: mantém o preço-base;
- G: preço-base mais **R\$ 5,00**.

A própria classe implementa `calcularPrecoFinal()` e `gerarHTML()`.

### Cardapio

Classe responsável por gerenciar a coleção de produtos do cardápio.

Ela centraliza operações como definir a lista de produtos, adicionar,
remover, procurar um produto pelo `id`, consultar os produtos
disponíveis e obter a quantidade cadastrada.

Assim, o `app.ts` não precisa manipular diretamente o array interno do
cardápio.

### Carrinho

Responsável pelos itens escolhidos pelo cliente.

Sua lista de itens é `private readonly`, evitando acesso direto pela
interface. A classe possui métodos controlados para adicionar produtos,
alterar quantidades, remover itens e limpar o carrinho.

O total é calculado chamando `calcularPrecoFinal()` dos produtos.

### Venda

Representa uma venda do sistema.

A lista de produtos é `private readonly`, e os produtos são incluídos
por meio do método `adicionar()`. Depois que a venda é finalizada, novos
produtos não podem ser adicionados.

O getter `total` calcula o valor da venda a partir do preço final de
cada produto.

A classe também possui o membro `static` responsável pelo faturamento
acumulado. O faturamento aumenta quando `finalizar()` é executado.

### StorageService

Responsável pela persistência no `localStorage`.

O sistema salva:

- produtos cadastrados no cardápio;
- vendas finalizadas.

Ao carregar a aplicação, os produtos salvos são reconstruídos como
objetos `Bebida` ou `Lanche`. As vendas finalizadas são recuperadas e
seus totais são utilizados para reconstruir o faturamento acumulado.

Os pedidos ainda pendentes permanecem apenas durante a sessão e não são
persistidos.

## Produtos iniciais

Quando ainda não existem produtos salvos no navegador, o sistema utiliza
os produtos definidos em `produtosIniciais.ts`.

O projeto possui quatro produtos iniciais criados diretamente pelo
código TypeScript:

- Suco de Laranja;
- Refrigerante Lata;
- X-Salada Especial;
- Super X-Tudo.

Não é utilizado um arquivo JSON externo como fonte dos produtos.
`JSON.stringify()` e `JSON.parse()` aparecem apenas para serializar e
recuperar informações armazenadas no `localStorage`.

## Programação Orientada a Objetos

### Interface

`ProdutoRenderizavel` define o contrato que deve ser seguido pelos
produtos renderizáveis.

### Herança

`Bebida` e `Lanche` herdam características comuns da classe abstrata
`Produto`.

### Polimorfismo

`Bebida` e `Lanche` possuem o método `calcularPrecoFinal()`, porém cada
classe implementa esse método de forma diferente.

Quando o sistema chama:

```ts
produto.calcularPrecoFinal();
```

o comportamento executado depende do objeto real. Uma `Bebida` utiliza
sua regra de preço e um `Lanche` utiliza sua própria regra, sem que o
cálculo geral precise conhecer todos os detalhes de cada tipo.

### Encapsulamento

Atributos internos são protegidos com `private`, e o acesso ou alteração
acontece por métodos e getters controlados.

### readonly

O `id` do produto é `readonly`. As listas internas de `Carrinho` e
`Venda` também utilizam `readonly` na referência, evitando sua
substituição direta.

### static

O faturamento acumulado pertence à classe `Venda`, e não a uma venda
específica. Por isso é armazenado em um membro `static`.

## Fluxo principal

1.  A aplicação carrega os produtos do `localStorage`.
2.  Se ainda não houver produtos salvos, utiliza `produtosIniciais`.
3.  O `Cardapio` recebe e gerencia os produtos.
4.  Cada produto gera seu próprio card HTML.
5.  O cliente escolhe as opções e adiciona produtos ao `Carrinho`.
6.  Ao enviar o pedido, é criada uma `Venda`.
7.  A venda fica como pedido pendente.
8.  O administrador visualiza o pedido e finaliza a venda.
9.  `Venda.finalizar()` acrescenta o total ao faturamento.
10. A venda finalizada é salva no `localStorage`.
11. Ao recarregar a página, as vendas finalizadas são recuperadas e o
    faturamento é reconstruído.

## Requisitos atendidos

### Sprint 1

- cardápio gerado dinamicamente pelo TypeScript;
- HTML inicial sem produtos escritos manualmente;
- produtos representados por classes;
- quatro produtos iniciais criados por código;
- gerenciamento do cardápio pela classe `Cardapio`;
- persistência dos produtos com `localStorage`;
- cards organizados em grid responsivo.

### Sprint 2

- interface implementada;
- classe-base abstrata `Produto`;
- classes filhas `Bebida` e `Lanche`;
- herança;
- polimorfismo no cálculo de preço e geração dos cards;
- `private`;
- `readonly`;
- `static`;
- classe `Venda`;
- lista interna da venda protegida;
- cálculo do total pelos próprios produtos;
- ação de finalizar venda;
- faturamento acumulado;
- painel administrativo;
- pedidos pendentes e histórico de vendas finalizadas.

## Compilação

Na pasta principal do projeto:

```bash
npx tsc
```

O TypeScript compila os arquivos de `src` e gera os arquivos JavaScript
utilizados pelo navegador em `dist`.

## Observação

O projeto foi mantido propositalmente com uma estrutura simples,
priorizando os conceitos estudados de TypeScript e Programação Orientada
a Objetos.
